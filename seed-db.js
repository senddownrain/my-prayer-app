const { initializeApp } = require("firebase/app");
// ✅ --- ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ: Добавил 'doc' в список --- ✅
const { getFirestore, collection, getDocs, writeBatch, addDoc, serverTimestamp, updateDoc, doc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDF2TD4MTcKiBChKRssauvL-nNyT4Am9N0",
  authDomain: "molitwy.firebaseapp.com",
  projectId: "molitwy",
  storageBucket: "molitwy.firebasestorage.app",
  messagingSenderId: "654293224787",
  appId: "1:654293224787:web:5f4fce64abf5ba1b1ea5a6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const prayersData = [
  { id: "pater_noster", title: "Отче наш", tags: ["основные"], textVersions: { ru: "<p>Текст...</p>", be: "<p>Тэкст...</p>", la: "<p>Text...</p>" } },
  { id: "ave_maria", title: "Радуйся, Мария", tags: ["основные", "марианские"], textVersions: { ru: "<p>Текст...</p>", be: "<p>Тэкст...</p>", la: "<p>Text...</p>" } },
  { id: "credo", title: "Символ веры", tags: ["основные"], textVersions: { ru: "<p>Текст...</p>", be: "<p>Тэкст...</p>", la: "<p>Text...</p>" }, linkedNoteIds: ["pater_noster", "ave_maria"] },
  { id: "gloria_patri", title: "Слава", tags: ["основные"], textVersions: { ru: "<p>Текст...</p>", be: "<p>Тэкст...</p>", la: "<p>Text...</p>" }, linkedNoteIds: ["pater_noster"] },
];

async function clearCollection(db, collectionPath) {
  const collectionRef = collection(db, collectionPath);
  const snapshot = await getDocs(collectionRef);
  if (snapshot.empty) { console.log(`Коллекция '${collectionPath}' уже пуста.`); return; }
  const batch = writeBatch(db);
  snapshot.docs.forEach(doc => { batch.delete(doc.ref); });
  await batch.commit();
  console.log(`Все документы в коллекции '${collectionPath}' были удалены.`);
}

async function seedDatabase() {
  try {
    console.log("Очистка коллекции 'items'...");
    await clearCollection(db, 'items');
    console.log("Наполнение базы новыми данными...");
    const itemsCollection = collection(db, 'items');
    const addedIds = {};

    for (const prayer of prayersData) {
      const dataToAdd = {
        title: prayer.title,
        tags: prayer.tags,
        textVersions: prayer.textVersions,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(itemsCollection, dataToAdd);
      addedIds[prayer.id] = docRef.id;
      console.log(`- Добавлена: "${prayer.title}"`);
    }

    console.log("Обновление связей...");
    for (const prayer of prayersData) {
        if (prayer.linkedNoteIds && prayer.linkedNoteIds.length > 0) {
            const realLinkedIds = prayer.linkedNoteIds.map(tempId => addedIds[tempId]);
            const realDocId = addedIds[prayer.id];
            // Теперь и doc(), и updateDoc() импортированы и будут работать
            await updateDoc(doc(db, "items", realDocId), { linkedNoteIds: realLinkedIds });
            console.log(`- Обновлены связи для "${prayer.title}"`);
        }
    }
    console.log("Наполнение базы завершено!");
  } catch (error) {
    console.error("КРИТИЧЕСКАЯ ошибка:", error);
  }
}

seedDatabase();