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
  orderBy
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

   const linkTranslations = async (docId1, docId2, remove = false) => {
    const doc1Ref = doc(db, 'items', docId1);
    const doc2Ref = doc(db, 'items', docId2);
    const doc1 = items.value.find(i => i.id === docId1);
    const doc2 = items.value.find(i => i.id === docId2);
    if (!doc1 || !doc2) return;
    // Обновляем первый документ
    let newTrans1 = doc1.translationIds ? [...doc1.translationIds] : [];
    if (remove) {
      newTrans1 = newTrans1.filter(id => id !== docId2);
    } else if (!newTrans1.includes(docId2)) {
      newTrans1.push(docId2);
    }
    await updateDoc(doc1Ref, { translationIds: newTrans1 });
    // Обновляем второй документ
    let newTrans2 = doc2.translationIds ? [...doc2.translationIds] : [];
    if (remove) {
      newTrans2 = newTrans2.filter(id => id !== docId1);
    } else if (!newTrans2.includes(docId1)) {
      newTrans2.push(docId1);
    }
    await updateDoc(doc2Ref, { translationIds: newTrans2 });
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
  allLangs
  };
}