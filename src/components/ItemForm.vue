<template>
  <v-container>
    <v-form v-if="isFormReady" @submit.prevent="handleSave">

      <!-- ✅ НОВЫЙ БЛОК: Выбор языка и основной заголовок -->
      <v-select
        v-model="form.lang"
        :items="langOptions"
        item-title="title"
        item-value="value"
        :label="$t('noteLanguage')"
        variant="outlined"
        class="mb-4"
        :disabled="isEditMode"
        :hint="isEditMode ? $t('languageCannotBeChanged') : ''"
        persistent-hint
      ></v-select>
      
      <v-text-field
        v-model="form.title"
        :label="$t('title')"
        variant="outlined"
        class="mb-4"
      ></v-text-field>

      <Editor v-model="form.text" :is-novena="form.isNovenaPrayer" />

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

      <!-- ✅ НОВЫЙ БЛОК: Управление переводами -->
      <h3 class="text-subtitle-1 mb-2">{{ $t('translations') }}</h3>
      <div v-if="currentlyLinkedTranslations.length > 0" class="mb-3">
        <v-chip
          v-for="trans in currentlyLinkedTranslations"
          :key="trans.id"
          class="mr-2 mb-2"
          closable
          @click:close="removeTranslation(trans.id)"
        >
    <v-avatar color="grey-lighten-1" start size="22">
    <span class="text-uppercase font-weight-bold text-white" style="font-size: 0.7rem;">{{ trans.lang }}</span>
  </v-avatar>   
        {{ getTitle(trans) }}
        </v-chip>
      </div>
      <v-btn @click="isTranslationDialogOpen = true" prepend-icon="mdi-translate">{{ $t('addTranslation') }}</v-btn>

      <v-divider class="my-4"></v-divider>
      
      <!-- Блок связанных заметок (остается без изменений) -->
      <h3 class="text-subtitle-1 mb-2">{{ $t('linkedNotesAdd') }}</h3>
      <div v-if="form.linkedNoteIds && form.linkedNoteIds.length > 0" class="mb-3">
        <v-chip
          v-for="linkedNote in currentlyLinkedNotes"
          :key="linkedNote.id"
          class="mr-2 mb-2"
          closable
          @click:close="removeLink(linkedNote.id)"
        >
          {{ getTitle(linkedNote) }}
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

    <!-- Диалог для переводов -->
    <v-dialog v-model="isTranslationDialogOpen" max-width="500px">
      <v-card>
        <v-card-title>{{ $t('selectTranslation') }}</v-card-title>
        <v-text-field v-model="translationSearchQuery" :placeholder="$t('searchPlaceholder')" variant="filled" density="compact" hide-details autofocus class="mx-4 mb-2"></v-text-field>
        <v-list>
          <v-list-item
            v-for="note in availableNotesToTranslate"
            :key="note.id"
            :title="getTitle(note)"
            :subtitle="`Язык: ${note.lang}`"
            @click="addTranslation(note.id)"
          >
           <template v-slot:prepend>
   <!-- ✅ ИЗМЕНЕНИЕ: Используем v-avatar -->
    <v-avatar color="grey-lighten-3" size="32" class="mr-4">
        <span class="text-uppercase font-weight-bold text-grey-darken-1">{{ note.lang }}</span>
    </v-avatar>  
  
          </template>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- Диалог для связей (остается) -->
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

const props = defineProps({ id: { type: String, required: false } });
const router = useRouter();
const { t } = useI18n();
const { items, addItem, updateItem, allTags, getTitle, linkTranslations } = useItems();
const { showSuccess } = useNotifier();
const registerSaveAction = inject('registerSaveAction');

const isEditMode = computed(() => !!props.id);
const isFormReady = ref(false);

const langOptions = ref([
    { title: 'Беларуская', value: 'be'},
    { title: 'Русский', value: 'ru'},
    { title: 'Latina', value: 'la'},
    { title: 'Polski', value: 'pl'},
]);


const form = ref({
  title: '',
  text: '',
  lang: 'be',
  tags: [],
  source: '',
  linkedNoteIds: [],
  translationIds: [],
  isNovenaPrayer: false,
  recommendedDate: null,
  hidden: false,
});

// --- Логика для управления связями ---
const isLinkDialogOpen = ref(false);
const linkSearchQuery = ref('');
const currentlyLinkedNotes = computed(() => form.value.linkedNoteIds?.map(id => items.value.find(item => item.id === id)).filter(Boolean) || []);
const availableNotesToLink = computed(() => {
    return items.value.filter(item => {
        const isNotSelf = item.id !== props.id;
        const isNotLinked = !form.value.linkedNoteIds?.includes(item.id);
        const matchesSearch = linkSearchQuery.value ? getTitle(item).toLowerCase().includes(linkSearchQuery.value.toLowerCase()) : true;
        return isNotSelf && isNotLinked && matchesSearch;
    });
});
function addLink(noteId) { if (!form.value.linkedNoteIds) form.value.linkedNoteIds = []; form.value.linkedNoteIds.push(noteId); isLinkDialogOpen.value = false; linkSearchQuery.value = ''; }
function removeLink(noteId) { form.value.linkedNoteIds = form.value.linkedNoteIds.filter(id => id !== noteId); }

// --- Логика Управления переводами ---
const isTranslationDialogOpen = ref(false);
const translationSearchQuery = ref('');
const currentlyLinkedTranslations = computed(() => form.value.translationIds?.map(id => items.value.find(item => item.id === id)).filter(Boolean) || []);
const availableNotesToTranslate = computed(() => {
  return items.value.filter(item => {
    if (item.id === props.id) return false;
    if (form.value.translationIds?.includes(item.id)) return false;
    if (item.lang === form.value.lang) return false;
    const matchesSearch = translationSearchQuery.value ? getTitle(item).toLowerCase().includes(translationSearchQuery.value.toLowerCase()) : true;
    return matchesSearch;
  });
});

async function addTranslation(noteId) {
    if (!form.value.translationIds) form.value.translationIds = [];
    form.value.translationIds.push(noteId);
    await linkTranslations(props.id, noteId);
    showSuccess(t('translationLinked'));
    isTranslationDialogOpen.value = false;
    translationSearchQuery.value = '';
}

async function removeTranslation(noteId) {
    form.value.translationIds = form.value.translationIds.filter(id => id !== noteId);
    await linkTranslations(props.id, noteId, true);
    showSuccess(t('translationUnlinked'));
}

async function handleSave() {
  if (!form.value.title || !form.value.title.trim()) {
    alert(t('titleRequired'));
    return;
  }
  
  const dataToSave = { ...form.value };

  if (isEditMode.value) {
    await updateItem(props.id, dataToSave);
  } else {
    const newDocRef = await addItem(dataToSave);
    if (dataToSave.translationIds.length > 0) {
        for (const transId of dataToSave.translationIds) {
            await linkTranslations(newDocRef.id, transId);
        }
    }
  }
  showSuccess(t('noteSavedSuccess'));
  router.push({ name: 'ItemsList' });
}

// ✅ ✅ ✅ ИСПРАВЛЕННЫЙ БЛОК ✅ ✅ ✅
onMounted(() => {
  registerSaveAction(handleSave);
  if (isEditMode.value) {
    // Объявляем переменную, которая будет хранить функцию для остановки наблюдателя
    let unwatch = null;

    // Присваиваем результат вызова watch этой переменной
    unwatch = watch(items, (newItems) => {
      const itemToEdit = newItems.find(i => i.id === props.id);
      if (itemToEdit) {
        form.value = { 
          title: itemToEdit.title || '',
          text: itemToEdit.text || '',
          lang: itemToEdit.lang || 'be',
          tags: itemToEdit.tags || [],
          source: itemToEdit.source || '',
          linkedNoteIds: itemToEdit.linkedNoteIds || [],
          translationIds: itemToEdit.translationIds || [],
          isNovenaPrayer: itemToEdit.isNovenaPrayer || false,
          recommendedDate: itemToEdit.recommendedDate || null,
          hidden: itemToEdit.hidden || false
        };
        isFormReady.value = true;
        
        // Проверяем, существует ли функция, и вызываем ее, чтобы остановить наблюдение
        if (unwatch) {
          unwatch();
        }
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