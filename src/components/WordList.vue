<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Imported Words</h2>

    <!-- Battle Filter -->
    <div class="mb-4">
      <Select
        v-model="selectedBattle"
        :options="battleOptions"
        filter
        optionLabel="name"
        placeholder="Select a Battle"
        class="w-full md:w-56"
      >
        <template #value="slotProps">
          <div v-if="slotProps.value" class="flex items-center">
            <div>{{ slotProps.value.name }}</div>
          </div>
          <span v-else>
            {{ slotProps.placeholder }}
          </span>
        </template>
        <template #option="slotProps">
          <div class="flex items-center">
            <div>{{ slotProps.option.name }}</div>
          </div>
        </template>
      </Select>
    </div>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="!filteredWords.length" class="text-gray-500">
      No words found
    </div>
    <div v-else class="grid gap-4">
      <!-- Debug info -->
      <div class="text-sm text-gray-500 mb-2">
        Total words: {{ filteredWords.length }}
      </div>

      <!-- Word cards -->
      <WordCard
        v-for="(word, index) in filteredWords"
        :key="index"
        :word="word"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import Select from "primevue/select";
import WordCard from "./WordCard.vue";

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
const selectedBattle = ref(null);

// Watch for changes in words array
watch(
  words,
  (newWords) => {
    console.log("Words updated:", newWords);
  },
  { deep: true }
);

// Compute unique battles from words
const battles = computed(() => {
  const uniqueBattles = new Set(words.value.map((word) => word.battle));
  return Array.from(uniqueBattles).sort();
});

// Transform battles into options format
const battleOptions = computed(() => {
  return battles.value.map((battle) => ({
    name: battle,
    code: battle.toLowerCase().replace(/\s+/g, "_"),
  }));
});

// Filter words based on selected battle
const filteredWords = computed(() => {
  if (!selectedBattle.value) return words.value;
  return words.value.filter(
    (word) => word.battle === selectedBattle.value.name
  );
});

const getWordsFromDB = async () => {
  const DB_NAME = "historyWordsDB";
  const STORE_NAME = "words";

  try {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    const result = await new Promise<Word[]>((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const rawData = request.result;
        console.log("Raw IndexedDB result:", rawData);

        // Flatten the nested array structure
        let flattenedData: Word[];
        if (
          Array.isArray(rawData) &&
          rawData.length === 1 &&
          Array.isArray(rawData[0])
        ) {
          flattenedData = rawData[0];
        } else if (Array.isArray(rawData)) {
          flattenedData = rawData;
        } else {
          flattenedData = [];
        }

        console.log("Flattened data:", flattenedData);
        resolve(flattenedData);
      };
    });

    words.value = result;
    console.log("Words after assignment:", words.value);
  } catch (error) {
    console.error("Error fetching words:", error);
    words.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getWordsFromDB();
});
</script>
