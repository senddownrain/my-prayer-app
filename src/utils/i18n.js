// src/utils/i18n.js

/**
 * Получает заголовок для элемента в соответствии с предпочитаемым языком и резервными вариантами.
 *
 * @param {object} item - Объект заметки, содержащий titleVersions.
 * @param {string[]} langOrder - Массив кодов языков в порядке предпочтения (напр., ['be', 'ru', 'la', 'pl']).
 * @returns {string} - Наиболее подходящий заголовок или пустая строка.
 */
export function getTitleByLang(item, langOrder = ['be', 'ru', 'la', 'pl']) {
  if (!item || !item.titleVersions) {
    return '';
  }

  // 1. Ищем заголовок в соответствии с порядком языков
  for (const lang of langOrder) {
    if (item.titleVersions[lang]) {
      return item.titleVersions[lang];
    }
  }

  // 2. Если ничего не найдено, берем первый доступный заголовок из объекта
  const availableLangs = Object.keys(item.titleVersions).filter(k => item.titleVersions[k]);
  if (availableLangs.length > 0) {
    return item.titleVersions[availableLangs[0]];
  }
  
  // 3. Если заголовков нет вообще
  return '';
}