<template>
  <v-container>
    <div v-if="!isLoading && item">
      <h2 class="text-h5 font-weight-bold mb-4">{{ item.title }}</h2>
      <div v-for="(text, lang) in availableVersions" :key="lang" class="mb-4">
        <h2 class="text-h6 font-weight-medium text-grey-darken-1 mb-2">{{ t('langNames.' + lang) }}</h2>
        <div v-html="text" class="note-content-area ProseMirror"></div>
      </div>
      
      <div v-if="linkedNotes.length > 0" class="mt-8">
        <v-divider class="mb-4"></v-divider>
        <h3 class="text-subtitle-1 font-weight-bold mb-2">{{ $t('linkedNotesTitle') }}</h3>
        <v-list lines="one" density="compact" class="pa-0 bg-transparent linked-notes-list">
          <v-list-item
            v-for="linkedNote in linkedNotes"
            :key="linkedNote.id"
            @click="router.push({ name: 'ItemView', params: { id: linkedNote.id } })"
            rounded="lg"
            class="mb-1"
          >
            <template v-slot:prepend>
              <v-icon color="grey-darken-1">mdi-link-variant</v-icon>
            </template>
            <v-list-item-title class="text-primary font-weight-medium">{{ linkedNote.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </div>

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
    
    <div v-else-if="!isLoading && !item" class="text-center mt-16">
        <v-icon size="64" class="mb-4">mdi-file-question-outline</v-icon>
        <h2 class="text-h5 mb-4">{{ $t('noteNotFound') }}</h2>
        <p class="text-medium-emphasis mb-6">{{ $t('noteNotFoundMessage') }}</p>
        <v-btn color="primary" :to="{ name: 'ItemsList' }">{{ $t('backToHome') }}</v-btn>
    </div>
    
    <div v-else class="text-center text-grey-darken-1 mt-16">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
  </v-container>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useItems } from '@/composables/useItems';
import { useAppBar } from '@/composables/useAppBar';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';

const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();
const { t } = useI18n();
const { items, isLoading } = useItems();
const { setAppBar, resetAppBar } = useAppBar();
const authStore = useAuthStore();

const item = computed(() => items.value.find(i => i.id === props.id));
const linkedNotes = computed(() => item.value?.linkedNoteIds?.map(id => items.value.find(note => note.id === id)).filter(Boolean) || []);
const availableVersions = computed(() => item.value ? Object.fromEntries(Object.entries(item.value.textVersions).filter(([_, v]) => v)) : {});

const updateAppBarForItem = (currentItem) => {
  if (currentItem) {
    setAppBar({
      title: currentItem.title,
      showBackButton: true,
      actions: authStore.user ? [{ icon: 'mdi-pencil', onClick: () => router.push({ name: 'ItemEdit', params: { id: currentItem.id } }) }] : []
    });
  }
};

onMounted(() => {
  watch(item, updateAppBarForItem, { immediate: true });
});

onUnmounted(resetAppBar);
</script>