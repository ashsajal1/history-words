<template>
  <div class="container mx-auto p-4">
    <div v-if="!hasBattles" class="text-center">
      <h2 class="text-2xl font-bold mb-4">Welcome to History Words!</h2>
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        It looks like you don't have any battles yet. Would you like to add sample words
        from the Battle of Yarmouk?
      </p>
      <Button
        label="Add Sample Battle"
        icon="pi pi-plus"
        @click="addSampleBattle"
        :loading="loading"
        class="p-button-primary"
      />
    </div>
    <Worldlist v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Worldlist from "../components/WordList.vue";
import { useWordStore } from "../store/wordStore";
import Button from "primevue/button";

const wordStore = useWordStore();
const hasBattles = ref(false);
const loading = ref(false);

const sampleWords = [
  {
    battle: "Battle of Yarmouk",
    en: "Caliphate",
    bn: "খিলাফত",
    sentence: "The Rashidun Caliphate expanded rapidly after the Battle of Yarmouk.",
    bnSentence: "ইয়ারমুকের যুদ্ধের পর রাশিদুন খিলাফত দ্রুত প্রসারিত হয়েছিল।",
  },
  {
    battle: "Battle of Yarmouk",
    en: "Byzantine",
    bn: "বাইজেন্টাইন",
    sentence: "The Byzantine Empire suffered a major defeat at Yarmouk.",
    bnSentence: "ইয়ারমুকে বাইজেন্টাইন সাম্রাজ্য একটি বড় পরাজয়ের সম্মুখীন হয়েছিল।",
  },
  {
    battle: "Battle of Yarmouk",
    en: "Muslim",
    bn: "মুসলিম",
    sentence: "The Muslim forces were led by Khalid ibn al-Walid.",
    bnSentence: "মুসলিম বাহিনী খালিদ ইবনে আল-ওয়ালিদের নেতৃত্বে ছিল।",
  },
  {
    battle: "Battle of Yarmouk",
    en: "Syria",
    bn: "সিরিয়া",
    sentence: "The Battle of Yarmouk took place in Syria in 636 CE.",
    bnSentence: "ইয়ারমুকের যুদ্ধ ৬৩৬ খ্রিস্টাব্দে সিরিয়ায় সংঘটিত হয়েছিল।",
  },
  {
    battle: "Battle of Yarmouk",
    en: "Heraclius",
    bn: "হেরাক্লিয়াস",
    sentence: "Emperor Heraclius was the Byzantine ruler during the battle.",
    bnSentence: "সম্রাট হেরাক্লিয়াস যুদ্ধের সময় বাইজেন্টাইনের শাসক ছিলেন।",
  },
];

const addSampleBattle = async () => {
  try {
    loading.value = true;
    // Add the battle first
    const battle = {
      name: "Battle of Yarmouk",
    };

    // Add sample words
    for (const word of sampleWords) {
      await wordStore.addWord(word);
    }

    // Reload battles
    await wordStore.loadBattles();
    hasBattles.value = true;
  } catch (error) {
    console.error("Error adding sample battle:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await wordStore.loadBattles();
  hasBattles.value = wordStore.battles.length > 0;
});
</script>

<style scoped>
.p-button {
  @apply px-4 py-2 rounded-lg;
}
</style>
