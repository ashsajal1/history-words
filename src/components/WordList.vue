<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Imported Words</h2>
      <Button
        @click="handleDeleteDuplicates"
        :loading="deletingDuplicates"
        severity="danger"
        class="p-button-sm"
      >
        Delete Duplicates
      </Button>
    </div>

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

    <div v-if="loading && !words.length" class="text-gray-500">Loading...</div>
    <div v-else-if="!filteredWords.length" class="text-gray-500">
      No words found
    </div>
    <div v-else class="grid gap-4">
      <!-- Debug info -->
      <div class="text-sm text-gray-500 mb-2">
        Showing {{ words.length }} of {{ totalWords }} words
      </div>

      <!-- Word cards -->
      <WordCard
        v-for="(word, index) in filteredWords"
        :key="word.id || index"
        :word="word"
      />

      <!-- Load More Button -->
      <div v-if="hasMore" class="flex justify-center mt-4">
        <Button
          @click="loadMore"
          :loading="loadingMore"
          class="p-button-outlined"
        >
          Load More
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import Select from "primevue/select";
import Button from "primevue/button";
import WordCard from "./WordCard.vue";
import {
  getWordsByPage,
  getAllBattles,
  deleteDuplicateWords,
} from "../services/dbService";

// Add Battle interface
interface Battle {
  id?: number;
  name: string;
}

interface Word {
  id?: number;
  battle: string;
  en: string;
  bn: string;
  sentence: string;
  bnSentence: string;
}

const words = ref<Word[]>([]);
const battles = ref<Battle[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const selectedBattle = ref<Battle | null>(null);
const deletingDuplicates = ref(false);
const currentPage = ref(1);
const hasMore = ref(false);
const totalWords = ref(0);

const handleDeleteDuplicates = async () => {
  try {
    deletingDuplicates.value = true;
    await deleteDuplicateWords();
    // Reset pagination and refresh
    currentPage.value = 1;
    await loadWords();
  } catch (error) {
    console.error("Error deleting duplicates:", error);
  } finally {
    deletingDuplicates.value = false;
  }
};

const loadWords = async (append = false) => {
  try {
    if (!append) {
      loading.value = true;
    } else {
      loadingMore.value = true;
    }

    const result = await getWordsByPage(
      currentPage.value,
      10,
      selectedBattle.value?.name
    );

    if (append) {
      words.value = [...words.value, ...result.words];
    } else {
      words.value = result.words;
    }

    hasMore.value = result.hasMore;
    totalWords.value = result.total;
  } catch (error) {
    console.error("Error fetching words:", error);
    if (!append) {
      words.value = [];
    }
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMore = async () => {
  if (hasMore.value) {
    currentPage.value++;
    await loadWords(true);
  }
};

// Watch for battle selection changes
watch(selectedBattle, async () => {
  currentPage.value = 1; // Reset to first page
  await loadWords();
});

// Transform battles into options format
const battleOptions = computed(() => {
  return battles.value.map((battle) => ({
    name: battle.name,
    code: battle.name.toLowerCase().replace(/\s+/g, "_"),
  }));
});

// Update filteredWords computed property
const filteredWords = computed(() => words.value);

// Add function to fetch battles
const loadBattles = async () => {
  try {
    const battlesList = await getAllBattles();
    battles.value = battlesList;
  } catch (error) {
    console.error("Error fetching battles:", error);
    battles.value = [];
  }
};

// Update onMounted to fetch both words and battles
onMounted(async () => {
  await Promise.all([loadWords(), loadBattles()]);
});
</script>
