import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  getWordsByPage,
  getAllBattles,
  deleteDuplicateWords,
} from "../services/dbService";

interface Word {
  id?: number;
  battle: string;
  en: string;
  bn: string;
  sentence: string;
  bnSentence: string;
}

interface Battle {
  id?: number;
  name: string;
}

export const useWordStore = defineStore("words", () => {
  // State
  const words = ref<Word[]>([]);
  const battles = ref<Battle[]>([]);
  const selectedBattle = ref<Battle | null>(null);
  const loading = ref(false);
  const loadingMore = ref(false);
  const currentPage = ref(1);
  const hasMore = ref(false);
  const totalWords = ref(0);

  // Getters
  const battleOptions = computed(() => {
    return battles.value.map((battle) => ({
      name: battle.name,
      code: battle.name.toLowerCase().replace(/\s+/g, "_"),
    }));
  });

  const filteredWords = computed(() => words.value);

  // Actions
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

  const loadBattles = async () => {
    try {
      const battlesList = await getAllBattles();
      battles.value = battlesList;
    } catch (error) {
      console.error("Error fetching battles:", error);
      battles.value = [];
    }
  };

  const loadMore = async () => {
    if (hasMore.value) {
      currentPage.value++;
      await loadWords(true);
    }
  };

  const deleteDuplicates = async () => {
    try {
      await deleteDuplicateWords();
      currentPage.value = 1;
      await loadWords();
    } catch (error) {
      console.error("Error deleting duplicates:", error);
      throw error;
    }
  };

  const selectBattle = async (battle: Battle | null) => {
    selectedBattle.value = battle;
    currentPage.value = 1;
    await loadWords();
  };

  const reset = () => {
    words.value = [];
    currentPage.value = 1;
    hasMore.value = false;
    totalWords.value = 0;
    selectedBattle.value = null;
  };

  return {
    // State
    words,
    battles,
    selectedBattle,
    loading,
    loadingMore,
    hasMore,
    totalWords,

    // Getters
    battleOptions,
    filteredWords,

    // Actions
    loadWords,
    loadBattles,
    loadMore,
    deleteDuplicates,
    selectBattle,
    reset,
  };
});
