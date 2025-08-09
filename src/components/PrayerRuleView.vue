<template>
  <v-container>
    <!-- ЗАГОЛОВОК СТРАНИЦЫ -->
    <h2 class="text-h5 font-weight-medium mb-6">{{ $t('myPrayerRule') }}</h2>

    <!-- ======================= -->
    <!--    РЕЖИМ РЕДАКТИРОВАНИЯ   -->
    <!-- ======================= -->
    <div v-if="isEditing">
      <!-- Сообщение, если правило пусто в режиме редактирования -->
      <div v-if="prayerRule.ruleItems.length === 0" class="text-center mt-16">
        <p class="text-h6">{{ $t('ruleIsEmpty') }}</p>
        <p class="text-medium-emphasis">{{ $t('ruleIsEmptyHint') }}</p>
      </div>

      <!-- Список молитв для редактирования -->
      <div v-else>
        <div v-for="(item, index) in prayerRule.ruleItems" :key="item.itemId" class="prayer-item-container">
          
          <!-- Заголовок молитвы -->
          <h3 class="text-h5 mb-3">{{ getItemTitle(item.itemId) }}</h3>
          
          <!-- Панель управления -->
          <div class="d-flex align-center flex-wrap ga-2 mb-4 pa-2 control-panel">
            <div>
              <v-btn icon="mdi-arrow-up" variant="text" size="small" :disabled="index === 0" @click="prayerRule.moveItem(index, index - 1)"></v-btn>
              <v-btn icon="mdi-arrow-down" variant="text" size="small" :disabled="index === prayerRule.ruleItems.length - 1" @click="prayerRule.moveItem(index, index + 1)"></v-btn>
            </div>
            <v-spacer></v-spacer>
            <v-btn-toggle
              :model-value="item.lang"
              @update:model-value="prayerRule.updateItemLanguage(index, $event)"
              variant="outlined" density="compact" mandatory
            >
              <v-btn value="be" size="x-small">Бел</v-btn>
              <v-btn value="ru" size="x-small">Рус</v-btn>
              <v-btn value="la" size="x-small">Lat</v-btn>
            </v-btn-toggle>
            <v-btn icon="mdi-delete-outline" variant="text" @click="prayerRule.removeItem(index)"></v-btn>
          </div>

          <!-- Текст молитвы -->
          <div v-html="getItemContent(item)" class="note-content-area ProseMirror"></div>

          <!-- Разделитель -->
          <v-divider class="my-8"></v-divider>
        </div>
      </div>

      <!-- Плавающая кнопка "Добавить" (видна только в режиме редактирования) -->
      <v-btn
        icon="mdi-plus" location="bottom right" size="large" color="primary" position="fixed"
        variant="elevated" elevation="8" class="ma-4" @click="isAddDialogOpen = true"
      ></v-btn>
    </div>

    <!-- ======================= -->
    <!--    РЕЖИМ ПРОСМОТРА      -->
    <!-- ======================= -->
    <div v-else>
      <!-- Отображение созданного правила -->
      <div v-if="prayerRule.ruleItems.length > 0">
        <div v-for="(item, index) in prayerRule.ruleItems" :key="`view-${item.itemId}`">
          <h3 class="text-h5 mb-3">{{ getItemTitle(item.itemId) }}</h3>
          <div v-html="getItemContent(item)" class="note-content-area ProseMirror"></div>
          <v-divider class="my-8"></v-divider>
        </div>
      </div>
      
      <!-- Состояние "Правило не создано" -->
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

    <!-- Диалог добавления молитвы -->
    <v-dialog v-model="isAddDialogOpen" max-width="600px">
      <v-card>
        <v-card-title>{{ $t('addPrayerToRule') }}</v-card-title>
        <div class="pa-4">
          <v-autocomplete
            v-model="selectedItem"
            :label="$t('findPrayer')"
            :items="availableItems"
            item-title="title"
            item-value="id"
            return-object
            variant="outlined"
            autofocus
            hide-details
          ></v-autocomplete>
        </div>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="isAddDialogOpen = false">{{ $t('cancel') }}</v-btn>
          <v-btn color="primary" variant="flat" @click="handleAddItem">{{ $t('add') }}</v-btn>
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
import { getTitleByLang } from '@/utils/i18n';
// Управление состоянием режима редактирования
const { isEditing, setEditing } = usePageMode();

// Хранилища и утилиты
const prayerRule = usePrayerRuleStore();
const { items } = useItems();
const { t } = useI18n();

// Локальное состояние компонента
const isAddDialogOpen = ref(false);
const selectedItem = ref(null);

// Сбрасываем режим редактирования при уходе со страницы, чтобы избежать багов
onUnmounted(() => {
  setEditing(false);
});

// Список доступных для добавления молитв (те, которых еще нет в правиле)
const availableItems = computed(() => {
    const ruleItemIds = new Set(prayerRule.ruleItems.map(i => i.itemId));
    return items.value.filter(item => !ruleItemIds.has(item.id));
});

// Вспомогательная функция для получения заголовка молитвы по ее ID
const getItemTitle = (itemId) => {
    const item = items.value.find(i => i.id === itemId);
    // Используем наш новый хелпер
    return item ? getTitleByLang(item) : `[${t('noteNotFound')}]`;
};

// Вспомогательная функция для получения текста молитвы с учетом выбранного языка
const getItemContent = (ruleItem) => {
    const fullItem = items.value.find(i => i.id === ruleItem.itemId);
    if (!fullItem) return `[${t('noteNotFound')}]`;
    return fullItem.textVersions[ruleItem.lang] || `[${t('noTextInLang')}]`;
};

// Обработчик добавления новой молитвы в правило
function handleAddItem() {
    if (!selectedItem.value) return;
    prayerRule.addItem(selectedItem.value);
    selectedItem.value = null; // Сбрасываем выбор
    isAddDialogOpen.value = false; // Закрываем диалог
}

onMounted(() => {
  console.log('%c[PrayerRuleView.vue] Компонент успешно смонтирован!', 'background: #28a745; color: white; padding: 2px 5px; border-radius: 3px;');
});
</script>

<style scoped>
/* Легкая рамка и фон для панели управления, чтобы отделить ее от контента */
.control-panel {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background-color: rgba(var(--v-theme-surface-variant), 0.2);
}

/* Скрываем разделитель после самого последнего элемента в списке, чтобы не было лишней линии */
.prayer-item-container:last-of-type .v-divider, 
div[v-else] > div > div:last-of-type .v-divider {
  display: none;
}
</style>