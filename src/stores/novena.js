import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';

// Функция для получения даты в формате YYYY-MM-DD
const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const useNovenaStore = defineStore('novenas', () => {
  // Структура: { noteId: { startDate, totalDays, completedDates: ['YYYY-MM-DD'] } }
  const novenas = ref(JSON.parse(localStorage.getItem('prayerNovenas') || '{}'));

  // Автосохранение в localStorage при любых изменениях
  watch(novenas, (newNovenas) => {
    localStorage.setItem('prayerNovenas', JSON.stringify(newNovenas));
  }, { deep: true });

  // --- ACTIONS (Действия) ---

  function startNovena(noteId, totalDays) {
    if (!noteId || !totalDays) return;
    novenas.value[noteId] = {
      startDate: getTodayDateString(),
      totalDays: Number(totalDays),
      completedDates: [],
    };
  }

  function endNovena(noteId) {
    delete novenas.value[noteId];
  }

  function toggleDayCompletion(noteId, dateString) {
    const novena = novenas.value[noteId];
    if (!novena) return;
    
    const completedIndex = novena.completedDates.indexOf(dateString);
    if (completedIndex > -1) {
      // Если день уже отмечен, снимаем отметку
      novena.completedDates.splice(completedIndex, 1);
    } else {
      // Иначе, добавляем
      novena.completedDates.push(dateString);
      novena.completedDates.sort(); // Держим массив отсортированным
    }
  }

  // --- GETTERS (Вычисляемые свойства) ---

  const isNovenaActive = computed(() => (noteId) => {
    return !!novenas.value[noteId];
  });
  
  const getNovenaData = computed(() => (noteId) => {
      return novenas.value[noteId];
  });


  return {
    novenas,
    startNovena,
    endNovena,
    toggleDayCompletion,
    isNovenaActive,
    getNovenaData,
    getTodayDateString,
  };
});