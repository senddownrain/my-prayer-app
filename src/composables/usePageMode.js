// src/composables/usePageMode.js
import { ref } from 'vue';

// Объявляем состояние ВНЕ функции, чтобы оно было синглтоном (единым для всех)
const isEditing = ref(false);

// ✅ ИСПРАВЛЕНИЕ ЗДЕСЬ: Добавлено слово 'export'
export function usePageMode() {
  const toggleEditing = () => {
    isEditing.value = !isEditing.value;
  };

  const setEditing = (value) => {
    isEditing.value = value;
  };

  return {
    isEditing,
    toggleEditing,
    setEditing,
  };
}