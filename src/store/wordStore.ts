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

interface BattleState {
  page: number;
  hasMore: boolean;
  words: Word[];
}

export const useWordStore = defineStore("words", () => {
  // State
  const words = ref<Word[]>([]);
  const battles = ref<Battle[]>([]);
  const selectedBattle = ref<Battle | null>(null);
  const loading = ref(false);
  const loadingMore = ref(false);
  const totalWords = ref(0);

  // New state for battle pagination
  const battlePages = ref<Record<string, BattleState>>({});
  const currentPage = computed(() => {
    if (!selectedBattle.value) return 1;
    return battlePages.value[selectedBattle.value.name]?.page || 1;
  });

  const hasMore = computed(() => {
    if (!selectedBattle.value) {
      return battlePages.value["global"]?.hasMore || false;
    }
    return battlePages.value[selectedBattle.value.name]?.hasMore || false;
  });

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

      const battleKey = selectedBattle.value?.name || "global";
      const page = append ? (battlePages.value[battleKey]?.page || 1) + 1 : 1;

      const result = await getWordsByPage(page, 10, selectedBattle.value?.name);

      // Update battle state
      battlePages.value[battleKey] = {
        page,
        hasMore: result.hasMore,
        words: append
          ? [...(battlePages.value[battleKey]?.words || []), ...result.words]
          : result.words,
      };

      // Update current view
      words.value = battlePages.value[battleKey].words;
      totalWords.value = result.total;
    } catch (error) {
      console.error("Error fetching words:", error);
      if (!append) {
        const battleKey = selectedBattle.value?.name || "global";
        battlePages.value[battleKey] = {
          page: 1,
          hasMore: false,
          words: [],
        };
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
      const battleKey = selectedBattle.value?.name || "global";
      battlePages.value[battleKey].page++;
      await loadWords(true);
    }
  };

  const deleteDuplicates = async () => {
    try {
      await deleteDuplicateWords();
      const battleKey = selectedBattle.value?.name || "global";
      battlePages.value[battleKey] = {
        page: 1,
        hasMore: false,
        words: [],
      };
      await loadWords();
    } catch (error) {
      console.error("Error deleting duplicates:", error);
      throw error;
    }
  };

  const selectBattle = async (battle: Battle | null) => {
    selectedBattle.value = battle;
    const battleKey = battle?.name || "global";

    // If we already have data for this battle, use it
    if (battlePages.value[battleKey]) {
      words.value = battlePages.value[battleKey].words;
    } else {
      // Otherwise load fresh data
      await loadWords();
    }
  };

  const reset = () => {
    words.value = [];
    battlePages.value = {};
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
    totalWords,
    battlePages,

    // Getters
    battleOptions,
    filteredWords,
    currentPage,
    hasMore,

    // Actions
    loadWords,
    loadBattles,
    loadMore,
    deleteDuplicates,
    selectBattle,
    reset,
  };
});
