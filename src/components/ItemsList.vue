<template>
  <v-container>
    <!-- Индикатор загрузки (без изменений) -->
    <div v-if="isLoading" class="text-center mt-16">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4 text-grey-darken-1">{{ $t('loading') }}</p>
    </div>
    
    <div v-else>
      <!-- РЕЖИМ 1: Карточки -->
      <div v-if="settings.viewMode === 'card'">
        <v-card
          v-for="item in sortedAndFilteredItems"
          :key="item.id"
          class="mb-4"
          elevation="2"
        >
          <!-- ✅ --- ИЗМЕНЕННЫЙ ЗАГОЛОВОК КАРТОЧКИ --- ✅ -->
          <v-card-title class="font-weight-bold d-flex align-center">
            <!-- 1. Иконка-кнопка для закрепления теперь СНАЧАЛА -->
            <v-btn 
              :icon="settings.isPinned(item.id) ? 'mdi-pin' : 'mdi-pin-outline'"
              :color="settings.isPinned(item.id) ? 'primary' : 'grey'"
              variant="text" 
              size="small"
              class="mr-2"
              @click.stop="settings.togglePin(item.id)"
            ></v-btn>
            <!-- 2. Название заметки, клик по которому ведет на страницу просмотра -->
            <span @click="viewItem(item.id)" class="flex-grow-1" style="cursor: pointer;">
              {{ item.title }}
            </span>
          </v-card-title>

          <!-- Текст и теги (без изменений) -->
          <v-card-text class="pb-0" @click="viewItem(item.id)" style="cursor: pointer;">
            <p class="mb-4 text-medium-emphasis">{{ getPreviewText(item) }}</p>
            <v-chip-group>
              <v-chip v-for="tag in item.tags" :key="tag" size="small" color="primary" variant="tonal">
                {{ tag }}
              </v-chip>
            </v-chip-group>
          </v-card-text>

          <!-- ✅ --- УБРАНА КНОПКА PIN ИЗ ДЕЙСТВИЙ --- ✅ -->
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey-darken-1" variant="text" @click.stop="navigateToEdit(item.id)">{{ $t('edit') }}</v-btn>
            <v-btn color="error" variant="text" @click.stop="openDeleteDialog(item.id)">{{ $t('delete') }}</v-btn>
          </v-card-actions>
        </v-card>
      </div>

      <!-- РЕЖИМ 2: Компактный список -->
      <v-list v-else-if="settings.viewMode === 'compact'" lines="one" density="compact">
        <v-list-item
          v-for="item in sortedAndFilteredItems"
          :key="item.id"
          @click="viewItem(item.id)"
        >
          <!-- ✅ --- ОБНОВЛЕННАЯ ИКОНКА-КНОПКА В НАЧАЛЕ --- ✅ -->
          <template v-slot:prepend>
            <v-btn 
              :icon="settings.isPinned(item.id) ? 'mdi-pin' : 'mdi-pin-outline'"
              :color="settings.isPinned(item.id) ? 'primary' : 'grey'"
              variant="text" 
              size="x-small" 
              class="mr-2"
              @click.stop="settings.togglePin(item.id)"
            ></v-btn>
          </template>

          <v-list-item-title>{{ item.title }}</v-list-item-title>

          <!-- ✅ --- УБРАНА КНОПКА PIN ИЗ ДЕЙСТВИЙ --- ✅ -->
          <template v-slot:append>
            <v-btn icon="mdi-pencil" variant="text" size="small" @click.stop="navigateToEdit(item.id)"></v-btn>
            <v-btn icon="mdi-delete" variant="text" size="small" @click.stop="openDeleteDialog(item.id)"></v-btn>
          </template>
        </v-list-item>
      </v-list>

      <div v-if="!isLoading && sortedAndFilteredItems.length === 0" class="text-center text-grey-darken-1 mt-16">
        <v-icon size="48" class="mb-2">mdi-note-off-outline</v-icon>
        <p>{{ $t('noNotesFound') }}</p>
      </div>
    </div>

    <!-- Кнопка "Добавить" и диалог удаления (без изменений) -->
    <v-btn icon="mdi-plus" location="bottom right" size="large" color="surface" position="fixed" variant="elevated" elevation="8" class="ma-4" @click="router.push({ name: 'ItemAdd' })">
      <v-icon color="primary">mdi-plus</v-icon> 
    </v-btn>
    <v-dialog v-model="isDeleteDialogOpen" persistent max-width="400px">
      <v-card>
        <v-card-title class="text-h5">{{ $t('confirmDeletion') }}</v-card-title>
        <v-card-text>{{ $t('deleteConfirmationMessage', { title: itemToDelete ? itemToDelete.title : '' }) }}</v-card-text>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useItems } from '@/composables/useItems';
import { useFilters } from '@/composables/useFilters';
import { useAppBar } from '@/composables/useAppBar';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '@/stores/settings';

const router = useRouter();
const { t, locale } = useI18n();
const { items, deleteItem } = useItems();
const { search, selectedTags } = useFilters();
const { setAppBar, resetAppBar, isSearchActive, isFilterSheetOpen } = useAppBar();
const settings = useSettingsStore();

const isLoading = ref(true);
watch(items, (newItems) => {
  if (newItems) isLoading.value = false;
}, { immediate: true });

// --- AppBar, логика удаления, текстовые функции и навигация остаются без изменений ---
const setupAppBar = () => {
  setAppBar({
    title: t('appTitle'),
    showBackButton: false,
    actions: [
      { icon: 'mdi-magnify', onClick: () => { isSearchActive.value = true; } },
      { 
        icon: settings.viewMode === 'card' ? 'mdi-view-list' : 'mdi-view-grid', 
        onClick: () => settings.toggleViewMode()
      },
      { icon: 'mdi-filter-variant', onClick: () => { isFilterSheetOpen.value = true; } },
      { icon: 'mdi-cog-outline', onClick: () => router.push({ name: 'Settings' }) }
    ]
  });
};
onMounted(setupAppBar);
onUnmounted(resetAppBar);
watch([locale, () => settings.viewMode], setupAppBar, { immediate: true });

const isDeleteDialogOpen = ref(false);
const itemToDeleteId = ref(null);
const itemToDelete = computed(() => itemToDeleteId.value ? items.value.find(item => item.id === itemToDeleteId.value) : null);
function openDeleteDialog(id) { itemToDeleteId.value = id; isDeleteDialogOpen.value = true; }
function closeDeleteDialog() { isDeleteDialogOpen.value = false; itemToDeleteId.value = null; }
async function confirmDeletion() { if (itemToDeleteId.value) await deleteItem(itemToDeleteId.value); closeDeleteDialog(); }

function getPreviewText(item) {
  let htmlContent = '';
  if (item.textVersions && typeof item.textVersions === 'object') {
    htmlContent = item.textVersions.be || item.textVersions.ru || item.textVersions.la || Object.values(item.textVersions).find(v => v) || '';
  }
  if (!htmlContent) return 'Нет содержимого';
  const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
  const text = (doc.body.textContent || "").trim();
  return text.length > 150 ? text.substring(0, 150) + '...' : text;
}

function getFullSearchableText(item) {
  let combinedHtml = item.title || '';
  if (item.textVersions && typeof item.textVersions === 'object') {
    combinedHtml += ' ' + Object.values(item.textVersions).join(' ');
  }
  if (!combinedHtml) return '';
  const doc = new DOMParser().parseFromString(combinedHtml, 'text/html');
  return (doc.body.textContent || "").toLowerCase();
}

// --- Логика фильтрации и сортировки (без изменений) ---
const sortedAndFilteredItems = computed(() => {
  if (isLoading.value) return [];
  
  const searchLower = search.value.toLowerCase().trim();
  const filtered = items.value.filter(item => {
    const tagMatch = selectedTags.value.length === 0 || 
      (item.tags && selectedTags.value.every(tag => item.tags.includes(tag)));
    if (!tagMatch) return false;
    if (searchLower) {
      const fullText = getFullSearchableText(item);
      return fullText.includes(searchLower);
    }
    return true;
  });

  return filtered.slice().sort((a, b) => {
    const isAPinned = settings.isPinned(a.id);
    const isBPinned = settings.isPinned(b.id);
    return isBPinned - isAPinned;
  });
});

function viewItem(id) { router.push({ name: 'ItemView', params: { id } }); }
function navigateToEdit(id) { router.push({ name: 'ItemEdit', params: { id } }); }
</script>

<style scoped>
.v-card {
  transition: all 0.2s ease-out;
}
.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}
</style>