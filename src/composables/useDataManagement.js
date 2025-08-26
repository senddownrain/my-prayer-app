// src/composables/useDataManagement.js
import { ref } from 'vue';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { useItems } from '@/composables/useItems';
import { useNotifier } from '@/composables/useNotifier';
import { useI18n } from 'vue-i18n';

export function useDataManagement() {
  const { items } = useItems(); // Нам нужны items только для экспорта
  const { showSuccess, showError } = useNotifier();
  const { t } = useI18n();

  const isImporting = ref(false);
  const isImportDialogVisible = ref(false);
  const importFile = ref(null);
  const previewItems = ref([]);
  const importMode = ref('add'); // 'add' или 'overwrite'

  const exportToJson = () => {
    try {
      // Удаляем реактивность и лишние поля перед экспортом
      const dataToExport = JSON.parse(JSON.stringify(items.value));
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prayers_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showSuccess(t('exportSuccess'));
    } catch (e) {
      console.error("JSON Export Error:", e);
      showError(t('exportError'));
    }
  };
  
  // Мы удаляем экспорт в CSV, так как он не подходит для новой структуры
  const exportToCsv = () => {
    showError('Экспорт в CSV больше не поддерживается.');
  };

  const importFromFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data)) throw new Error("JSON must be an array.");

        previewItems.value = data;
        importFile.value = file;
        isImportDialogVisible.value = true;
      } catch (e) {
        console.error("Import Error:", e);
        showError(t('importParseError'));
      }
    };
    reader.readAsText(file);
  };
  
  const confirmImport = async () => {
    isImporting.value = true;
    const batch = writeBatch(db);
    const itemsCollectionRef = collection(db, 'items');
    
    let addedCount = 0;
    let updatedCount = 0;

    try {
      // Если режим "перезаписать", нам нужно получить текущие ID из базы
      let existingIds = new Set();
      if (importMode.value === 'overwrite') {
        const querySnapshot = await getDocs(itemsCollectionRef);
        querySnapshot.forEach(doc => existingIds.add(doc.id));
      }

      for (const item of previewItems.value) {
        // У каждой записи должен быть ID. Если его нет, пропускаем.
        if (!item.id) continue;
        
        const docRef = doc(db, 'items', item.id);

        if (existingIds.has(item.id)) {
          // Если ID существует и режим 'overwrite'
          if (importMode.value === 'overwrite') {
            batch.set(docRef, item); // set полностью перезаписывает документ
            updatedCount++;
          }
        } else {
          // Если ID не существует, всегда добавляем
          batch.set(docRef, item);
          addedCount++;
        }
      }

      await batch.commit();
      showSuccess(t('importSuccess', { added: addedCount, updated: updatedCount }));

    } catch (e) {
      console.error("Error during Firestore batch operation:", e);
      showError(t('importDbError'));
    } finally {
      cancelImport();
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
    exportToJson, 
    exportToCsv,
    importFromFile,
    isImporting,
    isImportDialogVisible,
    importFile,
    previewItems,
    importMode,
    confirmImport,
    cancelImport
  };
}