import { ref } from 'vue';
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

const items = ref([]);
const allTags = ref([]);

const itemsCollection = collection(db, 'items');
// ✅ --- УБИРАЕМ СОРТИРОВКУ ПО isPinned ---
// Возвращаемся к простой сортировке только по дате создания.
const itemsQuery = query(itemsCollection, orderBy('createdAt', 'desc'));

onSnapshot(itemsQuery, (snapshot) => {
  items.value = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  allTags.value = [...new Set(items.value.flatMap(item => item.tags || []))].sort();
});

export function useItems() {

  const addItem = async (data) => {
    // ✅ Убираем поле isPinned при создании, оно больше не нужно в базе
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

  // ✅ УДАЛЯЕМ функцию togglePin отсюда. Ее больше здесь нет.

  return {
    items,
    allTags,
    addItem,
    deleteItem,
    updateItem,
    // И не экспортируем ее.
  };
}