<template>
  <v-container>
    <v-card>
      <v-card-title class="text-h5">{{ $t('admin') }}</v-card-title>
      <v-card-text>
        <p>
          {{ $t('adminText') }}
        </p>
      </v-card-text>
    </v-card>

    <!-- Секция общих настроек -->
    <v-list lines="two" subheader class="mt-4">
      <v-list-subheader>{{ $t('generalSettings') }}</v-list-subheader>
      <v-list-item 
        :title="$t('showHiddenNotes')" 
        :subtitle="$t('showHiddenNotesHint')"
      >
        <template v-slot:prepend><v-icon>mdi-eye-off-outline</v-icon></template>
        <template v-slot:append>
          <v-switch
            :model-value="settings.showHiddenItems"
            @update:model-value="settings.toggleShowHiddenItems"
            color="primary"
            inset
            hide-details
          ></v-switch>
        </template>
      </v-list-item>
    </v-list>
    
    <!-- ✅ НОВАЯ СЕКЦИЯ: Управление данными -->
    <v-list lines="one" subheader class="mt-2">
        <v-list-subheader>{{ $t('dataManagement') }}</v-list-subheader>
        <v-card variant="tonal" class="mx-2 pa-2">
            <div class="d-flex flex-wrap ga-2">
                 <v-btn @click="exportToJson" prepend-icon="mdi-code-json" color="primary" variant="outlined">{{ $t('exportToJson') }}</v-btn>
                 <v-btn @click="exportToCsv" prepend-icon="mdi-file-delimited-outline">{{ $t('exportToCsv') }}</v-btn>
                 <v-spacer />
                 <v-btn @click="triggerImport" prepend-icon="mdi-application-import" color="secondary" variant="flat">{{ $t('importFromFile') }}</v-btn>
                 <input ref="fileInput" type="file" hidden @change="handleFileSelect">
            </div>
        </v-card>
    </v-list>

    <!-- Диалог подтверждения импорта -->
    <v-dialog v-model="isImportDialogVisible" max-width="500px" persistent>
        <v-card v-if="importFile">
            <v-card-title class="text-h5">{{ $t('importConfirmationTitle') }}</v-card-title>
            <v-card-text>
                <p class="mb-2">{{ $t('importConfirmationMessage', { count: previewItems.length, fileName: importFile.name }) }}</p>
                <p class="text-medium-emphasis text-caption">{{ $t('importWarning') }}</p>
                
                <v-radio-group v-model="importMode" inline class="mt-4">
                    <template v-slot:label><div>{{ $t('importModeLabel') }}</div></template>
                    <v-radio :label="$t('importMode.add')" value="add"></v-radio>
                    <v-radio :label="$t('importMode.overwrite')" value="overwrite"></v-radio>
                </v-radio-group>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="cancelImport">{{ $t('cancel') }}</v-btn>
                <v-btn color="primary" variant="flat" @click="confirmImport" :loading="isImporting">{{ $t('import') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useDataManagement } from '@/composables/useDataManagement';

const settings = useSettingsStore();
const fileInput = ref(null);

const { 
  exportToCsv, 
  exportToJson, 
  importFromFile,
  isImporting,
  isImportDialogVisible,
  importFile,
  previewItems,
  importMode,
  confirmImport,
  cancelImport
} = useDataManagement();

const triggerImport = () => {
    fileInput.value.click();
};

const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        importFromFile(file);
    }
};
</script>