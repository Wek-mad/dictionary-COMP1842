<template>
  <div>
    <form @submit.prevent="onSubmit">
      <div>
        <label for="word">English:</label>
        <input v-model="form.word" id="word" class="border rounded p-2" />
      </div>
      <div>
        <label for="word2">French:</label>
        <input v-model="form.word2" id="word2" class="border rounded p-2" />
      </div>
      <div>
        <label for="word3">Vietnamese:</label>
        <input v-model="form.word3" id="word3" class="border rounded p-2" />
      </div>

      <div v-for="(value, key) in additionalTranslations" :key="key">
        <label :for="key">{{ languageMap[key] }}:</label>
        <input v-model="additionalTranslations[key]" :id="key" class="border rounded p-2" />
      </div>

      <div>
        <label for="newLang">Add Language:</label>
        <select v-model="newLang" id="newLang" class="border rounded p-2">
          <option v-for="(name, code) in languageMap" :key="code" :value="code">{{ name }}</option>
        </select>
        <button type="button" @click="addLanguage" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">Add</button>
      </div>

      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">
        {{ props.initialWord ? 'Update Word' : 'Add Word' }}
      </button>
    </form>
  </div>
</template>
<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';
import languageMap from './languageMap';

const props = defineProps(['initialWord']);
const emit = defineEmits(['update-word', 'add-word']);

const form = ref({
  word: props.initialWord?.word || '',
  word2: props.initialWord?.word2 || '',
  word3: props.initialWord?.word3 || '',
  translations: props.initialWord?.translations || {}
});

const additionalTranslations = ref({ ...props.initialWord?.translations });
const newLang = ref('');

const onSubmit = () => {
  const wordData = { ...form.value, translations: additionalTranslations.value };
  if (props.initialWord) {
    emit('update-word', { ...props.initialWord, ...wordData });
  } else {
    emit('add-word', wordData);
  }
  resetForm();
};

const addLanguage = () => {
  if (newLang.value && !additionalTranslations.value[newLang.value]) {
    additionalTranslations.value[newLang.value] = '';
  }
  newLang.value = '';
};

const resetForm = () => {
  form.value.word = '';
  form.value.word2 = '';
  form.value.word3 = '';
  additionalTranslations.value = {};
};

watch(props, (newProps) => {
  if (newProps.initialWord) {
    form.value.word = newProps.initialWord.word;
    form.value.word2 = newProps.initialWord.word2;
    form.value.word3 = newProps.initialWord.word3;
    additionalTranslations.value = { ...newProps.initialWord.translations };
  } else {
    resetForm();
  }
});
</script>
