import { initializeApp } from "firebase/app";
// ✅ Возвращаем правильную инициализацию Firestore с поддержкой оффлайн-кэширования
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDF2TD4MTcKiBChKRssauvL-nNyT4Am9N0",
  authDomain: "molitwy.firebaseapp.com",
  projectId: "molitwy",
  storageBucket: "molitwy.firebasestorage.app",
  messagingSenderId: "654293224787",
  appId: "1:654293224787:web:5f4fce64abf5ba1b1ea5a6"
};

const app = initializeApp(firebaseConfig);

// ✅ Используем НОВЫЙ метод инициализации с настройками кэша,
// который заменяет и getFirestore(), и enableIndexedDbPersistence()
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({})
});

// Экспортируем db, как и раньше
export { db };