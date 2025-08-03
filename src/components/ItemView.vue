<template>
  <v-container>
    <div v-if="item">
      <!-- Основной контент (без изменений) -->
      <div @click="handleContentClick">
        <h1 class="text-h4 font-weight-bold mb-4">{{ item.title }}</h1>
        <div v-for="(text, lang) in availableVersions" :key="lang" class="mb-8">
          <h2 class="text-h6 font-weight-medium text-grey-darken-1 mb-2">{{ langNames[lang] }}</h2>
          <div v-html="text" class="note-content-area is-view-mode ProseMirror"></div>
        </div>
      </div>

      <!-- Теги (без изменений) -->
      <v-chip-group v-if="item.tags && item.tags.length > 0" class="mt-4">
        <v-chip v-for="tag in item.tags" :key="tag" class="mr-2" color="primary" variant="tonal">{{ tag }}</v-chip>
      </v-chip-group>

      <!-- ✅ --- НОВЫЙ БЛОК ДЛЯ ОТОБРАЖЕНИЯ СВЯЗАННЫХ ЗАМЕТОК --- ✅ -->
      <div v-if="linkedNotes.length > 0" class="mt-6">
        <v-divider class="mb-4"></v-divider>
        <h3 class="text-subtitle-1 mb-3">Связанные заметки:</h3>
        <v-chip-group>
          <v-chip
            v-for="linkedNote in linkedNotes"
            :key="linkedNote.id"
            class="mr-2 mb-2"
            color="secondary"
            variant="outlined"
            @click="router.push({ name: 'ItemView', params: { id: linkedNote.id } })"
          >
            <v-icon start icon="mdi-link-variant"></v-icon>
            {{ linkedNote.title }}
          </v-chip>
        </v-chip-group>
      </div>

    </div>
    <div v-else class="text-center text-grey-darken-1 mt-16">
      <v-icon size="48" class="mb-2">mdi-alert-circle-outline</v-icon>
      <p>{{ $t('noteNotFound') }}</p>
    </div>
  </v-container>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useItems } from '@/composables/useItems';
import { useAppBar } from '@/composables/useAppBar';
import { useI18n } from 'vue-i18n';

const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();
const { items } = useItems();
const { setAppBar, resetAppBar } = useAppBar();
const { t } = useI18n();

const item = computed(() => {
  return items.value.find(i => i.id === props.id);
});

// ✅ --- НОВОЕ ВЫЧИСЛЯЕМОЕ СВОЙСТВО ДЛЯ ПОИСКА СВЯЗАННЫХ ЗАМЕТОК --- ✅
const linkedNotes = computed(() => {
  if (!item.value || !item.value.linkedNoteIds) return [];
  // Находим полные объекты заметок, ID которых хранятся в нашей текущей заметке
  return item.value.linkedNoteIds
    .map(id => items.value.find(note => note.id === id))
    .filter(Boolean); // Отфильтровываем, если вдруг какая-то заметка была удалена
});

const availableVersions = computed(() => {
  if (!item.value?.textVersions) return {};
  const versions = {};
  for (const lang in item.value.textVersions) {
    if (item.value.textVersions[lang]) {
      versions[lang] = item.value.textVersions[lang];
    }
  }
  return versions;
});

const langNames = { ru: 'Русский', be: 'Беларуская', la: 'Latina' };

function handleContentClick(event) {
  const link = event.target.closest('a');
  if (link && link.pathname.startsWith('/items/')) {
    event.preventDefault();
    router.push(link.pathname);
  }
}

const updateAppBarForItem = (currentItem) => {
  if (currentItem) {
    setAppBar({
      title: currentItem.title,
      showBackButton: true,
      actions: [
        { icon: 'mdi-pencil', onClick: () => router.push({ name: 'ItemEdit', params: { id: currentItem.id } }) }
      ]
    });
  }
};

watch(item, (newItem) => { updateAppBarForItem(newItem); }, { immediate: true });
onMounted(() => { updateAppBarForItem(item.value); });
onUnmounted(resetAppBar);
</script>