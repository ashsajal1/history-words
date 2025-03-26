<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Imported Words</h2>
    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="words.length === 0" class="text-gray-500">No words found</div>
    <div v-else class="grid gap-4">
      <div v-for="word in words" :key="word.id" 
           class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold">{{ word.en }} - {{ word.bn }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Battle: {{ word.battle }}</p>
          </div>
        </div>
        <div class="mt-2">
          <p class="text-sm">{{ word.sentence }}</p>
          <p class="text-sm mt-1">{{ word.bnSentence }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Word {
  id: number;
  battle: string;
  en: string;
  bn: string;
  sentence: string;
  bnSentence: string;
}

const words = ref<Word[]>([]);
const loading = ref(true);

const getWordsFromDB = async () => {
  const DB_NAME = 'historyWordsDB';
  const STORE_NAME = 'words';

  try {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    const result = await new Promise<Word[]>((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    words.value = result;
  } catch (error) {
    console.error('Error fetching words:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getWordsFromDB();
});
</script>