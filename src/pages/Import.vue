<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold">Import JSON</h1>
    <p class="text-gray-500">Import your JSON file here</p>
    <input type="file" accept=".json" @change="onFileChange" />
  </div>
</template>

<script setup lang="ts">
const onFileChange = (e: InputEvent) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result as string;
    if (text) {
      const data = JSON.parse(text);
      console.log(data);
    }
  };
  reader.readAsText(file);
};
</script>
