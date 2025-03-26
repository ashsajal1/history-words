<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Imported Words</h2>
    
    <!-- Battle Filter -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Filter by Battle:
      </label>
      <select 
        v-model="selectedBattle"
        class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
      >
        <option value="">All Battles</option>
        <option v-for="battle in battles" :key="battle" :value="battle">
          {{ battle }}
        </option>
      </select>
    </div>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="!filteredWords.length" class="text-gray-500">No words found</div>
    <div v-else class="grid gap-4">
      <!-- Debug info -->
      <div class="text-sm text-gray-500 mb-2">
        Total words: {{ filteredWords.length }}
      </div>
      
      <!-- Word cards -->
      <div v-for="(word, index) in filteredWords" :key="index" 
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
import { ref, onMounted, watch, computed } from 'vue';

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
const selectedBattle = ref('');

// Watch for changes in words array
watch(words, (newWords) => {
  console.log('Words updated:', newWords);
}, { deep: true });

// Compute unique battles from words
const battles = computed(() => {
  const uniqueBattles = new Set(words.value.map(word => word.battle));
  return Array.from(uniqueBattles).sort();
});

// Filter words based on selected battle
const filteredWords = computed(() => {
  if (!selectedBattle.value) return words.value;
  return words.value.filter(word => word.battle === selectedBattle.value);
});

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
      request.onsuccess = () => {
        const rawData = request.result;
        console.log('Raw IndexedDB result:', rawData);
        
        // Flatten the nested array structure
        let flattenedData: Word[];
        if (Array.isArray(rawData) && rawData.length === 1 && Array.isArray(rawData[0])) {
          flattenedData = rawData[0];
        } else if (Array.isArray(rawData)) {
          flattenedData = rawData;
        } else {
          flattenedData = [];
        }
        
        console.log('Flattened data:', flattenedData);
        resolve(flattenedData);
      }
    });

    words.value = result;
    console.log('Words after assignment:', words.value);
  } catch (error) {
    console.error('Error fetching words:', error);
    words.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getWordsFromDB();
});
</script>