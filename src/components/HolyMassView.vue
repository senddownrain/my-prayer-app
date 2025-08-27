<template>
  <div class="holy-mass-container">
    <div v-if="isLoading" class="text-center mt-16">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>
    <div v-else-if="!massItem" class="text-center mt-16">
        <v-icon size="64" class="mb-4">mdi-text-box-remove-outline</v-icon>
        <h2 class="text-h5 mb-4">{{ $t('noteNotFound') }}</h2>
        <p>{{ $t('noteNotFoundMessage') }}</p>
    </div>
    <div v-else ref="contentArea" class="content-wrapper">
        <!-- ✅✅✅ ДОБАВЛЕН БЛОК ПЕРЕКЛЮЧЕНИЯ ЯЗЫКОВ ✅✅✅ -->
        <v-chip-group class="mb-6">
          <v-chip
            v-for="version in allLanguageVersions"
            :key="version.id"
            label
            :variant="version.id === massItem.id ? 'flat' : 'outlined'"
            :color="version.id === massItem.id ? 'primary' : ''"
            @click="router.push({ params: { id: version.id } })"
          >
            <strong class="text-uppercase mr-1">{{ version.lang }}</strong>
            
          </v-chip>
        </v-chip-group>

        <h2 class="text-h4 font-weight-bold mb-6">{{ getTitle(massItem) }}</h2>
        <div v-html="massItem.text" class="note-content-area"></div>
    </div>

    <!-- ПЛАВАЮЩИЕ КНОПКИ НАВИГАЦИИ -->
    <div v-if="headings.length > 1" class="fab-container-mass">
        <v-btn icon="mdi-chevron-up" class="mb-2" @click="scrollToHeading('prev')" :disabled="currentHeadingIndex <= 0"></v-btn>
        <v-btn icon="mdi-chevron-down" @click="scrollToHeading('next')" :disabled="currentHeadingIndex >= headings.length - 1"></v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'; // ✅ 1. Импортируем nextTick
import { useRoute, useRouter } from 'vue-router';
import { useItems } from '@/composables/useItems';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

// ❗️ ВАЖНО: Укажите здесь ID "главной" версии Мессы
const HOLY_MASS_BASE_ID = 'wPt0x7dgurGCe74hdl6C'; // Я вставил пример ID, замените на свой

const { items, isLoading, getTitle } = useItems();

const currentItemId = computed(() => route.params.id || HOLY_MASS_BASE_ID);
const massItem = computed(() => items.value.find(i => i.id === currentItemId.value));
const translations = computed(() => {
    const baseItem = items.value.find(i => i.id === HOLY_MASS_BASE_ID);
    return baseItem?.translationIds?.map(id => items.value.find(note => note.id === id)).filter(Boolean) || [];
});
const allLanguageVersions = computed(() => {
  const base = items.value.find(i => i.id === HOLY_MASS_BASE_ID);
  if (!base) return [];
  const all = [base, ...translations.value];
  return all.sort((a, b) => a.lang.localeCompare(b.lang));
});


const contentArea = ref(null);
const headings = ref([]);
const currentHeadingIndex = ref(-1);

const findHeadings = () => {
    if (contentArea.value) {
        headings.value = Array.from(contentArea.value.querySelectorAll('.note-content-area h3'));
        currentHeadingIndex.value = -1;
        console.log(`[HolyMassView] Found ${headings.value.length} headings.`);
    }
};

// ✅ 2. Используем watch вместо onMounted для поиска заголовков
watch(massItem, (newItem) => {
    // Этот наблюдатель сработает как при первой загрузке данных, так и при смене языка
    if (newItem && newItem.text) {
        // nextTick гарантирует, что мы будем искать заголовки
        // ПОСЛЕ того, как Vue обновил v-html
        nextTick(() => {
            findHeadings();
        });
    }
}, { immediate: true }); // immediate: true заставит watch сработать при первой же загрузке компонента

const scrollToHeading = (direction) => {
    if (headings.value.length === 0) return;
    let nextIndex = currentHeadingIndex.value;
    if (direction === 'next') {
        nextIndex = Math.min(headings.value.length - 1, nextIndex + 1);
    } else {
        nextIndex = Math.max(0, nextIndex - 1);
    }
    headings.value[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Отслеживание текущего заголовка
const onScroll = () => {
    if(headings.value.length === 0) return;
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    const newIndex = headings.value.findIndex(h => h.offsetTop > scrollPosition) - 1;
    currentHeadingIndex.value = newIndex < 0 ? headings.value.length - 1 : newIndex;
};


// ✅ 3. Упрощаем onMounted - теперь он только добавляет слушатель скролла
onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
});

onUnmounted(() => {
    window.removeEventListener('scroll', onScroll);
});
</script>

<style scoped>
.holy-mass-container {
    padding: 16px;
    max-width: 800px;
    margin: 0 auto;
}
.content-wrapper {
    padding-bottom: 100px; /* Отступ снизу, чтобы кнопки не перекрывали текст */
}
.fab-container-mass {
    position: fixed;
    bottom: 24px;
    right: 24px;
    display: flex;
    flex-direction: column;
    z-index: 5;
}
</style>