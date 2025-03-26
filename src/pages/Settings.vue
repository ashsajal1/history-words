<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-6">Settings</h1>

    <!-- Danger Zone -->
    <div class="border border-red-200 rounded-lg p-4">
      <h2 class="text-xl font-semibold text-red-700 mb-4">Danger Zone</h2>

      <!-- Delete by Battle -->
      <div class="mb-6">
        <h3 class="text-lg font-medium mb-2">Delete Words by Battle</h3>
        <div class="flex gap-4 items-start">
          <Select
            v-model="selectedBattle"
            :options="battles"
            optionLabel="name"
            placeholder="Select Battle"
            class="w-64"
          />
          <Button
            @click="handleDeleteBattleWords"
            :loading="deletingBattle"
            severity="danger"
            :disabled="!selectedBattle"
          >
            Delete Battle Words
          </Button>
        </div>
      </div>

      <!-- Delete All Words -->
      <div>
        <h3 class="text-lg font-medium mb-2">Delete All Words</h3>
        <div class="flex items-center gap-4">
          <Button
            @click="confirmDeleteAll"
            :loading="deletingAll"
            severity="danger"
          >
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
    >
      <p class="m-0">{{ dialogMessage }}</p>
      <template #footer>
        <Button
          label="No"
          @click="showConfirmDialog = false"
          class="p-button-text"
        />
        <Button
          label="Yes"
          @click="handleConfirm"
          severity="danger"
          :loading="dialogLoading"
        />
      </template>
    </Dialog>
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

onMounted(async () => {
  try {
    battles.value = await getAllBattles();
  } catch (error) {
    console.error("Error fetching battles:", error);
  }
});

const handleDeleteBattleWords = () => {
  if (!selectedBattle.value) return;

  dialogHeader.value = "Delete Battle Words";
  dialogMessage.value = `Are you sure you want to delete all words from "${selectedBattle.value.name}"?`;
  confirmAction.value = async () => {
    try {
      deletingBattle.value = true;
      await deleteWordsByBattle(selectedBattle.value!.name);
      selectedBattle.value = null;
    } finally {
      deletingBattle.value = false;
    }
  };
  showConfirmDialog.value = true;
};

const confirmDeleteAll = () => {
  dialogHeader.value = "Delete All Words";
  dialogMessage.value =
    "Are you sure you want to delete all words? This action cannot be undone.";
  confirmAction.value = async () => {
    try {
      deletingAll.value = true;
      await deleteAllWords();
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
