<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold">Import JSON</h1>
    <p class="text-gray-500">Import your JSON file here</p>
    <InputText type="file" accept=".json" @change="onFileChange" />
    <p
      v-if="message"
      :class="{ 'text-green-500': !isError, 'text-red-500': isError }"
      class="mt-2"
    >
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import InputText from 'primevue/inputtext';
import { saveToIndexedDB } from "../services/dbService";

interface Word {
  id: number;
  battle: string;
  en: string;
  bn: string;
  sentence: string;
  bnSentence: string;
}

const message = ref("");
const isError = ref(false);

const validateWordData = (data: any): data is Word[] => {
  if (!Array.isArray(data)) return false;
  
  return data.every(item => 
    typeof item.id === 'number' &&
    typeof item.battle === 'string' &&
    typeof item.en === 'string' &&
    typeof item.bn === 'string' &&
    typeof item.sentence === 'string' &&
    typeof item.bnSentence === 'string'
  );
};

const onFileChange = async (e: InputEvent) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  try {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (text) {
        const data = JSON.parse(text);
        
        if (!validateWordData(data)) {
          message.value = "Error: Invalid data format. Please check your JSON structure.";
          isError.value = true;
          return;
        }

        await saveToIndexedDB(data);
        message.value = "Data imported successfully!";
        isError.value = false;
        target.value = ""; // Reset the input
      }
    };
    reader.readAsText(file);
  } catch (error) {
    message.value = `Error: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
    isError.value = true;
  }
};
</script>
