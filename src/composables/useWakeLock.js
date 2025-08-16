// src/composables/useWakeLock.js
import { onUnmounted } from 'vue';

let wakeLock = null;

// Асинхронная функция для запроса блокировки
const requestWakeLock = async () => {
  // Проверяем, поддерживается ли API
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('Screen Wake Lock is active.');
      // Полезно слушать событие, когда система сама отпускает блокировку (например, при сворачивании)
      wakeLock.addEventListener('release', () => {
        console.log('Screen Wake Lock was released by the system.');
        wakeLock = null;
      });
    } catch (err) {
      console.error(`Wake Lock request failed: ${err.name}, ${err.message}`);
    }
  } else {
    console.warn('Wake Lock API is not supported by this browser.');
  }
};

// Асинхронная функция для снятия блокировки
const releaseWakeLock = async () => {
  if (wakeLock !== null) {
    try {
      await wakeLock.release();
      wakeLock = null;
      console.log('Screen Wake Lock released.');
    } catch (err) {
      console.error(`Wake Lock release failed: ${err.name}, ${err.message}`);
    }
  }
};

// Экспортируем основную функцию composable
export function useWakeLock() {
  // При уничтожении компонента, который использует эту логику, мы гарантированно снимаем блокировку
  onUnmounted(() => {
    releaseWakeLock();
  });

  return {
    requestWakeLock,
    releaseWakeLock,
  };
}