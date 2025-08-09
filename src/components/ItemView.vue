<template>
  <v-container>
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
      
      <!-- ✅ ИЗМЕНЕНИЕ 2: БЫСТРАЯ НАВИГАЦИЯ ПО ЯЗЫКАМ -->
      <v-chip-group v-if="sortedLangs.length > 1" class="mb-6">
        <v-chip
          v-for="lang in sortedLangs"
          :key="`chip-${lang}`"
          @click="scrollToLang(lang)"
        >
          {{ t(`langLabels.${lang}`) }}
        </v-chip>
      </v-chip-group>

      <!-- Текст молитвы (с перехватом кликов по ссылкам и динамическими ref) -->
      <!-- ✅ ИЗМЕНЕНИЕ 1 и 3: Итерация по отсортированному списку языков -->
      <div 
        v-for="lang in sortedLangs" 
        :key="lang" 
        class="mb-4"
        @click="handleContentClick"
        :ref="el => (langRefs[lang] = el)"
      >
        <div class="lang-label">{{ t('langLabels.' + lang) }}</div>
        <div v-html="availableVersions[lang]" class="note-content-area ProseMirror"></div>
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

      <!-- Кнопка для старта новенны (видна, если новенна не активна) -->
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

    <!-- Диалог старта новенны -->
    <v-dialog v-model="isNovenaDialogVisible" max-width="400px">
      <v-card>
        <v-card-title>{{ $t('novenaDurationTitle') }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model.number="novenaDays"
            :label="$t('novenaDaysLabel')"
            type="number"
            variant="outlined"
            autofocus
          ></v-text-field>
          <v-chip-group v-model="novenaDays" mandatory class="mt-2">
            <v-chip v-for="d in [7, 9, 33, 54]" :key="d" :value="d" filter>{{ d }} {{ $t('days') }}</v-chip>
          </v-chip-group>
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
import { computed, ref, onBeforeUpdate } from 'vue';
import { useRouter } from 'vue-router';
import { useItems } from '@/composables/useItems';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';
import { useNovenaStore } from '@/stores/novena';
import NovenaTracker from '@/components/NovenaTracker.vue';
import { getTitleByLang } from '@/utils/i18n'; // Добавьте этот импорт

const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();
const { t } = useI18n();
const { items, isLoading } = useItems();
const authStore = useAuthStore();
const novenaStore = useNovenaStore();

const isNovenaDialogVisible = ref(false);
const novenaDays = ref(9);
const item = computed(() => items.value.find(i => i.id === props.id));
const getTitle = (item) => getTitleByLang(item); // Добавьте эту строку

const linkedNotes = computed(() => item.value?.linkedNoteIds?.map(id => items.value.find(note => note.id === id)).filter(Boolean) || []);

// ✅ ИЗМЕНЕНИЕ 1: Улучшенная логика для `availableVersions`, чтобы скрывать пустые теги
const availableVersions = computed(() => {
  if (!item.value?.textVersions) return {};
  return Object.fromEntries(
    Object.entries(item.value.textVersions).filter(([lang, text]) => {
      // Отображаем, только если текст не пустой и не содержит лишь пустой тег <p>
      return text && text.trim() !== '<p></p>';
    })
  );
});

// ✅ ИЗМЕНЕНИЕ 3: Создаем отсортированный список языков, где 'be' всегда первый
const sortedLangs = computed(() => {
  const langs = Object.keys(availableVersions.value);
  return langs.sort((a, b) => {
    if (a === 'be') return -1;
    if (b === 'be') return 1;
    return a.localeCompare(b); // остальные сортируем по алфавиту
  });
});

// ✅ ИЗМЕНЕНИЕ 2: Логика для плавной прокрутки
const langRefs = ref({});
onBeforeUpdate(() => {
  // Очищаем ссылки перед каждым обновлением, чтобы избежать утечек памяти
  langRefs.value = {};
});

function scrollToLang(lang) {
  const element = langRefs.value[lang];
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function handleContentClick(event) {
  const link = event.target.closest('a');
  if (link && link.pathname.startsWith('/item/')) {
    event.preventDefault(); 
    router.push(link.pathname);
  }
}

function handleStartNovena() {
  novenaStore.startNovena(props.id, novenaDays.value);
  isNovenaDialogVisible.value = false;
}

const novenaProgress = computed(() => {
    const data = novenaStore.getNovenaData(props.id);
    if (!data || !data.totalDays) {
        return { percentage: 0, color: 'grey', completed: 0, total: 0 };
    }
    const todayStr = novenaStore.getTodayDateString();
    const isTodayCompleted = data.completedDates.includes(todayStr);
    return {
        percentage: (data.completedDates.length / data.totalDays) * 100,
        completed: data.completedDates.length,
        total: data.totalDays,
        color: isTodayCompleted ? 'success' : 'warning'
    };
});
</script>