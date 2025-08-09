const { initializeApp } = require("firebase/app");
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

// ✅ ИЗМЕНЕНИЕ: структура данных теперь использует titleVersions
const prayersData = [
  { id: "pater_noster", titleVersions: { ru: "Отче наш", be: "Ойча наш", la: "Pater Noster" }, tags: ["основные"], textVersions: { ru: "<p>Текст...</p>", be: "<p>Тэкст...</p>", la: "<p>Text...</p>" } },
  { id: "ave_maria", titleVersions: { ru: "Радуйся, Мария", be: "Вітай, Марыя", la: "Ave Maria" }, tags: ["основные", "марианские"], textVersions: { ru: "<p>Текст...</p>", be: "<p>Тэкст...</p>", la: "<p>Text...</p>" } },
  { id: "credo", titleVersions: { ru: "Символ веры", be: "Сімвал веры", la: "Credo" }, tags: ["основные"], textVersions: { ru: "<p>Текст...</p>", be: "<p>Тэкст...</p>", la: "<p>Text...</p>" }, linkedNoteIds: ["pater_noster", "ave_maria"] },
  { id: "gloria_patri", titleVersions: { ru: "Слава", be: "Хвала", la: "Gloria Patri" }, tags: ["основные"], textVersions: { ru: "<p>Текст...</p>", be: "<p>Тэкст...</p>", la: "<p>Text...</p>" }, linkedNoteIds: ["pater_noster"] },
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
      // ✅ ИЗМЕНЕНИЕ: Собираем данные с titleVersions
      const dataToAdd = {
        titleVersions: prayer.titleVersions,
        tags: prayer.tags,
        textVersions: prayer.textVersions,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(itemsCollection, dataToAdd);
      addedIds[prayer.id] = docRef.id;
      console.log(`- Добавлена: "${prayer.titleVersions.be || prayer.titleVersions.ru}"`);
    }

    console.log("Обновление связей...");
    for (const prayer of prayersData) {
        if (prayer.linkedNoteIds && prayer.linkedNoteIds.length > 0) {
            const realLinkedIds = prayer.linkedNoteIds.map(tempId => addedIds[tempId]);
            const realDocId = addedIds[prayer.id];
            await updateDoc(doc(db, "items", realDocId), { linkedNoteIds: realLinkedIds });
            console.log(`- Обновлены связи для "${prayer.titleVersions.be || prayer.titleVersions.ru}"`);
        }
    }
    console.log("Наполнение базы завершено!");
  } catch (error) {
    console.error("КРИТИЧЕСКАЯ ошибка:", error);
  }
}

seedDatabase();