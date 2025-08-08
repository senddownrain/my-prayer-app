// src/stores/prayerRuleStore.js
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const usePrayerRuleStore = defineStore('prayerRule', () => {
  const ruleItems = ref(JSON.parse(localStorage.getItem('prayerRule') || '[]'));

  watch(ruleItems, (newRule) => {
    localStorage.setItem('prayerRule', JSON.stringify(newRule));
  }, { deep: true });

  function addItem(item) {
    if (!item || ruleItems.value.some(rule => rule.itemId === item.id)) return;
    ruleItems.value.push({
      itemId: item.id,
      lang: 'be', 
    });
  }

  function removeItem(index) {
    ruleItems.value.splice(index, 1);
  }

  function updateItemLanguage(index, newLang) {
    if (ruleItems.value[index]) {
      ruleItems.value[index].lang = newLang;
    }
  }
  
  // ✅ ВОЗВРАЩАЕМ ЭТУ ФУНКЦИЮ ДЛЯ РАБОТЫ КНОПОК
  function moveItem(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= ruleItems.value.length || toIndex < 0 || toIndex >= ruleItems.value.length) {
      return;
    }
    // Вырезаем элемент и вставляем его в новую позицию
    const [item] = ruleItems.value.splice(fromIndex, 1);
    ruleItems.value.splice(toIndex, 0, item);
  }

  return { 
    ruleItems, 
    addItem,
    removeItem,
    updateItemLanguage,
    moveItem // ✅ Убедитесь, что она экспортируется
  };
});