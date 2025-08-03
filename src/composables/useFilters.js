import { ref } from 'vue';

// Создаем реактивные переменные для наших фильтров
const search = ref('');
const selectedTags = ref([]);

// Экспортируем функцию, которая будет предоставлять доступ
// к этим переменным в любом компоненте
export function useFilters() {
  return {
    search,
    selectedTags,
  };
}