<template>
  <v-container class="note-view-container">
    <div v-if="!isLoading && item">
      <!-- ✅ ИЗМЕНЕННЫЙ БЛОК С ФЛАГАМИ -->
      <div class="d-flex align-center justify-space-between flex-wrap gap-1">
        <!-- ✅ ИЗМЕНЕННЫЙ БЛОК ЯЗЫКОВ -->
<!-- ✅ ИЗМЕНЕННЫЙ БЛОК ЯЗЫКОВ -->
<v-chip-group class="mb-2">
  <v-chip
    v-for="version in allLanguageVersions"
    :key="version.id"
    :to="{ name: 'ItemView', params: { id: version.id } }"
    label
    :variant="version.id === item.id ? 'flat' : 'outlined'"
    :active="version.id === item.id" 
  >
    <strong class="text-uppercase mr-1">{{ version.lang }}</strong>
  </v-chip>
</v-chip-group>
      </div>

      <!-- Заголовок -->
      <h2 class="text-h5 font-weight-bold mb-4 note-content-area">{{ getTitle(item) }}</h2>


      <!-- Панель Новенны -->
      <v-expansion-panels v-if="novenaStore.isNovenaActive(props.id)" class="my-6">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center">
                <v-icon start color="primary">mdi-calendar-check</v-icon>
                <span class="font-weight-medium">{{ $t('prayerNovena') }}</span>
              </div>
              <div class="d-flex align-center mr-2">
                <v-progress-circular :model-value="novenaProgress.percentage" :color="novenaProgress.color" size="24"
                  width="2" class="mr-2">
                  <small>{{ novenaProgress.completed }}</small>
                </v-progress-circular>
                <span class="text-body-2 text-medium-emphasis">
                  {{ novenaProgress.completed }} / {{ novenaProgress.total }}
                </span>
              </div>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <NovenaTracker :note-id="props.id" />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>


      <!-- Текст молитвы (теперь только один) -->
      <div class="mb-4" @click="handleContentClick">
        <div v-html="processedHtml" class="note-content-area prose-view"></div>
      </div>


      <!-- Связанные заметки -->
      <div v-if="linkedNotes.length > 0" class="mt-8">
        <v-divider class="mb-4"></v-divider>
        <v-list lines="one" density="compact" class="pa-0 bg-transparent linked-notes-list">
          <v-list-item v-for="linkedNote in linkedNotes" :key="linkedNote.id"
            @click="router.push({ name: 'ItemView', params: { id: linkedNote.id } })" class="mb-1">
            <template v-slot:prepend>
              <v-icon color="grey-darken-1">mdi-link-variant</v-icon>
            </template>
            <v-list-item-title class="text-primary font-weight-medium">{{ getTitle(linkedNote) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </div>

      <!-- Кнопка для старта новенны -->
      <div v-if="item.isNovenaPrayer && !novenaStore.isNovenaActive(props.id)" class="text-center my-8">
        <v-btn @click="isNovenaDialogVisible = true" color="primary" variant="tonal" size="large"
          prepend-icon="mdi-play-circle-outline">
          {{ $t('startNovena') }}
        </v-btn>
      </div>

      <!-- Источник и теги -->
      <div class="mt-6 text-body-2 text-medium-emphasis">
        <div v-if="item.source">
          <v-divider class="my-3"></v-divider>
          <strong>{{ $t('sourceLabel') }}</strong> {{ item.source }}
        </div>
        <div v-if="item.tags && item.tags.length > 0" class="mt-3">
          <strong>{{ $t('tagsLabel') }}</strong> {{ item.tags.join(', ') }}
        </div>
      </div>
    </div>

    <!-- Загрузка и состояние "не найдено" -->
    <div v-else-if="!isLoading && !item" class="text-center mt-16">
      <v-icon size="64" class="mb-4">mdi-file-question-outline</v-icon>
      <h2 class="text-h5 mb-4">{{ $t('noteNotFound') }}</h2>
      <p class="text-medium-emphasis mb-6">{{ $t('noteNotFoundMessage') }}</p>
      <v-btn color="primary" :to="{ name: 'ItemsList' }">{{ $t('backToHome') }}</v-btn>
    </div>
    <div v-else class="text-center text-grey-darken-1 mt-16">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- БЛОК С ПЛАВАЮЩИМИ КНОПКАМИ "РИТУАЛА" -->
    <div v-if="isNovenaActiveAndInProgress && !isTodayCompleted" class="fab-container">
      <!-- Кнопка "К началу" -->
      <v-btn v-if="hasStartMarker" icon="mdi-cross" :color="hasScrolledToStart ? 'success' : 'secondary'"
        variant="tonal" class="mb-2" @click="executeScrollStep('start')" title="Да ўступу"></v-btn>

      <!-- Кнопка "К текущему дню" -->
      <v-btn v-if="currentNovenaDay" icon="mdi-crosshairs-gps" :color="hasScrolledToDay ? 'success' : 'secondary'"
        :disabled="!hasScrolledToStart" variant="tonal" class="mb-2" @click="executeScrollStep('day')"
        title="Да сённяшняга дня"></v-btn>

      <!-- Кнопка "К окончанию" -->
      <v-btn v-if="hasFinishMarker" icon="mdi-flag-checkered" :color="hasScrolledToFinish ? 'success' : 'secondary'"
        :disabled="!hasScrolledToDay" variant="tonal" class="mb-2" @click="executeScrollStep('finish')"
        title="Да заканчэння"></v-btn>

      <!-- Кнопка "Завершить день" -->
      <v-expand-transition>
        <v-btn v-if="showCompleteButton" icon="mdi-calendar-check" color="primary" variant="flat"
          @click="novenaStore.toggleDayCompletion(props.id, novenaStore.getTodayDateString())"
          title="Адзначыць дзень як выкананы"></v-btn>
      </v-expand-transition>
    </div>

    <!-- Если день уже завершен, показываем одну кнопку-галочку -->
    <div v-if="isNovenaActiveAndInProgress && isTodayCompleted" class="fab-container">
      <v-btn icon="mdi-calendar-check" color="success" variant="flat" title="Дзень выкананы!"
        @click="novenaStore.toggleDayCompletion(props.id, novenaStore.getTodayDateString())"></v-btn>
    </div>


    <!-- Диалог старта новенны -->
    <v-dialog v-model="isNovenaDialogVisible" max-width="400px">
      <v-card>
        <v-card-title>{{ $t('novenaDurationTitle') }}</v-card-title>
        <v-card-text>
          <p class="text-subtitle-1 mb-2">{{ $t('novenaDurationChoice') }}</p>
          <v-chip-group v-model="novenaDays" mandatory class="mb-4">
            <v-chip v-for="d in [7, 9, 33, 54]" :key="d" :value="d" filter>{{ d }} {{ $t('days') }}</v-chip>
          </v-chip-group>
          <p class="text-subtitle-1 mb-2">{{ $t('novenaDurationInput') }}</p>
          <v-text-field v-model.number="novenaDays" :label="$t('novenaDaysLabel')" type="number" variant="outlined"
            autofocus></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="isNovenaDialogVisible = false">{{ $t('cancel') }}</v-btn>
          <v-btn color="primary" variant="flat" @click="handleStartNovena">{{ $t('start') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, watch, onBeforeUpdate, watchEffect, onUnmounted } from 'vue';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { useItems } from '@/composables/useItems';
import { useSettingsStore } from '@/stores/settings';
import { useWakeLock } from '@/composables/useWakeLock';
import { useI18n } from 'vue-i18n';
import { useNovenaStore } from '@/stores/novena';
import NovenaTracker from '@/components/NovenaTracker.vue';



const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();
const { t } = useI18n();
const { items, isLoading, getTitle } = useItems();
const novenaStore = useNovenaStore();
const settings = useSettingsStore();
const { requestWakeLock, releaseWakeLock } = useWakeLock();

const item = computed(() => items.value.find(i => i.id === props.id));
const translations = computed(() => item.value?.translationIds?.map(id => items.value.find(note => note.id === id)).filter(Boolean) || []);

// ✅ НОВОЕ COMPUTED СВОЙСТВО: Объединяем текущую заметку и ее переводы в один массив
const allLanguageVersions = computed(() => {
  if (!item.value) return [];
  const all = [item.value, ...translations.value];
  // Сортируем, чтобы всегда был одинаковый порядок, например, по коду языка
  return all.sort((a, b) => a.lang.localeCompare(b.lang));
});

const isNovenaDialogVisible = ref(false);
const novenaDays = ref(9);

// --- Логика для связанных заметок и ссылок в тексте ---
const linkedNotes = computed(() => item.value?.linkedNoteIds?.map(id => items.value.find(note => note.id === id)).filter(Boolean) || []);

function handleContentClick(event) {
  const link = event.target.closest('a');
  if (link && link.pathname.startsWith('/item/')) {
    event.preventDefault();
    router.push(link.pathname);
  }
}

// --- Логика Новенн ---
const isNovenaActiveAndInProgress = computed(() => novenaStore.isNovenaActive(props.id));

const currentNovenaDay = computed(() => {
  if (!isNovenaActiveAndInProgress.value) return null;
  const data = novenaStore.getNovenaData(props.id);
  if (!data) return null;
  const startDate = new Date(data.startDate);
  const today = new Date(novenaStore.getTodayDateString());
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const dayNumber = diffDays + 1;
  return dayNumber > 0 && dayNumber <= data.totalDays ? dayNumber : null;
});

// Логика "Ритуала"
const hasScrolledToStart = ref(false);
const hasScrolledToDay = ref(false);
const hasScrolledToFinish = ref(false);
const hasStartMarker = ref(false);
const hasFinishMarker = ref(false);

const isTodayCompleted = computed(() => {
  if (!currentNovenaDay.value) return false;
  const data = novenaStore.getNovenaData(props.id);
  const todayStr = novenaStore.getTodayDateString();
  return data?.completedDates.includes(todayStr) || false;
});

const showCompleteButton = computed(() => {
  return hasScrolledToStart.value && hasScrolledToDay.value && hasScrolledToFinish.value;
});

function executeScrollStep(step) {
  if (step === 'start') {
    scrollToMarker('start');
    hasScrolledToStart.value = true;
  } else if (step === 'day') {
    scrollToCurrentDay();
    hasScrolledToDay.value = true;
  } else if (step === 'finish') {
    scrollToMarker('finish');
    hasScrolledToFinish.value = true;
  }
}

function resetRitualState() {
  hasScrolledToStart.value = false;
  hasScrolledToDay.value = false;
  hasScrolledToFinish.value = false;
}

onBeforeRouteLeave(() => { resetRitualState(); });
onUnmounted(() => { resetRitualState(); });

// ✅ ИСПРАВЛЕННЫЙ БЛОК
watchEffect(() => {
  if (typeof window === 'undefined' || !item.value || !item.value.text) {
    hasStartMarker.value = false;
    hasFinishMarker.value = false;
    return;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(item.value.text, 'text/html');

  hasStartMarker.value = !!doc.querySelector('[data-marker="start"]');
  hasFinishMarker.value = !!doc.querySelector('[data-marker="finish"]');
});

const processedHtml = computed(() => {
  const dayToHighlight = currentNovenaDay.value;
  const originalHtml = item.value?.text || '';
  if (!dayToHighlight || !originalHtml) return originalHtml;

  const parser = new DOMParser();
  const doc = parser.parseFromString(originalHtml, 'text/html');
  const element = doc.querySelector(`[data-day="${dayToHighlight}"]`);
  if (element) {
    element.classList.add('current-day-marker');
  }
  return doc.body.innerHTML;
});

const novenaProgress = computed(() => {
  const data = novenaStore.getNovenaData(props.id);
  if (!data || !data.totalDays) return { percentage: 0, color: 'grey', completed: 0, total: 0 };
  const todayStr = novenaStore.getTodayDateString();
  const isTodayCompleted = data.completedDates.includes(todayStr);
  return {
    percentage: (data.completedDates.length / data.totalDays) * 100,
    completed: data.completedDates.length,
    total: data.totalDays,
    color: isTodayCompleted ? 'success' : 'warning'
  };
});

function handleStartNovena() {
  novenaStore.startNovena(props.id, novenaDays.value);
  isNovenaDialogVisible.value = false;
}

function scrollToCurrentDay() {
  const el = document.querySelector('.current-day-marker');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function scrollToMarker(markerType) {
  const el = document.querySelector(`[data-marker="${markerType}"]`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

watchEffect(() => {
  if (settings.keepScreenOn) requestWakeLock();
  else releaseWakeLock();
});

</script>
<style scoped>
.note-view-container {
  padding-left: 8px;
  padding-right: 8px;
}

.note-content-area {
  line-height: 1.5; /* Задаем комфортный межстрочный интервал */
}

/* Убираем все отступы по умолчанию у параграфов и заголовков */
.note-content-area :deep(p),
.note-content-area :deep(h1),
.note-content-area :deep(h2),
.note-content-area :deep(h3) {
  margin-top: 0;
  margin-bottom: 0;
}

/* 💡 НОВЫЙ СТИЛЬ ДЛЯ КРАСНОГО ТЕКСТА (соответствует Editor.vue) */
.note-content-area :deep([style*="color: #C62828"]) {
  color: #C62828 !important;
}
/* Добавляем верхний отступ (создаем "дыхание") для любого блочного элемента, который идет ПОСЛЕ другого блочного элемента */

.note-content-area :deep(p + h1),
.note-content-area :deep(p + h2),
.note-content-area :deep(p + h3),
.note-content-area :deep(h1 + p),
.note-content-area :deep(h2 + p),
.note-content-area :deep(h3 + p),
.note-content-area :deep(ul + p),
.note-content-area :deep(ol + p),
.note-content-area :deep(p + ul),
.note-content-area :deep(p + ol) {
  margin-top: 1rem; /* Это будет наш отступ между абзацами */
}

/* Отдельные, чуть большие отступы для заголовков, чтобы визуально их отделить */
.note-content-area :deep(h1),
.note-content-area :deep(h2),
.note-content-area :deep(h3) {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

/* Убираем лишний отступ у первого заголовка в тексте */
.note-content-area :deep(> :first-child) {
    margin-top: 0 !important;
}

/* Стили для списков */
.note-content-area :deep(ol),
.note-content-area :deep(ul) {
  padding-left: 1.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

/* Стили для выравнивания (Tiptap использует inline-стили, поэтому это может не понадобиться, но оставляем на всякий случай) */
.note-content-area :deep([style*="text-align: center"]) { text-align: center; }
.note-content-area :deep([style*="text-align: right"]) { text-align: right; }
.note-content-area :deep([style*="text-align: justify"]) { text-align: justify; }

.fab-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  z-index: 5;
}
</style>