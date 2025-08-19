<template>
  <v-container class="items-list-container">
    <div v-if="isLoading">
      <v-skeleton-loader v-for="n in 3" :key="n" type="card" class="mb-4"></v-skeleton-loader>
    </div>
    <div v-else>
      <div v-if="settings.viewMode === 'card'">
        <v-card v-for="item in filteredItems" :key="item.id" class="mb-4" elevation="2">
          <!-- ✅ ИЗМЕНЕНИЕ: Используем хелпер getTitle -->
          <v-card-title class="font-weight-bold d-flex align-center">
            <v-icon v-if="novenaStore.isNovenaActive(item.id)" color="primary" class="mr-2">mdi-calendar-check</v-icon>
            <v-btn :icon="settings.isPinned(item.id) ? 'mdi-pin' : 'mdi-pin-outline'" :color="settings.isPinned(item.id) ? 'primary' : 'grey'" variant="text" size="small" class="mr-2" @click.stop="settings.togglePin(item.id)"></v-btn>
            <span @click="viewItem(item.id)" class="flex-grow-1" style="cursor: pointer;">{{ getTitle(item) }}</span>
          </v-card-title>
          <v-card-text class="pb-0" @click="viewItem(item.id)" style="cursor: pointer;">
            <p class="mb-4 text-medium-emphasis">{{ getPreviewText(item) }}</p>
            <v-chip-group><v-chip v-for="tag in item.tags" :key="tag" size="small" color="primary" variant="tonal">{{ tag }}</v-chip></v-chip-group>
          </v-card-text>
          <v-card-actions v-if="authStore.user">
            <v-icon v-if="item.hidden" color="grey" class="ml-2">mdi-eye-off-outline</v-icon>
            <v-spacer></v-spacer>
            <v-btn color="grey-darken-1" variant="text" @click.stop="navigateToEdit(item.id)">{{ $t('edit') }}</v-btn>
            <v-btn color="error" variant="text" @click.stop="openDeleteDialog(item.id)">{{ $t('delete') }}</v-btn>
          </v-card-actions>
        </v-card>
      </div>
      <v-list v-else-if="settings.viewMode === 'compact'" lines="one" density="compact">
        <v-list-item v-for="item in filteredItems" :key="item.id" @click="viewItem(item.id)">
          <template v-slot:prepend>
            <v-btn :icon="settings.isPinned(item.id) ? 'mdi-pin' : 'mdi-pin-outline'" :color="settings.isPinned(item.id) ? 'primary' : 'grey'" variant="text" size="medium" class="mr-2" @click.stop="settings.togglePin(item.id)"></v-btn>
          </template>
          <!-- ✅ ИЗМЕНЕНИЕ: Используем хелпер getTitle -->
          <v-list-item-title>{{ getTitle(item) }}</v-list-item-title>
          <template v-if="!authStore.user" v-slot:append>
            <v-progress-circular v-if="novenaStore.isNovenaActive(item.id)" :model-value="getNovenaProgress(item.id).percentage" :color="getNovenaProgress(item.id).color" size="24" width="2" class="ml-2"><small>{{ getNovenaProgress(item.id).completed }}</small></v-progress-circular>
            <v-icon v-if="item.hidden" color="grey" class="ml-2">mdi-eye-off-outline</v-icon>
          </template>
          <template v-if="authStore.user" v-slot:append>
            <v-icon v-if="item.hidden" color="grey" class="ml-2">mdi-eye-off-outline</v-icon>
            <v-progress-circular v-if="novenaStore.isNovenaActive(item.id)" :model-value="getNovenaProgress(item.id).percentage" :color="getNovenaProgress(item.id).color" size="24" width="2" class="ml-2"><small>{{ getNovenaProgress(item.id).completed }}</small></v-progress-circular>
            <v-btn icon="mdi-pencil" variant="text" size="small" @click.stop="navigateToEdit(item.id)"></v-btn>
            <v-btn icon="mdi-delete" variant="text" size="small" @click.stop="openDeleteDialog(item.id)"></v-btn>
          </template>
        </v-list-item>
      </v-list>
      <div v-if="!isLoading && filteredItems.length === 0" class="text-center text-grey-darken-1 mt-16">
        <v-icon size="48" class="mb-2">mdi-note-off-outline</v-icon>
        <p>{{ $t('noNotesFound') }}</p>
      </div>
    </div>
    <v-btn v-if="authStore.user" icon location="bottom right" size="large" color="primary" position="fixed" variant="elevated" elevation="8" class="ma-4" @click="router.push({ name: 'ItemAdd' })">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <v-dialog v-model="isDeleteDialogOpen" persistent max-width="400px">
      <v-card>
        <v-card-title class="text-h5">{{ $t('confirmDeletion') }}</v-card-title>
        <!-- ✅ ИЗМЕНЕНИЕ: Используем хелпер getTitle -->
        <v-card-text>{{ $t('deleteConfirmationMessage', { title: getTitle(itemToDelete) }) }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeDeleteDialog">{{ $t('cancel') }}</v-btn>
          <v-btn color="error" variant="flat" @click="confirmDeletion">{{ $t('delete') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useItems } from '@/composables/useItems';
import { useFilters } from '@/composables/useFilters';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '@/stores/settings';
import { useAuthStore } from '@/stores/auth';
import { useNotifier } from '@/composables/useNotifier';
import { useNovenaStore } from '@/stores/novena';

const router = useRouter();
const { t } = useI18n();
const { items, isLoading, deleteItem, getTitle } = useItems();
const { search, selectedTags } = useFilters();
const settings = useSettingsStore();
const authStore = useAuthStore();
const novenaStore = useNovenaStore();
const { showSuccess } = useNotifier();

const isDeleteDialogOpen = ref(false);
const itemToDeleteId = ref(null);
const itemToDelete = computed(() => itemToDeleteId.value ? items.value.find(item => item.id === itemToDeleteId.value) : null);

function getNovenaProgress(noteId) {
    const data = novenaStore.getNovenaData(noteId);
    if (!data || !data.totalDays) return { percentage: 0, color: 'grey', completed: 0 };
    const todayStr = novenaStore.getTodayDateString();
    const isTodayCompleted = data.completedDates.includes(todayStr);
    return {
        percentage: (data.completedDates.length / data.totalDays) * 100,
        completed: data.completedDates.length,
        color: isTodayCompleted ? 'success' : 'warning'
    };
}

function openDeleteDialog(id) {
  itemToDeleteId.value = id;
  isDeleteDialogOpen.value = true;
}

function closeDeleteDialog() {
  isDeleteDialogOpen.value = false;
  itemToDeleteId.value = null;
}

async function confirmDeletion() {
  if (itemToDeleteId.value) {
    await deleteItem(itemToDeleteId.value);
    showSuccess(t('noteDeletedSuccess'));
  }
  closeDeleteDialog();
}

function getPreviewText(item) {
  if (!item.textVersions) return 'Нет содержимого';
  const htmlContent = item.textVersions.be || item.textVersions.ru || item.textVersions.la || Object.values(item.textVersions).find(v => v) || '';
  if (!htmlContent) return 'Нет содержимого';
  const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
  const text = (doc.body.textContent || "").trim();
  return text.length > 150 ? text.substring(0, 150) + '...' : text;
}

const filteredItems = computed(() => {
  if (isLoading.value) return [];
  const searchLower = search.value.toLowerCase().trim();
  return items.value.filter(item => {
    if (!settings.showHiddenItems && item.hidden) {
      return false;
    }
    const tagMatch = selectedTags.value.length === 0 || (item.tags && selectedTags.value.some(tag => item.tags.includes(tag)));
    if (!tagMatch) return false;
    if (searchLower) {
      // ✅ ИЗМЕНЕНИЕ: Поиск по всем версиям заголовков и текстов
      const titles = Object.values(item.titleVersions || {}).join(' ');
      const texts = Object.values(item.textVersions || {}).join(' ');
      const fullText = (titles + ' ' + texts).toLowerCase();
      return fullText.includes(searchLower);
    }
    return true;
  });
});

function viewItem(id) { router.push({ name: 'ItemView', params: { id } }); }
function navigateToEdit(id) { router.push({ name: 'ItemEdit', params: { id } }); }
</script>