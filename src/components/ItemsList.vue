<template>
  <v-container class="items-list-container">
    <!-- Индикатор загрузки в виде "скелета" -->
    <div v-if="isLoading">
        <v-skeleton-loader v-for="n in 3" :key="n" type="card" class="mb-4"></v-skeleton-loader>
    </div>

    <!-- Основной контент, когда загрузка завершена -->
    <div v-else>
      <!-- Режим отображения: Карточки -->
      <div v-if="settings.viewMode === 'card'">
        <v-card v-for="item in filteredItems" :key="item.id" class="mb-4" elevation="2">
          <v-card-title class="font-weight-bold d-flex align-center">
            <v-btn
              :icon="settings.isPinned(item.id) ? 'mdi-pin' : 'mdi-pin-outline'"
              :color="settings.isPinned(item.id) ? 'primary' : 'grey'"
              variant="text" size="small" class="mr-2"
              @click.stop="settings.togglePin(item.id)"
            ></v-btn>
            <span @click="viewItem(item.id)" class="flex-grow-1" style="cursor: pointer;">{{ item.title }}</span>
          </v-card-title>
          <v-card-text class="pb-0" @click="viewItem(item.id)" style="cursor: pointer;">
            <p class="mb-4 text-medium-emphasis">{{ getPreviewText(item) }}</p>
            <v-chip-group>
              <v-chip v-for="tag in item.tags" :key="tag" size="small" color="primary" variant="tonal">{{ tag }}</v-chip>
            </v-chip-group>
          </v-card-text>
          <v-card-actions v-if="authStore.user">
            <v-icon v-if="item.hidden" color="grey" class="ml-2">mdi-eye-off-outline</v-icon>
            <v-spacer></v-spacer>
            <v-btn color="grey-darken-1" variant="text" @click.stop="navigateToEdit(item.id)">{{ $t('edit') }}</v-btn>
            <v-btn color="error" variant="text" @click.stop="openDeleteDialog(item.id)">{{ $t('delete') }}</v-btn>
          </v-card-actions>
        </v-card>
      </div>

      <!-- Режим отображения: Компактный список -->
      <v-list v-else-if="settings.viewMode === 'compact'" lines="one" density="compact">
        <v-list-item v-for="item in filteredItems" :key="item.id" @click="viewItem(item.id)">
          <template v-slot:prepend>
             <v-btn
              :icon="settings.isPinned(item.id) ? 'mdi-pin' : 'mdi-pin-outline'"
              :color="settings.isPinned(item.id) ? 'primary' : 'grey'"
              variant="text" size="x-small" class="mr-2"
              @click.stop="settings.togglePin(item.id)"
            ></v-btn>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
          <template v-if="authStore.user" v-slot:append>
            <v-icon v-if="item.hidden" color="grey" class="ml-2">mdi-eye-off-outline</v-icon>
            <v-btn icon="mdi-pencil" variant="text" size="small" @click.stop="navigateToEdit(item.id)"></v-btn>
            <v-btn icon="mdi-delete" variant="text" size="small" @click.stop="openDeleteDialog(item.id)"></v-btn>
          </template>
        </v-list-item>
      </v-list>
      
      <!-- Сообщение, если заметок не найдено -->
      <div v-if="!isLoading && filteredItems.length === 0" class="text-center text-grey-darken-1 mt-16">
        <v-icon size="48" class="mb-2">mdi-note-off-outline</v-icon>
        <p>{{ $t('noNotesFound') }}</p>
      </div>
    </div>

    <!-- Плавающая кнопка "Добавить" -->
    <v-btn
      v-if="authStore.user"
      icon
      location="bottom right" size="large" color="primary" position="fixed"
      variant="elevated" elevation="8" class="ma-4"
      @click="router.push({ name: 'ItemAdd' })"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <!-- Диалог подтверждения удаления -->
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useItems } from '@/composables/useItems';
import { useFilters } from '@/composables/useFilters';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '@/stores/settings';
import { useAuthStore } from '@/stores/auth';
import { useNotifier } from '@/composables/useNotifier';

const router = useRouter();
const { t } = useI18n();
const { items, isLoading, deleteItem } = useItems();
const { search, selectedTags } = useFilters();
const settings = useSettingsStore();
const authStore = useAuthStore();
const { showSuccess } = useNotifier();

const isDeleteDialogOpen = ref(false);
const itemToDeleteId = ref(null);
const itemToDelete = computed(() => itemToDeleteId.value ? items.value.find(item => item.id === itemToDeleteId.value) : null);

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
    // ✅ --- НОВЫЙ БЛОК ФИЛЬТРАЦИИ СКРЫТЫХ --- ✅
    // Если настройка "Показывать скрытые" ВЫКЛЮЧЕНА и у заметки есть флаг hidden,
    // то не показываем её.
    if (!settings.showHiddenItems && item.hidden) {
      return false;
    }

    const tagMatch = selectedTags.value.length === 0 || (item.tags && selectedTags.value.some(tag => item.tags.includes(tag)));
    if (!tagMatch) return false;

    if (searchLower) {
      const fullText = (item.title + ' ' + Object.values(item.textVersions || {}).join(' ')).toLowerCase();
      return fullText.includes(searchLower);
    }
    
    return true;
  });
});

function viewItem(id) { router.push({ name: 'ItemView', params: { id } }); }
function navigateToEdit(id) { router.push({ name: 'ItemEdit', params: { id } }); }
</script>