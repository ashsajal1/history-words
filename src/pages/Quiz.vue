<template></template>

<script setup lang="ts">
import { useWordStore } from "../store/wordStore";

const wordStore = useWordStore();
const { words } = wordStore;
console.log(words);
</script>
