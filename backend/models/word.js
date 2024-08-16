const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
    word: { type: String, required: true },
    word2: { type: String, required: true },
    word3: { type: String, required: true },
    translations: {
        type: Map,
        of: String
    }
});

module.exports = mongoose.model('Word', wordSchema);
