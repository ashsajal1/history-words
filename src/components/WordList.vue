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
import { getWordsByBattle } from "../services/dbService";

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

// Watch for changes in selected battle
watch(selectedBattle, async (newBattle) => {
  if (newBattle) {
    try {
      loading.value = true;
      const battleWords = await getWordsByBattle(newBattle.name);
      words.value = battleWords;
    } catch (error) {
      console.error('Error fetching battle words:', error);
      words.value = [];
    } finally {
      loading.value = false;
    }
  } else {
    // When no battle is selected, fetch all words
    getWordsFromDB();
  }
});

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

// Update filteredWords computed property
const filteredWords = computed(() => {
  return words.value;
});

const getWordsFromDB = async () => {
  try {
    loading.value = true;
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("historyWordsDB");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    const transaction = db.transaction("words", "readonly");
    const store = transaction.objectStore("words");
    const request = store.getAll();

    const result = await new Promise<Word[]>((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    words.value = result;
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
