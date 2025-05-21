<template>
  <div class="p-4 max-w-2xl mx-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <!-- Header Section -->
      <div class="text-center mb-8">
        <Upload :size="48" class="mx-auto mb-4 text-primary-500" />
        <h1 class="text-2xl font-bold mb-2 dark:text-white">Import Words</h1>
        <p class="text-gray-600 dark:text-gray-400">
          Import your historical battle words from a JSON file
        </p>
      </div>

      <!-- File Upload Section -->
      <div
        class="border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200"
        :class="{
          'border-gray-300 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500': !isDragging,
          'border-primary-500 bg-primary-50 dark:bg-primary-900/20': isDragging,
        }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <div class="space-y-4">
          <div class="flex flex-col items-center gap-2">
            <FileJson :size="32" class="text-gray-400" />
            <p class="text-gray-600 dark:text-gray-400">
              Drag and drop your JSON file here, or
            </p>
          </div>
          <div class="relative">
            <input
              type="file"
              accept=".json"
              class="hidden"
              ref="fileInput"
              @change="onFileChange"
            />
            <Button
              label="Browse Files"
              icon="pi pi-upload"
              @click="$refs.fileInput.click()"
              class="p-button-outlined"
            />
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Supported format: JSON file with word data
          </p>
        </div>
      </div>

      <!-- File Info Section -->
      <div v-if="selectedFile" class="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <FileJson :size="24" class="text-gray-500" />
            <div>
              <p class="font-medium dark:text-white">{{ selectedFile.name }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ formatFileSize(selectedFile.size) }}
              </p>
            </div>
          </div>
          <Button
            icon="pi pi-times"
            class="p-button-rounded p-button-text p-button-danger"
            @click="clearFile"
          />
        </div>
      </div>

      <!-- Status Message -->
      <div
        v-if="message"
        class="mt-6 p-4 rounded-lg flex items-center gap-3"
        :class="{
          'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400': !isError,
          'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400': isError,
        }"
      >
        <CheckCircle v-if="!isError" :size="20" />
        <AlertCircle v-else :size="20" />
        <p>{{ message }}</p>
      </div>

      <!-- Sample Format Section -->
      <div class="mt-8">
        <h3 class="text-lg font-semibold mb-3 dark:text-white">Expected JSON Format:</h3>
        <pre class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg overflow-x-auto text-sm">
[
  {
    "battle": "Battle Name",
    "en": "English Word",
    "bn": "Bengali Word",
    "sentence": "English Sentence",
    "bnSentence": "Bengali Sentence"
  }
]</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Button from "primevue/button";
import { saveToIndexedDB } from "../services/dbService";
import { AlertCircle, CheckCircle, FileJson, Upload } from "lucide-vue-next";

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
const isDragging = ref(false);
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

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

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  const file = e.dataTransfer?.files[0];
  if (file && file.type === 'application/json') {
    selectedFile.value = file;
    processFile(file);
  } else {
    message.value = "Please drop a valid JSON file";
    isError.value = true;
  }
};

const clearFile = () => {
  selectedFile.value = null;
  message.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const processFile = async (file: File) => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!validateWordData(data)) {
      message.value = "Error: Invalid data format. Please check your JSON structure.";
      isError.value = true;
      return;
    }

    await saveToIndexedDB(data);
    message.value = "Data imported successfully!";
    isError.value = false;
    clearFile();
  } catch (error) {
    message.value = `Error: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
    isError.value = true;
  }
};

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    selectedFile.value = file;
    processFile(file);
  }
};
</script>

<style scoped>
.p-button {
  @apply px-4 py-2 rounded-lg transition-all duration-200;
}

/* Custom scrollbar for dark mode */
.dark ::-webkit-scrollbar {
  @apply w-2;
}

.dark ::-webkit-scrollbar-track {
  @apply bg-gray-800;
}

.dark ::-webkit-scrollbar-thumb {
  @apply bg-gray-600 rounded-full;
}

.dark ::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500;
}

pre {
  @apply font-mono;
}
</style>
