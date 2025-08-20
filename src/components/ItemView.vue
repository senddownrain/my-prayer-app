<template>
  <v-container class="note-view-container">
    <div v-if="!isLoading && item">
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
                <v-progress-circular
                  :model-value="novenaProgress.percentage"
                  :color="novenaProgress.color"
                  size="24"
                  width="2"
                  class="mr-2"
                >
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

      <!-- Быстрая навигация по языкам -->
      <v-chip-group v-if="sortedLangs.length > 1" class="mb-6">
        <v-chip
          v-for="lang in sortedLangs"
          :key="`chip-${lang}`"
          @click="scrollToLang(lang)"
        >
          {{ t(`langLabels.${lang}`) }}
        </v-chip>
      </v-chip-group>

      <!-- Текст молитвы -->
      <div 
        v-for="lang in sortedLangs" 
        :key="lang" 
        class="mb-4"
        @click="handleContentClick"
        :ref="el => (langRefs[lang] = el)"
      >
        <div class="lang-label">{{ t('langLabels.' + lang) }}</div>
        <div v-html="processedHtml[lang]" class="note-content-area"></div>
      </div>

      <!-- Связанные заметки -->
      <div v-if="linkedNotes.length > 0" class="mt-8">
        <v-divider class="mb-4"></v-divider>
        <v-list lines="one" density="compact" class="pa-0 bg-transparent linked-notes-list">
          <v-list-item
            v-for="linkedNote in linkedNotes"
            :key="linkedNote.id"
            @click="router.push({ name: 'ItemView', params: { id: linkedNote.id } })"
            class="mb-1"
          >
            <template v-slot:prepend>
              <v-icon color="grey-darken-1">mdi-link-variant</v-icon>
            </template>
          <v-list-item-title class="text-primary font-weight-medium">{{ getTitle(linkedNote) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </div>

      <!-- Кнопка для старта новенны -->
      <div v-if="item.isNovenaPrayer && !novenaStore.isNovenaActive(props.id)"  class="text-center my-8">
        <v-btn
          @click="isNovenaDialogVisible = true"
          color="primary"
          variant="tonal"
          size="large"
          prepend-icon="mdi-play-circle-outline"
        >
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
      <v-btn
        v-if="hasStartMarker"
        icon="mdi-cross"
        :color="hasScrolledToStart ? 'success' : 'secondary'"
        variant="tonal"
        class="mb-2"
        @click="executeScrollStep('start')"
        title="Да ўступу"
      ></v-btn>

      <!-- Кнопка "К текущему дню" -->
      <v-btn
        v-if="currentNovenaDay"
        icon="mdi-crosshairs-gps"
        :color="hasScrolledToDay ? 'success' : 'secondary'"
        :disabled="!hasScrolledToStart"
        variant="tonal"
        class="mb-2"
        @click="executeScrollStep('day')"
        title="Да сённяшняга дня"
      ></v-btn>

      <!-- Кнопка "К окончанию" -->
      <v-btn
        v-if="hasFinishMarker"
        icon="mdi-flag-checkered"
        :color="hasScrolledToFinish ? 'success' : 'secondary'"
        :disabled="!hasScrolledToDay"
        variant="tonal"
        class="mb-2"
        @click="executeScrollStep('finish')"
        title="Да заканчэння"
      ></v-btn>
      
      <!-- Кнопка "Завершить день" -->
      <v-expand-transition>
          <v-btn
            v-if="showCompleteButton"
            icon="mdi-calendar-check"
            color="primary"
            variant="flat"
            @click="novenaStore.toggleDayCompletion(props.id, novenaStore.getTodayDateString())"
            title="Адзначыць дзень як выкананы"
          ></v-btn>
      </v-expand-transition>
    </div>
    
    <!-- Если день уже завершен, показываем одну кнопку-галочку -->
     <div v-if="isNovenaActiveAndInProgress && isTodayCompleted" class="fab-container">
        <v-btn
            icon="mdi-calendar-check"
            color="success"
            variant="flat"
            title="Дзень выкананы!"
            @click="novenaStore.toggleDayCompletion(props.id, novenaStore.getTodayDateString())"
          ></v-btn>
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
          <v-text-field
            v-model.number="novenaDays"
            :label="$t('novenaDaysLabel')"
            type="number"
            variant="outlined"
            autofocus
          ></v-text-field>
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

// --- Логика для языковых версий ---
const availableVersions = computed(() => {
  if (!item.value?.textVersions) return {};
  return Object.fromEntries(
    Object.entries(item.value.textVersions).filter(([lang, text]) => text && text.trim() !== '<p></p>')
  );
});

const sortedLangs = computed(() => {
  const langs = Object.keys(availableVersions.value);
  return langs.sort((a, b) => (a === 'be' ? -1 : b === 'be' ? 1 : a.localeCompare(b)));
});

const langRefs = ref({});
onBeforeUpdate(() => {
  langRefs.value = {};
});

function scrollToLang(lang) {
  const element = langRefs.value[lang];
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

watchEffect(() => {
  const versions = availableVersions.value;
  if (typeof window === 'undefined' || !item.value || Object.keys(versions).length === 0) {
    hasStartMarker.value = false;
    hasFinishMarker.value = false;
    return;
  }
  const firstLangHtml = versions[sortedLangs.value[0]];
  if (!firstLangHtml) return;

  const parser = new DOMParser();
  const doc = parser.parseFromString(firstLangHtml, 'text/html');
  hasStartMarker.value = !!doc.querySelector('[data-marker="start"]');
  hasFinishMarker.value = !!doc.querySelector('[data-marker="finish"]');
});

const processedHtml = computed(() => {
  const versions = availableVersions.value;
  const dayToHighlight = currentNovenaDay.value;
  if (!dayToHighlight) return versions;

  const processed = {};
  for (const lang in versions) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(versions[lang], 'text/html');
    const element = doc.querySelector(`[data-day="${dayToHighlight}"]`);
    if (element) {
      element.classList.add('current-day-marker');
    }
    processed[lang] = doc.body.innerHTML;
  }
  return processed;
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
.fab-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    display: flex;
    flex-direction: column;
    z-index: 5;
}
</style>