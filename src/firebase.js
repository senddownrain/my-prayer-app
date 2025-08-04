import { initializeApp } from "firebase/app";
// ✅ 1. Импортируем initializeFirestore и persistentLocalCache
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

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

// ✅ 2. Используем НОВЫЙ метод инициализации с настройками кэша
// Это заменяет и getFirestore(), и enableIndexedDbPersistence()
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    // Можно добавить настройки, например, для работы в нескольких вкладках
    // tabManager: 'multi-tab' 
  })
});

// Экспортируем db, как и раньше
export { db };