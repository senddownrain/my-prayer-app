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

  return {
    items: sortedItems, // ✅ Экспортируем уже отсортированный массив
    allTags,
    isLoading, // ✅ Экспортируем состояние загрузки
    addItem,
    deleteItem,
    updateItem,
  };
}