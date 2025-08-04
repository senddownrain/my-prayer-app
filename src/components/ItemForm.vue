<template>
  <v-container>
    <v-form v-if="isFormReady" @submit.prevent="handleSave">
      <v-text-field v-model="form.title" :label="$t('title')" variant="outlined" class="mb-4"></v-text-field>
      <v-text-field v-model="form.source" :label="$t('source')" variant="outlined" class="mb-4" clearable></v-text-field>

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
        v-model="form.tags" :items="allTags" :label="$t('tags')"
        multiple chips clearable variant="outlined" class="mt-4"
      ></v-combobox>

      <v-divider class="my-4"></v-divider>
      <h3 class="text-subtitle-1 mb-2">Связанные заметки</h3>
      <div v-if="form.linkedNoteIds && form.linkedNoteIds.length > 0" class="mb-3">
        <v-chip v-for="linkedNote in currentlyLinkedNotes" :key="linkedNote.id" class="mr-2 mb-2" closable @click:close="removeLink(linkedNote.id)">
          {{ linkedNote.title }}
        </v-chip>
      </div>
      <v-btn @click="isLinkDialogOpen = true" prepend-icon="mdi-link-plus">Добавить связь</v-btn>
    </v-form>
    
    <div v-else class="text-center mt-16"><v-progress-circular indeterminate color="primary"></v-progress-circular></div>

    <v-dialog v-model="isLinkDialogOpen" max-width="500px">
      <v-card>
        <v-card-title>Выберите заметку для связи</v-card-title>
        <v-list>
          <v-list-item v-for="note in availableNotesToLink" :key="note.id" :title="note.title" @click="addLink(note.id)"></v-list-item>
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

const form = ref({
  title: '',
  source: '',
  textVersions: { ru: '', be: '', la: '' },
  tags: [],
  linkedNoteIds: []
});

const isLinkDialogOpen = ref(false);
const currentlyLinkedNotes = computed(() => form.value.linkedNoteIds?.map(id => items.value.find(item => item.id === id)).filter(Boolean) || []);
const availableNotesToLink = computed(() => items.value.filter(item => item.id !== props.id && !form.value.linkedNoteIds?.includes(item.id)));
function addLink(noteId) { form.value.linkedNoteIds.push(noteId); isLinkDialogOpen.value = false; }
function removeLink(noteId) { form.value.linkedNoteIds = form.value.linkedNoteIds.filter(id => id !== noteId); }

async function handleSave() {
  if (!form.value.title) return;
  const dataToSave = {
    title: form.value.title,
    source: form.value.source || '',
    textVersions: form.value.textVersions,
    tags: form.value.tags,
    linkedNoteIds: form.value.linkedNoteIds || []
  };
  if (isEditMode.value) await updateItem(props.id, dataToSave);
  else await addItem(dataToSave);
  router.push({ name: 'ItemsList' });
}

onMounted(() => {
  setAppBar({
    title: isEditMode.value ? t('editing') : t('newNote'),
    showBackButton: true,
    actions: [{ icon: 'mdi-check', onClick: handleSave }]
  });
  if (isEditMode.value) {
    watch(items, (newItems) => {
      const itemToEdit = newItems.find(i => i.id === props.id);
      if (itemToEdit) {
        form.value = { ...itemToEdit, source: itemToEdit.source || '', tags: itemToEdit.tags || [], textVersions: itemToEdit.textVersions || {}, linkedNoteIds: itemToEdit.linkedNoteIds || [] };
        isFormReady.value = true;
      }
    }, { immediate: true });
  } else {
    isFormReady.value = true;
  }
});
onUnmounted(resetAppBar);
</script>