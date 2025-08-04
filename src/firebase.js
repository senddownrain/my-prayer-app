import { initializeApp } from "firebase/app";
// ✅ --- ШАГ 1: Исправляем импорт ---
// Меняем enablePersistence на enableIndexedDbPersistence
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  // ... ваша конфигурация Firebase без изменений ...
  apiKey: "AIzaSyDF2TD4MTcKiBChKRssauvL-nNyT4Am9N0",
  authDomain: "molitwy.firebaseapp.com",
  projectId: "molitwy",
  storageBucket: "molitwy.firebasestorage.app",
  messagingSenderId: "654293224787",
  appId: "1:654293224787:web:5f4fce64abf5ba1b1ea5a6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ --- ШАГ 2: Исправляем вызов функции ---
// Также меняем enablePersistence на enableIndexedDbPersistence
enableIndexedDbPersistence(db)
  .catch((err) => {
      if (err.code == 'failed-precondition') {
          // Скорее всего, открыто несколько вкладок. Оффлайн будет работать только в одной.
          console.warn('Persistence failed, likely due to multiple tabs. Offline mode will work in one tab only.');
      } else if (err.code == 'unimplemented') {
          // Браузер не поддерживает эту функцию.
          console.error('The current browser does not support all of the features required to enable persistence.');
      }
  });

// Экспортируем db, как и раньше
export { db };