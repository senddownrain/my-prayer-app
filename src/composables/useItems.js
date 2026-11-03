import { ref, computed } from 'vue';
import { db } from '@/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc,
  serverTimestamp,
  query,
  orderBy,
  writeBatch,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { useSettingsStore } from '@/stores/settings';
import { getTitleByLang } from '@/utils/i18n'; // ✅ 1. ИМПОРТИРУЕМ

const items = ref([]);
const allTags = ref([]);
const isLoading = ref(true); // ✅ Добавляем состояние загрузки

const itemsCollection = collection(db, 'items');
const itemsQuery = query(itemsCollection, orderBy('createdAt', 'desc'));

onSnapshot(itemsQuery, (snapshot) => {
  items.value = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  allTags.value = [...new Set(items.value.flatMap(item => item.tags || []))].sort();
  isLoading.value = false; // ✅ Выключаем загрузку, когда данные получены
}, (error) => {
  console.error("Ошибка получения данных из Firestore: ", error);
  isLoading.value = false;
});

export function useItems() {
  const settings = useSettingsStore();

  // ✅ Создаем вычисляемое свойство для сортировки по закрепленным заметкам
  const sortedItems = computed(() => {
    if (!items.value) return [];
    return [...items.value].sort((a, b) => (settings.isPinned(b.id) - settings.isPinned(a.id)));
  });

  // ✅ ПРЕВРАЩАЕМ allTags В COMPUTED СВОЙСТВО
  const allTags = computed(() => {
    // Сначала фильтруем заметки
    const visibleItems = items.value.filter(item => 
      settings.showHiddenItems ? true : !item.hidden
    );
    // Затем собираем теги только из видимых заметок
    const tags = visibleItems.flatMap(item => item.tags || []);
    return [...new Set(tags)].sort();
  });

  const addItem = async (data) => {
    const docRef = await addDoc(itemsCollection, {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef;
  };

  const deleteItem = async (id) => {
    await deleteDoc(doc(db, 'items', id));
  };

  const updateItem = async (id, data) => {
    const dataToUpdate = { ...data };
    delete dataToUpdate.id; 
    await updateDoc(doc(db, 'items', id), dataToUpdate);
  };

  // Save a prayer and its reverse translation references in one Firestore batch.
  const saveItemWithTranslations = async (id, data, previousTranslationIds = []) => {
    const itemRef = id ? doc(db, 'items', id) : doc(itemsCollection);
    const desired = [...new Set((data.translationIds || []).filter(Boolean))].filter(other => other !== itemRef.id);
    const previous = [...new Set(previousTranslationIds.filter(Boolean))].filter(other => other !== itemRef.id);
    const added = desired.filter(other => !previous.includes(other));
    const removed = previous.filter(other => !desired.includes(other));

    if (added.length + removed.length > 400) {
      throw new Error('Too many translation link changes for a single save.');
    }

    const batch = writeBatch(db);
    const payload = { ...data, translationIds: desired };
    delete payload.id;
    if (id) batch.update(itemRef, payload);
    else batch.set(itemRef, { ...payload, createdAt: serverTimestamp() });

    for (const other of added) {
      batch.update(doc(db, 'items', other), { translationIds: arrayUnion(itemRef.id) });
    }
    for (const other of removed) {
      batch.update(doc(db, 'items', other), { translationIds: arrayRemove(itemRef.id) });
    }
    await batch.commit();
    return itemRef;
  };

  const linkTranslations = async (docId1, docId2, remove = false) => {
    if (!docId1 || !docId2 || docId1 === docId2) return;
    const batch = writeBatch(db);
    const operation = remove ? arrayRemove : arrayUnion;
    batch.update(doc(db, 'items', docId1), { translationIds: operation(docId2) });
    batch.update(doc(db, 'items', docId2), { translationIds: operation(docId1) });
    await batch.commit();
  };

   const allLangs = computed(() => {
    if (!items.value) return [];
    // Собираем все уникальные языки из заметок
    const langs = items.value.map(item => item.lang);
    // Возвращаем отсортированный массив уникальных значений
    return [...new Set(langs)].sort();
  });


  const getTitle = (item) => {
    return item?.title || '';
  };


  return {
    items: sortedItems, // ✅ Экспортируем уже отсортированный массив
    allTags,
    isLoading, // ✅ Экспортируем состояние загрузки
    addItem,
    deleteItem,
    updateItem,
    getTitle, // ✅ 3. ЭКСПОРТИРУЕМ
  linkTranslations,
  saveItemWithTranslations,
  allLangs
  };
}