const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Word = require('./models/word');
const translatte = require('translatte');
require('dotenv').config();

const dbKey = process.env.dbKey;
const app = express();

app.use(bodyParser.json());
app.use(cors({ origin: '*' }));
mongoose.connect(dbKey, {
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

const upload = multer({ dest: 'uploads/' });
const translateText = async (text, to) => {
    try {
        const result = await translatte(text, { to });
        return result.text;
    } catch (error) {
        return '';
    }
};

// Function to check vocabulary correctness
const checkVocabulary = async (text, lang) => {
    try {
        const result = await translatte(text, { from: lang, to: 'en' });
        return result.from.language.iso === lang && result.from.text.autoCorrected === false && result.from.text.didYouMean === false;
    } catch (error) {
        return false;
    }
};

app.get('/words', async (req, res) => {
    try {
        const { page = 1, limit = 10, sortKey = 'word', sortOrder = 'asc' } = req.query;
        const sortOptions = {
            [sortKey]: sortOrder === 'asc' ? 1 : -1
        };

        const words = await Word.find()
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const total = await Word.countDocuments();
        res.json({
            words,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching words', error });
    }
});

const validateTranslations = (translations) => {
    const seenLanguages = new Set();
    for (const [lang, text] of Object.entries(translations)) {
        if (seenLanguages.has(lang)) {
            throw new Error(`Duplicate language entry: ${lang}`);
        }
        seenLanguages.add(lang);
    }
};

app.post('/words', async (req, res) => {
    try {
        let { word, word2, word3, translations } = req.body;
        translations = translations || {};

        validateTranslations(translations);

        if (!word && word2) word = await translateText(word2, 'en');
        if (!word && word3) word = await translateText(word3, 'en');
        if (!word2 && word) word2 = await translateText(word, 'fr');
        if (!word2 && word3) word2 = await translateText(word3, 'fr');
        if (!word3 && word) word3 = await translateText(word, 'vi');
        if (!word3 && word2) word3 = await translateText(word2, 'vi');

        // Check vocabulary correctness
        const isWordCorrect = await checkVocabulary(word, 'en');
        const isWord2Correct = await checkVocabulary(word2, 'fr');
        const isWord3Correct = await checkVocabulary(word3, 'vi');

        if (!isWordCorrect || !isWord2Correct || !isWord3Correct) {
            return res.status(400).json({ message: 'One or more words are incorrect' });
        }

        // Translate missing custom translations
        for (const [lang, text] of Object.entries(translations)) {
            if (!text && word) translations[lang] = await translateText(word, lang);
        }

        if (!word || !word2 || !word3) {
            return res.status(400).json({ message: 'Unable to translate required fields', translations });
        }

        const newWord = new Word({ word, word2, word3, translations });
        await newWord.save();
        res.json(newWord);
    } catch (error) {
        res.status(500).json({ message: 'Error saving word', error: error.message });
    }
});

app.put('/words/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let { word, word2, word3, translations } = req.body;
        translations = translations || {};

        validateTranslations(translations);

        if (!word && word2) word = await translateText(word2, 'en');
        if (!word && word3) word = await translateText(word3, 'en');
        if (!word2 && word) word2 = await translateText(word, 'fr');
        if (!word2 && word3) word2 = await translateText(word3, 'fr');
        if (!word3 && word) word3 = await translateText(word, 'vi');
        if (!word3 && word2) word3 = await translateText(word2, 'vi');

        // Check vocab
        const isWordCorrect = await checkVocabulary(word, 'en');
        const isWord2Correct = await checkVocabulary(word2, 'fr');
        const isWord3Correct = await checkVocabulary(word3, 'vi');

        if (!isWordCorrect || !isWord2Correct || !isWord3Correct) {
            return res.status(400).json({ message: 'One or more words are incorrect' });
        }

        // Translate missing custom translations
        for (const [lang, text] of Object.entries(translations)) {
            if (!text && word) translations[lang] = await translateText(word, lang);
        }

        if (!word || !word2 || !word3) {
            return res.status(400).json({ message: 'Unable to translate required fields', translations });
        }

        const updatedWord = await Word.findByIdAndUpdate(id, { word, word2, word3, translations }, { new: true });
        res.json(updatedWord);
    } catch (error) {
        res.status(500).json({ message: 'Error updating word', error: error.message });
    }
});

app.delete('/words/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Word.findByIdAndDelete(id);
        res.json({ message: 'Word deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting word', error });
    }
});

app.post('/upload-csv', upload.single('file'), (req, res) => {
    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                const bulkOps = results.map((word) => ({
                    updateOne: {
                        filter: { word: word.word },
                        update: { $set: { word: word.word, word2: word.word2, word3: word.word3 } },
                        upsert: true
                    }
                }));
                await Word.bulkWrite(bulkOps);
                fs.unlinkSync(req.file.path); // Remove the uploaded file
                res.json({ message: 'CSV file processed successfully', results });
            } catch (error) {
                res.status(500).json({ message: 'Error processing CSV file', error });
            }
        });
});

app.get('/search', async (req, res) => {
    try {
        const { keyword, page = 1, limit = 10 } = req.query;
        const regex = new RegExp(keyword, 'i'); // 'i' case-insensitive

        // Search by word, word2, word3,translation
        const query = {
            $or: [
                { word: regex },
                { word2: regex },
                { word3: regex },
                { 'translations.$*': regex }
            ]
        };
        const words = await Word.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const total = await Word.countDocuments(query);

        res.json({
            words,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error searching words', error });
    }
});

app.get('/words/:id', async (req, res) => {
    try {
        const word = await Word.findById(req.params.id);
        if (!word) {
            return res.status(404).json({ message: 'Word not found' });
        }
        res.json(word);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching word', error });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
