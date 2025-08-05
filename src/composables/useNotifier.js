import { ref } from 'vue';

// Эта переменная будет хранить ссылку на наш компонент уведомлений
export const notifier = ref(null);

export function useNotifier() {
  const showSuccess = (message) => {
    if (notifier.value) {
      notifier.value.show(message, 'success');
    }
  };

  const showError = (message) => {
    if (notifier.value) {
      notifier.value.show(message, 'error');
    }
  };

  return { showSuccess, showError };
}   