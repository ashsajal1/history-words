<template>
  <div class="p-4 max-w-3xl mx-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-8">
        <i class="pi pi-cog text-2xl text-primary-500"></i>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      <!-- Danger Zone -->
      <div
        class="border border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-900/20"
      >
        <div class="flex items-center gap-2 mb-6">
          <i class="pi pi-exclamation-triangle text-xl text-red-500"></i>
          <h2 class="text-xl font-semibold text-red-700 dark:text-red-400">
            Danger Zone
          </h2>
        </div>

        <!-- Delete by Battle -->
        <div class="mb-8">
          <div class="flex items-center gap-2 mb-3">
            <i class="pi pi-swords text-lg text-red-500"></i>
            <h3 class="text-lg font-medium text-red-700 dark:text-red-400">
              Delete Words by Battle
            </h3>
          </div>
          <p class="text-sm text-red-600 dark:text-red-300 mb-4">
            This will permanently delete all words from the selected battle. This action
            cannot be undone.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 items-start">
            <div class="w-full sm:w-64">
              <Select
                v-model="selectedBattle"
                :options="battles"
                optionLabel="name"
                placeholder="Select Battle"
                class="w-full"
                :class="{ 'border-red-500': deleteError }"
              />
              <small v-if="deleteError" class="text-red-500 mt-1 block">{{
                deleteError
              }}</small>
            </div>
            <Button
              @click="handleDeleteBattleWords"
              :loading="deletingBattle"
              severity="danger"
              :disabled="!selectedBattle"
              class="w-full sm:w-auto"
            >
              <i class="pi pi-trash mr-2"></i>
              Delete Battle Words
            </Button>
          </div>
        </div>

        <!-- Delete All Words -->
        <div>
          <div class="flex items-center gap-2 mb-3">
            <i class="pi pi-trash text-lg text-red-500"></i>
            <h3 class="text-lg font-medium text-red-700 dark:text-red-400">
              Delete All Words
            </h3>
          </div>
          <p class="text-sm text-red-600 dark:text-red-300 mb-4">
            This will permanently delete all words from all battles. This action cannot be
            undone.
          </p>
          <div class="flex items-center gap-4">
            <Button
              @click="confirmDeleteAll"
              :loading="deletingAll"
              severity="danger"
              class="w-full sm:w-auto"
            >
              <i class="pi pi-trash mr-2"></i>
              Delete All Words
            </Button>
          </div>
        </div>
      </div>

      <!-- Confirmation Dialog -->
      <Dialog
        v-model:visible="showConfirmDialog"
        modal
        :header="dialogHeader"
        :style="{ width: '450px' }"
        class="dark:bg-gray-800"
      >
        <div class="flex items-center gap-3 mb-4">
          <i class="pi pi-exclamation-triangle text-2xl text-red-500"></i>
          <p class="m-0 text-gray-700 dark:text-gray-300">{{ dialogMessage }}</p>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <Button
              label="Cancel"
              @click="showConfirmDialog = false"
              class="p-button-text"
            />
            <Button
              label="Delete"
              @click="handleConfirm"
              severity="danger"
              :loading="dialogLoading"
            >
              <i class="pi pi-trash mr-2"></i>
            </Button>
          </div>
        </template>
      </Dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Button from "primevue/button";
import Select from "primevue/select";
import Dialog from "primevue/dialog";
import {
  getAllBattles,
  deleteAllWords,
  deleteWordsByBattle,
} from "../services/dbService";

interface Battle {
  id?: number;
  name: string;
}

const battles = ref<Battle[]>([]);
const selectedBattle = ref<Battle | null>(null);
const deletingBattle = ref(false);
const deletingAll = ref(false);
const showConfirmDialog = ref(false);
const dialogLoading = ref(false);
const dialogHeader = ref("");
const dialogMessage = ref("");
const confirmAction = ref<() => Promise<void>>();
const deleteError = ref("");

onMounted(async () => {
  try {
    battles.value = await getAllBattles();
  } catch (error) {
    console.error("Error fetching battles:", error);
    deleteError.value = "Failed to load battles. Please try again.";
  }
});

const handleDeleteBattleWords = () => {
  if (!selectedBattle.value) return;

  dialogHeader.value = "Delete Battle Words";
  dialogMessage.value = `Are you sure you want to delete all words from "${selectedBattle.value.name}"? This action cannot be undone.`;
  confirmAction.value = async () => {
    try {
      deletingBattle.value = true;
      deleteError.value = "";
      await deleteWordsByBattle(selectedBattle.value!.name);
      selectedBattle.value = null;
      // Refresh battles list
      battles.value = await getAllBattles();
    } catch (error) {
      console.error("Error deleting battle words:", error);
      deleteError.value = "Failed to delete words. Please try again.";
    } finally {
      deletingBattle.value = false;
    }
  };
  showConfirmDialog.value = true;
};

const confirmDeleteAll = () => {
  dialogHeader.value = "Delete All Words";
  dialogMessage.value =
    "Are you sure you want to delete all words from all battles? This action cannot be undone.";
  confirmAction.value = async () => {
    try {
      deletingAll.value = true;
      await deleteAllWords();
      // Refresh battles list
      battles.value = await getAllBattles();
    } catch (error) {
      console.error("Error deleting all words:", error);
      deleteError.value = "Failed to delete words. Please try again.";
    } finally {
      deletingAll.value = false;
    }
  };
  showConfirmDialog.value = true;
};

const handleConfirm = async () => {
  if (!confirmAction.value) return;

  dialogLoading.value = true;
  try {
    await confirmAction.value();
    showConfirmDialog.value = false;
  } catch (error) {
    console.error("Error during deletion:", error);
  } finally {
    dialogLoading.value = false;
  }
};
</script>
