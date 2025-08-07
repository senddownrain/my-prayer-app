<template>
  <v-container>
    <v-form v-if="isFormReady" @submit.prevent="handleSave">
      <v-text-field v-model="form.title" :label="$t('title')" variant="outlined" class="mb-4"></v-text-field>
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
      <v-combobox
        v-model="form.tags"
        :items="allTags"
        :label="$t('tags')"
        multiple
        chips
        clearable
        variant="outlined"
        class="mt-4"
      ></v-combobox>
      <v-divider class="my-4"></v-divider>
      <h3 class="text-subtitle-1 mb-2">Связанные заметки</h3>
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

      <v-btn @click="isLinkDialogOpen = true" prepend-icon="mdi-link-plus">{{ $t('linkedNotesAdd') }}</v-btn>
    <!-- ✅ --- ПЕРЕКЛЮЧАТЕЛЬ "СКРЫТЫЙ" --- ✅ -->
     <v-text-field v-model="form.source" :label="$t('source')" variant="outlined" class="mb-4" clearable></v-text-field>
       
    <v-switch
        v-model="form.hidden"
        :label="$t('hiddenNote')"
        color="primary"
        inset
        class="mb-2"
      ></v-switch>

    </v-form>
    <div v-else class="text-center mt-16">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <v-dialog v-model="isLinkDialogOpen" max-width="500px">
      <v-card>
        <v-card-title>{{ $t('linkedNotesSelect') }}</v-card-title>
         <v-text-field
          v-model="linkSearchQuery"
          :placeholder="$t('searchPlaceholder')"
          variant="filled"
          density="compact"
          hide-details
          autofocus
          class="mx-4 mb-2"
        ></v-text-field>
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
import { ref, watch, onMounted, onUnmounted, computed, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useItems } from '@/composables/useItems';
import Editor from '@/components/Editor.vue';
import { useI18n } from 'vue-i18n';
import { useNotifier } from '@/composables/useNotifier';

const props = defineProps({ id: { type: String, required: false } });
const router = useRouter();
const { t } = useI18n();
const { items, addItem, updateItem, allTags } = useItems();
const { showSuccess } = useNotifier();
// ✅ Получаем функцию регистрации сохранения из родителя (App.vue)
const registerSaveAction = inject('registerSaveAction');

const isEditMode = computed(() => !!props.id);
const isFormReady = ref(false);
const currentLangTab = ref('be');

const form = ref({
  title: '',
  source: '',
  textVersions: { ru: '', be: '', la: '' },
  tags: [],
  linkedNoteIds: [],
  hidden: false // ✅ Добавлено поле по умолчанию
});

const isLinkDialogOpen = ref(false);

const linkSearchQuery = ref(''); // ✅ Переменная для поиска

const currentlyLinkedNotes = computed(() => form.value.linkedNoteIds?.map(id => items.value.find(item => item.id === id)).filter(Boolean) || []);
// ✅ ОБНОВЛЯЕМ COMPUTED ДЛЯ ФИЛЬТРАЦИИ
const availableNotesToLink = computed(() => {
  return items.value.filter(item => {
    const isNotSelf = item.id !== props.id;
    const isNotLinked = !form.value.linkedNoteIds?.includes(item.id);
    const matchesSearch = linkSearchQuery.value 
      ? item.title.toLowerCase().includes(linkSearchQuery.value.toLowerCase())
      : true;
    return isNotSelf && isNotLinked && matchesSearch;
  });
});

function addLink(noteId) { 
  form.value.linkedNoteIds.push(noteId); 
  isLinkDialogOpen.value = false; 
  linkSearchQuery.value = ''; // ✅ Сбрасываем поиск
}

function removeLink(noteId) { form.value.linkedNoteIds = form.value.linkedNoteIds.filter(id => id !== noteId); }

async function handleSave() {
  if (!form.value.title) return;
  const dataToSave = {
    title: form.value.title,
    source: form.value.source || '',
    textVersions: form.value.textVersions,
    tags: form.value.tags,
    linkedNoteIds: form.value.linkedNoteIds || [],
      hidden: form.value.hidden || false // ✅ Добавляем поле при сохранении
  };

  if (isEditMode.value) {
    await updateItem(props.id, dataToSave);
  } else {
    await addItem(dataToSave);
  }

  showSuccess(t('noteSavedSuccess'));
  router.push({ name: 'ItemsList' });
}

onMounted(() => {
  // ✅ Регистрируем нашу функцию handleSave, чтобы App.vue мог её вызвать
  registerSaveAction(handleSave);

  if (isEditMode.value) {
    let stopWatch;
    stopWatch = watch(items, (newItems) => {
      const itemToEdit = newItems.find(i => i.id === props.id);
      if (itemToEdit) {
        form.value = { 
          ...itemToEdit,
          source: itemToEdit.source || '',
          tags: itemToEdit.tags || [],
          textVersions: itemToEdit.textVersions || { ru: '', be: '', la: '' },
          linkedNoteIds: itemToEdit.linkedNoteIds || [],
            hidden: itemToEdit.hidden || false // ✅ Получаем значение при загрузке
        };
        isFormReady.value = true;
        if(stopWatch) stopWatch();
      }
    }, { immediate: true });
  } else {
    isFormReady.value = true;
  }
});

onUnmounted(() => {
  // ✅ Очищаем функцию сохранения при уходе со страницы
  registerSaveAction(null);
});
</script>