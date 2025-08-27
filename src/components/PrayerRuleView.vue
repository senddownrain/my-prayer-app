<template>
  <v-container>
     <h2 class="text-h5 font-weight-medium mb-6">{{ $t('myPrayerRule') }}</h2>
    <!-- РЕЖИМ РЕДАКТИРОВАНИЯ -->
    <div v-if="isEditing">
      <div v-if="prayerRule.ruleItems.length === 0" class="text-center mt-16">
        <p class="text-h6">{{ $t('ruleIsEmpty') }}</p>
        <p class="text-medium-emphasis">{{ $t('ruleIsEmptyHint') }}</p>
      </div>
      <div v-else>
        <!-- ✅✅✅ Рендерим карточки с кнопками управления порядком ✅✅✅ -->
        <div v-for="(item, index) in ruleItemsWithDetails" :key="item.id" class="prayer-item-container">
            <v-card variant="outlined" class="pa-4">
              <div class="d-flex align-center mb-4">
                <h3 class="text-h5">{{ getTitle(item) }}</h3>
                <v-spacer></v-spacer>
                <!-- Кнопки перемещения -->
                <v-btn icon="mdi-arrow-up" variant="text" size="small" :disabled="index === 0" @click="prayerRule.moveItem(index, index - 1)"></v-btn>
                <v-btn icon="mdi-arrow-down" variant="text" size="small" :disabled="index === ruleItemsWithDetails.length - 1" @click="prayerRule.moveItem(index, index + 1)"></v-btn>
                <!-- Кнопка удаления -->
                <v-btn icon="mdi-delete-outline" variant="text" size="small" @click="prayerRule.removeItem(index)"></v-btn>
              </div>
              <div v-html="getItemContent(item)" class="note-content-area ProseMirror"></div>
            </v-card>
            <v-divider class="my-4"></v-divider>
        </div>
      </div>
      <v-btn icon="mdi-plus" location="bottom right" size="large" color="primary" position="fixed" variant="elevated" elevation="8" class="ma-4" @click="isAddDialogOpen = true"></v-btn>
    </div>
    <!-- РЕЖИМ ПРОСМОТРА -->
    <div v-else>
      <div v-if="prayerRule.ruleItems.length > 0">
        <div v-for="item in ruleItemsWithDetails" :key="`view-${item.id}`">
          <h3 class="text-h5 mb-3">{{ getTitle(item) }}</h3>
          <div v-html="getItemContent(item)" class="note-content-area ProseMirror"></div>
          <v-divider class="my-8"></v-divider>
        </div>
      </div>
      <div v-else class="text-center mt-16">
        <v-icon size="64" class="mb-4 text-medium-emphasis">mdi-book-remove-outline</v-icon>
        <p class="text-h6">{{ $t('noRuleCreated') }}</p>
        <p class="text-medium-emphasis mb-4">{{ $t('noRuleCreatedHint') }}</p>
        <v-btn size="large" color="primary" @click="setEditing(true)">
          <v-icon start>mdi-pencil</v-icon>
          {{ $t('createRule') }}
        </v-btn>
      </div>
    </div>
    <!-- ✅ ИЗМЕНЕНИЕ: НОВЫЙ ДИАЛОГ ВМЕСТО АВТОКОМПЛИТА -->
    <v-dialog
      v-model="isAddDialogOpen"
      max-width="600px"
      :fullscreen="$vuetify.display.mobile"
      scrollable
    >
      <v-card>
        <v-card-title>{{ $t('addPrayerToRule') }}</v-card-title>
        <v-card-text class="pa-4">
          <v-text-field
            v-model="searchQuery"
            :placeholder="$t('findPrayer')"
            variant="outlined"
            density="compact"
            autofocus
            hide-details
            class="mb-4"
          ></v-text-field>

          <v-list v-if="filteredAvailableItems.length > 0">
            <v-list-item
              v-for="item in filteredAvailableItems"
              :key="item.id"
              :title="getTitle(item)"
              @click="handleAddItem(item)"
            >
              <template v-slot:prepend>
                <v-icon>mdi-note-text-outline</v-icon>
              </template>
            </v-list-item>
          </v-list>
          <div v-else class="text-center text-grey py-4">{{ $t('noNotesFound') }}</div>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="isAddDialogOpen = false">{{ $t('cancel') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onUnmounted , onMounted } from 'vue';
import { usePageMode } from '@/composables/usePageMode';
import { usePrayerRuleStore } from '@/stores/prayerRule';
import { useItems } from '@/composables/useItems';
import { useI18n } from 'vue-i18n';
const { isEditing, setEditing } = usePageMode();
const prayerRule = usePrayerRuleStore();
const { items, getTitle } = useItems();
const { t } = useI18n();

const isAddDialogOpen = ref(false);
const searchQuery = ref('');

onUnmounted(() => {
  setEditing(false);
});

// ✅ Возвращаемся к более простой логике: получаем полные объекты на основе ID из стора
const ruleItemsWithDetails = computed(() => {
    return prayerRule.ruleItems.map(itemId => items.value.find(i => i.id === itemId)).filter(Boolean);
});

// ✅ Измененная логика
const availableItems = computed(() => {
    const ruleItemIds = new Set(prayerRule.ruleItems); // Теперь это просто массив ID
    return items.value.filter(item => !ruleItemIds.has(item.id));
});

// ✅ Фильтруем доступные элементы на основе поиска
const filteredAvailableItems = computed(() => {
  if (!searchQuery.value) {
    return availableItems.value;
  }
  return availableItems.value.filter(item =>
    getTitle(item).toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const getItemTitle = (itemId) => {
    const item = items.value.find(i => i.id === itemId);
    return item ? getTitle(item) : `[${t('noteNotFound')}]`;
};

// ✅ Измененная логика
// const getItemContent = (itemId) => {
//     const fullItem = items.value.find(i => i.id === itemId);
//     if (!fullItem) return `[${t('noteNotFound')}]`;
//     return fullItem.text || `[${t('noTextInLang')}]`; // Просто берем поле text
// };
const getItemContent = (item) => {
    if (!item) return `[${t('noteNotFound')}]`;
    return item.text || `[${t('noTextInLang')}]`;
};

// ✅ Обновленная функция добавления
function handleAddItem(item) {
    if (!item) return;
    prayerRule.addItem(item);
    searchQuery.value = ''; // Сбрасываем поиск
    isAddDialogOpen.value = false; // Закрываем диалог
}

</script>

<style scoped>
.control-panel {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background-color: rgba(var(--v-theme-surface-variant), 0.2);
}
.prayer-item-container:last-of-type .v-divider, 
div[v-else] > div > div:last-of-type .v-divider {
  display: none;
}
</style>