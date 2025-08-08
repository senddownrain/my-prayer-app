// src/composables/useNovenaSuggestions.js
import { ref } from 'vue';
import { useItems } from '@/composables/useItems';
import { useNovenaStore } from '@/stores/novena';
import { useRouter } from 'vue-router';


const suggestion = ref(null); // { item, days }

export function useNovenaSuggestions() {
  const { items } = useItems();
  const novenaStore = useNovenaStore();
  const router = useRouter();

   // Загружаем отклоненные предложения из localStorage
  const dismissedSuggestions = ref(JSON.parse(localStorage.getItem('dismissedSuggestions') || '{}'));

  /**
   * Проверяет предложения по новеннам.
   * @param {Date} [simulatedDate=new Date()] - Опциональная дата для симуляции "сегодняшнего дня" при тестировании.
   */
  const checkSuggestions = (simulatedDate) => {
    const today = simulatedDate ? new Date(simulatedDate) : new Date();
    today.setHours(0, 0, 0, 0); // Обнуляем время для точного сравнения дат

    for (const item of items.value) {
      if (item.isNovenaPrayer && item.recommendedDate && !novenaStore.isNovenaActive(item.id)) {
        
        const recommended = new Date(item.recommendedDate);
        const recommendedMonth = recommended.getMonth();
        const recommendedDay = recommended.getDate();

        // Проверяем для текущего и следующего года, чтобы обработать переходы через год
        for (const year of [today.getFullYear(), today.getFullYear() + 1]) {
            const targetDate = new Date(year, recommendedMonth, recommendedDay);

            // Проверяем новенны на 9 дня
            for (const days of [9]) {
                const startDate = new Date(targetDate);
                startDate.setDate(targetDate.getDate() - (days - 1));

                if (startDate.getTime() === today.getTime()) {
                    const suggestionId = `${item.id}-${days}-${year}`;
            // ✅ Проверяем, не было ли это предложение уже отклонено
            if (!dismissedSuggestions.value[suggestionId]) {
                suggestion.value = { item, days, id: suggestionId };
                return;
            }
                }
            }
        }
      }
    }
    console.log('Подходящих предложений по новеннам не найдено.');
  };

    // ✅ НОВАЯ ЛОГИКА для кнопки "Посмотреть"
  const viewSuggestedNovena = () => {
    if (!suggestion.value) return;
    const { item } = suggestion.value;
    // Переходим на страницу молитвы
    router.push({ name: 'ItemView', params: { id: item.id } });
    // Запоминаем, что это предложение было принято (или просмотрено)
    dismissSuggestion(true); 
  };
  
  // ✅ НОВАЯ ЛОГИКА для кнопки "Закрыть"
  const dismissSuggestion = (permanently = false) => {
    if (permanently && suggestion.value) {
        // Добавляем ID предложения в список отклоненных с меткой времени
        dismissedSuggestions.value[suggestion.value.id] = Date.now();
        localStorage.setItem('dismissedSuggestions', JSON.stringify(dismissedSuggestions.value));
    }
    suggestion.value = null;
  };

  return {
    suggestion,
    checkSuggestions,
    dismissSuggestion,
    viewSuggestedNovena, // ✅ Экспортируем новую функцию
  };
}