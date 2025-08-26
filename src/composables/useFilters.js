import { ref } from 'vue';

// Создаем реактивные переменные для наших фильтров
const search = ref('');
const selectedTags = ref([]);

const selectedLangs = ref([]); // ✅ ДОБАВЬТЕ ЭТУ СТРОКУ

// Экспортируем функцию, которая будет предоставлять доступ
// к этим переменным в любом компоненте
export function useFilters() {
  return {
    search,
    selectedTags,
    selectedLangs, // ✅ И ЭТУ
  };
}