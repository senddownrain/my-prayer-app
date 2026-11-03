import { ref } from 'vue';
import { collection, doc, writeBatch, getDocsFromServer, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useItems } from '@/composables/useItems';
import { useNotifier } from '@/composables/useNotifier';
import { useI18n } from 'vue-i18n';
import { validateBackup, createImportPlan } from '@/utils/importPlan.mjs';

const BATCH_SIZE = 400; // Keep safely below Firestore's batch write limit.

function restoreFirestoreFields(data) {
  const result = { ...data };
  const date = result.createdAt;
  if (date && typeof date === 'object') {
    const seconds = date.seconds ?? date._seconds;
    const nanoseconds = date.nanoseconds ?? date._nanoseconds;
    if (Number.isInteger(seconds) && Number.isInteger(nanoseconds)) {
      result.createdAt = new Timestamp(seconds, nanoseconds);
    }
  } else if (!date) {
    result.createdAt = serverTimestamp();
  }
  return result;
}

export function useDataManagement() {
  const { items } = useItems();
  const { showSuccess, showError } = useNotifier();
  const { t } = useI18n();

  const isImporting = ref(false);
  const isImportDialogVisible = ref(false);
  const importFile = ref(null);
  const previewItems = ref([]);
  const importMode = ref('add');

  const exportToJson = () => {
    try {
      const dataToExport = JSON.parse(JSON.stringify(items.value));
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prayers_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showSuccess(t('exportSuccess'));
    } catch (error) {
      console.error('JSON Export Error:', error);
      showError(t('exportError'));
    }
  };

  const exportToCsv = () => showError('Экспорт в CSV больше не поддерживается.');

  const importFromFile = (file) => {
    if (!file || isImporting.value) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = validateBackup(JSON.parse(event.target.result));
        previewItems.value = data;
        importFile.value = file;
        isImportDialogVisible.value = true;
      } catch (error) {
        console.error('Import validation error:', error);
        showError(t('importParseError') + ': ' + error.message);
      }
    };
    reader.onerror = () => showError(t('importParseError'));
    reader.readAsText(file);
  };

  const confirmImport = async () => {
    if (isImporting.value) return;
    isImporting.value = true;

    try {
      // Always check the server, even in "add" mode. An offline cache is not
      // authoritative enough to protect existing documents from replacement.
      const snapshot = await getDocsFromServer(collection(db, 'items'));
      const existingIds = new Set(snapshot.docs.map(item => item.id));
      const plan = createImportPlan(previewItems.value, existingIds, importMode.value);

      for (let index = 0; index < plan.operations.length; index += BATCH_SIZE) {
        const batch = writeBatch(db);
        for (const item of plan.operations.slice(index, index + BATCH_SIZE)) {
          batch.set(doc(db, 'items', item.id), restoreFirestoreFields(item.data));
        }
        await batch.commit();
      }

      showSuccess(t('importSuccess', { added: plan.added, updated: plan.updated }) +
        (plan.skipped ? ` (${plan.skipped} skipped)` : ''));
      cancelImport();
    } catch (error) {
      // Keep the dialog and input on failure so the user can retry.
      console.error('Error during Firestore import:', error);
      showError(t('importDbError') + ': ' + error.message);
    } finally {
      isImporting.value = false;
    }
  };

  const cancelImport = () => {
    isImportDialogVisible.value = false;
    importFile.value = null;
    previewItems.value = [];
    importMode.value = 'add';
  };

  return {
    exportToJson, exportToCsv, importFromFile,
    isImporting, isImportDialogVisible, importFile, previewItems, importMode,
    confirmImport, cancelImport,
  };
}
