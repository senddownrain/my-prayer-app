<template>
  <v-container>
    <v-form v-if="isFormReady" @submit.prevent="handleSave">
      <!-- Поле для заголовка (без изменений) -->
      <v-text-field 
        v-model="form.title" 
        :label="$t('title')" 
        variant="outlined" 
        class="mb-4"
      ></v-text-field>

      <!-- Вкладки с языками и редактор (без изменений) -->
      <v-tabs v-model="currentLangTab" bg-color="primary" class="mb-1">
        <v-tab value="be">Бел</v-tab>
        <v-tab value="ru">Рус</v-tab>
        <v-tab value="la">Lat</v-tab>
      </v-tabs>
      <v-window v-model="currentLangTab">
        <v-window-item value="be"><Editor v-model="form.textVersions.be" /></v-window-item>
        <v-window-item value="ru"><Editor v-model="form.textVersions.ru" /></v-window-item>
        <v-window-item value="la"><Editor v-model="form.textVersions.la" /></v-window-item>
      </v-window>

      <!-- Поле с тегами (без изменений) -->
      <v-combobox
        v-model="form.tags"
        :items="allTags"
        :label="$t('tags')"
        :hint="$t('tagsHint')"
        multiple
        chips
        clearable
        variant="outlined"
        class="mt-4"
      ></v-combobox>

      <!-- ✅ --- НОВЫЙ БЛОК ДЛЯ УПРАВЛЕНИЯ ССЫЛКАМИ --- ✅ -->
      <v-divider class="my-4"></v-divider>
      <h3 class="text-subtitle-1 mb-2">Связанные заметки</h3>
      
      <!-- Отображение уже добавленных ссылок в виде чипов -->
      <div v-if="form.linkedNoteIds && form.linkedNoteIds.length > 0" class="mb-3">
        <v-chip
          v-for="linkedNote in currentlyLinkedNotes"
          :key="linkedNote.id"
          class="mr-2 mb-2"
          closable
          @click:close="removeLink(linkedNote.id)"
        >
          {{ linkedNote.title }}
        </v-chip>
      </div>
      
      <!-- Кнопка для добавления новой ссылки -->
      <v-btn @click="isLinkDialogOpen = true" prepend-icon="mdi-link-plus">
        Добавить связь
      </v-btn>
    </v-form>

    <div v-else class="text-center mt-16">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <p class="mt-4">{{ $t('loading') }}</p>
    </div>

    <!-- ✅ --- ОБНОВЛЕННЫЙ ДИАЛОГ ВЫБОРА ЗАМЕТОК --- ✅ -->
    <v-dialog v-model="isLinkDialogOpen" max-width="500px">
      <v-card>
        <v-card-title>Выберите заметку для связи</v-card-title>
        <v-list>
          <v-list-item
            v-for="note in availableNotesToLink"
            :key="note.id"
            :title="note.title"
            @click="addLink(note.id)"
          ></v-list-item>
        </v-list>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useItems } from '@/composables/useItems';
import { useAppBar } from '@/composables/useAppBar';
import Editor from '@/components/Editor.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({ id: { type: String, required: false } });
const router = useRouter();
const { t } = useI18n();
const { items, addItem, updateItem, allTags } = useItems();
const { setAppBar, resetAppBar } = useAppBar();

const isEditMode = computed(() => !!props.id);
const isFormReady = ref(false);
const currentLangTab = ref('be');

// ✅ Расширяем структуру формы, добавляя массив для ID связанных заметок
const form = ref({
  title: '',
  textVersions: { ru: '', be: '', la: '' },
  tags: [],
  linkedNoteIds: [] // Новый массив для хранения ID
});

// --- ✅ Новая логика для управления ссылками ---
const isLinkDialogOpen = ref(false);

// Вычисляемое свойство, которое находит полные объекты связанных заметок по их ID
const currentlyLinkedNotes = computed(() => {
  if (!form.value.linkedNoteIds) return [];
  return form.value.linkedNoteIds.map(id => items.value.find(item => item.id === id)).filter(Boolean);
});

// Вычисляемое свойство для списка заметок, которые можно добавить в связь
// (все, кроме текущей и уже добавленных)
const availableNotesToLink = computed(() => {
  const linkedIds = form.value.linkedNoteIds || [];
  return items.value.filter(item => item.id !== props.id && !linkedIds.includes(item.id));
});

// Функция для добавления ID в массив
function addLink(noteId) {
  if (!form.value.linkedNoteIds) {
    form.value.linkedNoteIds = [];
  }
  form.value.linkedNoteIds.push(noteId);
  isLinkDialogOpen.value = false;
}

// Функция для удаления ID из массива
function removeLink(noteId) {
  form.value.linkedNoteIds = form.value.linkedNoteIds.filter(id => id !== noteId);
}

// --- ✅ Обновленная функция сохранения ---
async function handleSave() {
  if (!form.value.title) { return; }
  
  const dataToSave = {
    title: form.value.title,
    textVersions: form.value.textVersions,
    tags: form.value.tags,
    linkedNoteIds: form.value.linkedNoteIds || [] // Сохраняем массив ID
  };

  if (isEditMode.value) {
    await updateItem(props.id, dataToSave);
  } else {
    const newDocRef = await addItem(dataToSave);
  }
  router.push({ name: 'ItemsList' });
}


onMounted(() => {
  setAppBar({
    title: isEditMode.value ? t('editing') : t('newNote'),
    showBackButton: true,
    actions: [{ icon: 'mdi-check', onClick: handleSave }]
  });

  if (isEditMode.value) {
    // Ждем, пока загрузятся все заметки, чтобы найти нужную
    watch(items, (newItems) => {
      if (newItems.length === 0) return; // Пропускаем начальное пустое состояние
      const itemToEdit = newItems.find(i => i.id === props.id);
      if (itemToEdit) {
        form.value = {
          ...itemToEdit,
          tags: itemToEdit.tags || [],
          textVersions: itemToEdit.textVersions || { ru: '', be: '', la: '' },
          linkedNoteIds: itemToEdit.linkedNoteIds || [] // Загружаем ID в форму
        };
        isFormReady.value = true;
      }
    }, { immediate: true });
  } else {
    // Для новой заметки просто инициализируем пустую форму
    form.value = { title: '', textVersions: { ru: '', be: '', la: '' }, tags: [], linkedNoteIds: [] };
    isFormReady.value = true;
  }
});

onUnmounted(resetAppBar);
</script>