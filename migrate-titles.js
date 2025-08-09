const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, updateDoc, doc, deleteField } = require("firebase/firestore");

// Та же конфигурация, что и в других ваших файлах
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

/**
 * Разовая функция для миграции поля 'title' в 'titleVersions.be'
 */
async function migrateTitles() {
  console.log("🚀 Запуск миграции заголовков...");
  const itemsCollection = collection(db, 'items');
  let processedCount = 0;
  let skippedCount = 0;

  try {
    const snapshot = await getDocs(itemsCollection);

    if (snapshot.empty) {
      console.log("Коллекция 'items' пуста. Нечего мигрировать.");
      return;
    }

    console.log(`Найдено ${snapshot.size} документов для проверки.`);

    // Используем Promise.all для параллельного выполнения обновлений
    const updatePromises = [];

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const docId = docSnapshot.id;

      // --- ОСНОВНАЯ ЛОГИКА ---
      // Обрабатываем документ, только если у него есть поле 'title'
      // и НЕТ поля 'titleVersions', чтобы не затереть новые данные.
      if (data.title && typeof data.title === 'string' && !data.titleVersions) {
        
        const oldTitle = data.title;
        
        // Создаем промис для обновления документа
        const updatePromise = updateDoc(doc(db, 'items', docId), {
          titleVersions: {
            be: oldTitle // Переносим старый заголовок в белорусскую версию
          },
          title: deleteField() // Удаляем старое поле 'title'
        });

        updatePromises.push(updatePromise);
        console.log(`  [ОБРАБОТКА] Документ '${docId}' будет обновлен. Title: "${oldTitle}"`);
        processedCount++;

      } else {
        console.log(`  [ПРОПУСК] Документ '${docId}' уже имеет новую структуру или не имеет поля title.`);
        skippedCount++;
      }
    }

    // Дожидаемся выполнения всех обновлений
    await Promise.all(updatePromises);

    console.log("\n✅ Миграция успешно завершена!");
    console.log(`   - Обработано и обновлено: ${processedCount} документов.`);
    console.log(`   - Пропущено: ${skippedCount} документов.`);

  } catch (error) {
    console.error("\n❌ КРИТИЧЕСКАЯ ошибка во время миграции:", error);
  }
}

// Запускаем функцию
migrateTitles();