import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
export const usePrayerRuleStore = defineStore('prayerRule', () => {
  // Теперь храним только ID заметки
  const ruleItems = ref(JSON.parse(localStorage.getItem('prayerRule') || '[]'));
  watch(ruleItems, (newRule) => {
    localStorage.setItem('prayerRule', JSON.stringify(newRule));
  }, { deep: true });
  function addItem(item) {
    if (!item || ruleItems.value.some(itemId => itemId === item.id)) return;
    ruleItems.value.push(item.id);
  }
  function removeItem(index) {
    ruleItems.value.splice(index, 1);
  }
  
  // Функция updateItemLanguage больше не нужна
  function moveItem(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= ruleItems.value.length || toIndex < 0 || toIndex >= ruleItems.value.length) {
      return;
    }
    const [item] = ruleItems.value.splice(fromIndex, 1);
    ruleItems.value.splice(toIndex, 0, item);
  }
  return { 
    ruleItems, 
    addItem,
    removeItem,
    moveItem
  };
});