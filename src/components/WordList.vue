<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Imported Words</h2>
      <Button
        @click="handleDeleteDuplicates"
        :loading="store.loading"
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
        :options="store.battleOptions"
        filter
        optionLabel="name"
        placeholder="Select a Battle"
        class="w-full md:w-56"
        @change="(event) => handleBattleChange(event.value)"
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

    <div v-if="store.loading && !store.words.length" class="text-gray-500">
      Loading...
    </div>
    <div v-else-if="!filteredWords.length" class="text-gray-500">No words found</div>
    <div v-else class="grid gap-4">
      <!-- Debug info -->
      <div class="text-sm text-gray-500 mb-2">
        Showing {{ filteredWords.length }} of {{ store.totalWords }} words
      </div>

      <!-- Word cards -->
      <WordCard
        v-for="(word, index) in filteredWords"
        :key="word.id || index"
        :word="word"
      />

      <!-- Load More Button - only show when no battle is selected -->
      <div class="flex justify-center mt-4">
        <Button
          @click="store.loadMore"
          :loading="store.loadingMore"
          class="p-button-outlined"
        >
          Load More
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Select from "primevue/select";
import Button from "primevue/button";
import WordCard from "./WordCard.vue";
import { useWordStore } from "../store/wordStore";

const store = useWordStore();
const selectedBattle = ref<{ name: string; code: string } | null>(null);

// Local computed property for filtered words
const filteredWords = computed(() => {
  if (!selectedBattle.value) {
    return store.words;
  }
  return store.words.filter((word) => word.battle === selectedBattle.value?.name);
});

const handleBattleChange = (battle: { name: string; code: string } | null) => {
  selectedBattle.value = battle;
  store.selectBattle(battle);
};

const handleDeleteDuplicates = async () => {
  try {
    await store.deleteDuplicates();
  } catch (error) {
    console.error("Error deleting duplicates:", error);
  }
};

// Initialize data on component mount
onMounted(async () => {
  if (!store.words.length) await Promise.all([store.loadWords(), store.loadBattles()]);
});
</script>
