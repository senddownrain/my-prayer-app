<template>
  <v-container>
    <v-form v-if="isFormReady" @submit.prevent="handleSave">
      
      <!-- ✅ ИЗМЕНЕНИЕ: Вкладки теперь контролируют и заголовок, и текст -->
      <v-tabs v-model="currentLangTab" bg-color="primary" class="mb-1">
        <v-tab value="be">Бел</v-tab>
        <v-tab value="ru">Рус</v-tab>
        <v-tab value="la">Lat</v-tab>
        <v-tab value="pl">Pol</v-tab>
      </v-tabs>

      <v-window v-model="currentLangTab">
        <v-window-item value="be">
          <v-text-field v-model="form.titleVersions.be" :label="`${t('title')} (${t('langLabels.be')})`" variant="outlined" class="my-4"></v-text-field>
          <Editor v-model="form.textVersions.be" />
        </v-window-item>
        <v-window-item value="ru">
          <v-text-field v-model="form.titleVersions.ru" :label="`${t('title')} (${t('langLabels.ru')})`" variant="outlined" class="my-4"></v-text-field>
          <Editor v-model="form.textVersions.ru" />
        </v-window-item>
        <v-window-item value="la">
          <v-text-field v-model="form.titleVersions.la" :label="`${t('title')} (${t('langLabels.la')})`" variant="outlined" class="my-4"></v-text-field>
          <Editor v-model="form.textVersions.la" />
        </v-window-item>
        <v-window-item value="pl">
           <v-text-field v-model="form.titleVersions.pl" :label="`${t('title')} (${t('langLabels.pl')})`" variant="outlined" class="my-4"></v-text-field>
           <Editor v-model="form.textVersions.pl" />
        </v-window-item>
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

      <!-- Остальная часть формы без изменений... -->
      <v-divider class="my-4"></v-divider>
      <h3 class="text-subtitle-1 mb-2">{{ $t('linkedNotesAdd') }}</h3>
      <div v-if="form.linkedNoteIds && form.linkedNoteIds.length > 0" class="mb-3">
        <v-chip
          v-for="linkedNote in currentlyLinkedNotes"
          :key="linkedNote.id"
          class="mr-2 mb-2"
          closable
          @click:close="removeLink(linkedNote.id)"
        >
          {{ getTitle(linkedNote) }} <!-- Используем хелпер -->
        </v-chip>
      </div>
 <v-btn @click="isLinkDialogOpen = true" prepend-icon="mdi-link-plus">{{ $t('linkedNotesAdd') }}</v-btn>

      <v-divider class="my-4"></v-divider>
      <v-text-field v-model="form.source" :label="$t('source')" variant="outlined" class="mb-4" clearable></v-text-field>

      <v-divider class="my-4"></v-divider>
      <h3 class="text-subtitle-1 mb-2">{{ $t('novenaSettings') }}</h3>
      <v-switch v-model="form.isNovenaPrayer" :label="$t('isNovenaPrayerLabel')" color="primary" inset class="mb-2"></v-switch>
      <v-expand-transition>
        <div v-if="form.isNovenaPrayer">
          <v-text-field v-model="form.recommendedDate" :label="$t('recommendedDateLabel')" :hint="$t('recommendedDateHint')" type="date" variant="outlined" clearable></v-text-field>
        </div>
      </v-expand-transition>

      <v-divider class="my-4"></v-divider>
      <v-switch v-model="form.hidden" :label="$t('hiddenNote')" color="primary" inset class="mb-2"></v-switch>
    </v-form>

    <div v-else class="text-center mt-16">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-dialog v-model="isLinkDialogOpen" max-width="500px">
      <v-card>
        <v-card-title>{{ $t('linkedNotesSelect') }}</v-card-title>
         <v-text-field v-model="linkSearchQuery" :placeholder="$t('searchPlaceholder')" variant="filled" density="compact" hide-details autofocus class="mx-4 mb-2"></v-text-field>
        <v-list>
          <v-list-item
            v-for="note in availableNotesToLink"
            :key="note.id"
            :title="getTitle(note)" 
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
import { getTitleByLang } from '@/utils/i18n'; // ✅ Импортируем наш хелпер

const props = defineProps({ id: { type: String, required: false } });
const router = useRouter();
const { t } = useI18n();
const { items, addItem, updateItem, allTags } = useItems();
const { showSuccess } = useNotifier();

const registerSaveAction = inject('registerSaveAction');
const isEditMode = computed(() => !!props.id);
const isFormReady = ref(false);
const currentLangTab = ref('be');

// ✅ ИЗМЕНЕНИЕ: Обновляем структуру данных формы
const form = ref({
  titleVersions: { ru: '', be: '', la: '', pl: '' },
  textVersions: { ru: '', be: '', la: '', pl: '' },
  tags: [],
  source: '',
  linkedNoteIds: [],
  isNovenaPrayer: false,
  recommendedDate: null,
  hidden: false
});

// ✅ Хелпер для отображения заголовков в этом компоненте
const getTitle = (item) => getTitleByLang(item);

const isLinkDialogOpen = ref(false);
const linkSearchQuery = ref('');
const currentlyLinkedNotes = computed(() => form.value.linkedNoteIds?.map(id => items.value.find(item => item.id === id)).filter(Boolean) || []);

const availableNotesToLink = computed(() => {
  return items.value.filter(item => {
    const isNotSelf = item.id !== props.id;
    const isNotLinked = !form.value.linkedNoteIds?.includes(item.id);
    const matchesSearch = linkSearchQuery.value 
      ? getTitle(item).toLowerCase().includes(linkSearchQuery.value.toLowerCase()) // Поиск по отображаемому заголовку
      : true;
    return isNotSelf && isNotLinked && matchesSearch;
  });
});

function addLink(noteId) { 
  if (!form.value.linkedNoteIds) form.value.linkedNoteIds = [];
  form.value.linkedNoteIds.push(noteId); 
  isLinkDialogOpen.value = false; 
  linkSearchQuery.value = '';
}

function removeLink(noteId) { form.value.linkedNoteIds = form.value.linkedNoteIds.filter(id => id !== noteId); }

async function handleSave() {
  // ✅ Проверяем, есть ли хотя бы один заголовок
  const hasAtLeastOneTitle = Object.values(form.value.titleVersions).some(title => title && title.trim() !== '');
  if (!hasAtLeastOneTitle) {
      alert('Пожалуйста, введите название хотя бы для одного языка.'); // Можно заменить на useNotifier
      return;
  }
  
  // Создаем объект для сохранения, только с непустыми полями
  const dataToSave = {
    titleVersions: {},
    textVersions: {},
    tags: form.value.tags || [],
    source: form.value.source || '',
    linkedNoteIds: form.value.linkedNoteIds || [],
    isNovenaPrayer: form.value.isNovenaPrayer || false,
    recommendedDate: form.value.recommendedDate || null,
    hidden: form.value.hidden || false
  };

  for (const lang in form.value.titleVersions) {
    if (form.value.titleVersions[lang]) {
      dataToSave.titleVersions[lang] = form.value.titleVersions[lang];
    }
  }
  for (const lang in form.value.textVersions) {
    if (form.value.textVersions[lang] && form.value.textVersions[lang] !== '<p></p>') {
      dataToSave.textVersions[lang] = form.value.textVersions[lang];
    }
  }

  if (isEditMode.value) {
    await updateItem(props.id, dataToSave);
  } else {
    await addItem(dataToSave);
  }
  showSuccess(t('noteSavedSuccess'));
  router.push({ name: 'ItemsList' });
}

onMounted(() => {
  registerSaveAction(handleSave);
  if (isEditMode.value) {
    let stopWatch;
    stopWatch = watch(items, (newItems) => {
      const itemToEdit = newItems.find(i => i.id === props.id);
      if (itemToEdit) {
        // ✅ ИЗМЕНЕНИЕ: Заполняем новые структуры данных
        form.value = { 
          titleVersions: { 
            be: itemToEdit.titleVersions?.be || '',
            ru: itemToEdit.titleVersions?.ru || '',
            la: itemToEdit.titleVersions?.la || '',
            pl: itemToEdit.titleVersions?.pl || ''
          },
          textVersions: {
            be: itemToEdit.textVersions?.be || '',
            ru: itemToEdit.textVersions?.ru || '',
            la: itemToEdit.textVersions?.la || '',
            pl: itemToEdit.textVersions?.pl || ''
          },
          source: itemToEdit.source || '',
          tags: itemToEdit.tags || [],
          isNovenaPrayer: itemToEdit.isNovenaPrayer || false,
          recommendedDate: itemToEdit.recommendedDate || null,
          linkedNoteIds: itemToEdit.linkedNoteIds || [],
          hidden: itemToEdit.hidden || false
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
  registerSaveAction(null);
});
</script>