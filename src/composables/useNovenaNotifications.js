import { useNovenaStore } from '@/stores/novena';
import { useItems } from '@/composables/useItems';
import { getTitleByLang } from '@/utils/i18n';
import { useSettingsStore } from '@/stores/settings';

export function useNovenaNotifications() {
  const novenaStore = useNovenaStore();
  const settings = useSettingsStore();
  const { items } = useItems();

  async function scheduleTodayNotifications() {
    if (!settings.novenaNotificationsEnabled) return;
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;

    if (Notification.permission !== 'granted') {
      try {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') return;
      } catch (err) {
        return;
      }
    }

    const today = novenaStore.getTodayDateString();
    for (const [noteId, novena] of Object.entries(novenaStore.novenas)) {
      if (!novena.completedDates.includes(today)) {
        const item = items.value.find((i) => i.id === noteId);
        const title = item ? getTitleByLang(item) : 'Novena';
        const dayNumber = novena.completedDates.length + 1;
        const body = `День ${dayNumber} новенны`;

        try {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification(title, { body });
        } catch (err) {
          new Notification(title, { body });
        }
      }
    }
  }

  return { scheduleTodayNotifications };
}
