<template>
  <div class="container mx-auto p-6 bg-gray-100 min-h-screen">
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <h1 class="text-4xl font-bold mb-6 text-center text-gray-800">Profile</h1>
      <div class="flex flex-col items-center">
        <img :src="profilePicture" alt="Profile Picture" class="w-32 h-32 rounded-full mb-4" />
        <h2 class="text-2xl font-semibold mb-2">{{ userName }}</h2>
        <p class="text-lg mb-4">{{ userEmail }}</p>
      </div>
    </div>
    
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 class="text-3xl font-bold mb-4">Deployment Architecture</h2>
      <div class="flex justify-center mb-4">
        <img src="@/public/assets/server.png" alt="Deployment Architecture" class="h-auto max-w-lg">
      </div>
      <div class="text-lg leading-relaxed">
        <p>This diagram illustrates the deployment architecture of the application:</p>
        <ul class="list-disc list-inside mb-4">
          <li><strong>Speed (10.10.10.41):</strong> A virtual machine running Rocky Linux 9 that hosts the Node.js backend and Vue.js frontend. Docker and Docker Compose are used for container orchestration, with Watchtower ensuring that containers are automatically updated.</li>
          <li><strong>beep_be (10.10.10.19):</strong> Another virtual machine running Rocky Linux 9 that hosts the Nginx proxy manager and MongoDB. Docker and Docker Compose are used here as well to manage and deploy the services.</li>
        </ul>
        <p>By using this architecture, the application is easily scalable and maintainable, leveraging the benefits of containerization with Docker.</p>
      </div>
    </div>

    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 class="text-3xl font-bold mb-4">Sort Functionality</h2>
      <div class="text-lg leading-relaxed">
        <p>The sorting functionality in this application is implemented to allow users to sort the list of words based on different criteria (English, French, Vietnamese). This is how it works:</p>
        <ul class="list-disc list-inside mb-4">
          <li>When a user clicks on a column header, the application toggles the sort order (ascending/descending) for that column.</li>
          <li>The current sort key and order are maintained in the component state and updated in the URL query parameters.</li>
          <li>These parameters are sent to the backend, which sorts the words accordingly before sending the data back to the frontend.</li>
          <li>The backend uses MongoDB's sorting capabilities to efficiently handle the sorting of large datasets.</li>
        </ul>
        <pre class="bg-gray-200 p-4 rounded-lg"><code>// Backend (server.js)
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

// Frontend (Home.vue)
const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  router.push({ query: { ...route.query, sortKey: sortKey.value, sortOrder: sortOrder.value } });
};</code></pre>
        <p>This approach ensures that the list of words remains sorted according to the user's preference, even after performing actions like adding or deleting words.</p>
      </div>
    </div>

    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-3xl font-bold mb-4">Translation Functionality</h2>
      <div class="text-lg leading-relaxed">
        <p>The translation functionality in this application ensures that words can be translated into multiple languages automatically. Here's how it works:</p>
        <ul class="list-disc list-inside mb-4">
          <li>When adding or updating a word, the application checks if translations are provided. If not, it automatically translates the word into the required languages using the <code>translatte</code> library.</li>
          <li>It validates translations to ensure there are no duplicate language entries.</li>
          <li>The backend handles the translation logic and ensures that all required fields are translated before saving the word to the database.</li>
        </ul>
        <pre class="bg-gray-200 p-4 rounded-lg"><code>// Backend (server.js)
const translateText = async (text, to) => {
    try {
        const result = await translatte(text, { to });
        return result.text;
    } catch (error) {
        return '';
    }
};

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
});</code></pre>
        <p>This method ensures that all necessary translations are provided before saving the word, making the application more robust and user-friendly.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const profilePicture = ref('https://via.placeholder.com/150'); // Placeholder image URL
const userName = ref('Nguyen Vinh Khang');
const userEmail = ref('work@khagek.com');
</script>

<style scoped>
</style>
