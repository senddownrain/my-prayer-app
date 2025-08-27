<template>
  <v-app :theme="settings.currentTheme">
    <v-navigation-drawer v-model="isDrawerOpen" temporary>
      
      <!-- ✅ --- ФИНАЛЬНАЯ ВЕРСИЯ БЛОКА С ИЗОБРАЖЕНИЕМ --- ✅ -->
      <!-- Картинка теперь просто шапка, без текста внутри -->
        <v-img
        height="70"
        cover
      >
        <div class="d-flex flex-column justify-end h-100 pa-4">
         <h2 class="font-weight-bold app-title non-selectable">{{ $t('appTitle') }}</h2>
        </div>
      </v-img>
      
      <v-divider></v-divider>
      <!-- Основная навигация -->
      <v-list nav>
        <v-list-item 
          prepend-icon="mdi-format-list-text" 
          :title="$t('allPrayers')"
          @click="navigateToCategory(null)"
        ></v-list-item>
        
        <v-list-item
          v-for="category in settings.menuCategories"
          :key="category.name"
          prepend-icon="mdi-label-outline"
          :title="category.name"
          @click="navigateToCategory(category)"
        ></v-list-item>
        <v-divider></v-divider>
        <v-list-item 
          prepend-icon="mdi-book-open-variant" 
          :title="$t('myPrayerRule')"
          :to="{ name: 'PrayerRule' }"
        ></v-list-item>
        <v-divider></v-divider>
        <v-list-item 
  prepend-icon="mdi-cross"
  :title="$t('holyMass')"
  :to="{ name: 'HolyMass' }"
></v-list-item>
 <v-divider></v-divider>
        <v-list-item 
          prepend-icon="mdi-cog-outline" 
          :title="$t('settings')"
          :to="{ name: 'Settings' }"
        ></v-list-item>
        <v-list-item 
          v-if="authStore.user"
          prepend-icon="mdi-shield-crown-outline" 
          :title="$t('admin')"
          :to="{ name: 'Admin' }"
        ></v-list-item>
        <v-list-item 
          prepend-icon="mdi-information-outline" 
          :title="$t('about')"
          :to="{ name: 'About' }"
        ></v-list-item>
        <v-divider></v-divider>
        <v-list-item
          v-if="authStore.user"
          prepend-icon="mdi-logout"
          :title="$t('logout')"
          @click="handleLogout"
        ></v-list-item>
         <v-list-item
          v-else
          prepend-icon="mdi-login"
          :title="$t('login')"
          :to="{ name: 'Login' }"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

      <v-app-bar 
    :elevation="2" 
    app
    :scroll-behavior="isItemViewPage ? 'hide' : undefined"
  >
    <!-- Кнопка назад или меню-гамбургер -->
    <v-btn v-if="showBackButton" icon="mdi-arrow-left" @click="router.back()"></v-btn>
    <v-btn v-else icon="mdi-menu" @click="isDrawerOpen = !isDrawerOpen"></v-btn>
    <!-- Поле поиска, которое появляется при активации -->
    <v-expand-x-transition>
        <v-text-field
            v-if="isSearchActive"
            v-model="search"
            :placeholder="$t('searchPlaceholder')"
            variant="solo-inverted"
            flat
            hide-details
            autofocus
            density="compact"
            class="mr-2"
            @blur="isSearchActive = false"
            clearable  
            @click:clear="isSearchActive = false; search = '';"
        ></v-text-field>
    </v-expand-x-transition>
    <!-- Заголовок приложения -->
    <v-toolbar-title 
      v-if="!isSearchActive" 
      @click="goHome" 
      style="cursor: pointer;"
      class="font-weight-medium"
    >
     <span class="wrappable-toolbar-title app-title non-selectable">{{ $t('appTitle') }}</span>
    </v-toolbar-title>
    <!-- Динамическая правая часть AppBar -->
    <template v-if="!isSearchActive">
        <!-- ===== КНОПКИ ДЛЯ ГЛАВНОЙ СТРАНИЦЫ ===== -->
        <template v-if="isHomePage">
          <v-btn icon="mdi-magnify" @click="isSearchActive = true"></v-btn>
          <v-btn icon="mdi-filter-variant" @click="isFilterSheetOpen = true"></v-btn>
        </template>
        <!-- ===== ✅✅✅ НОВОЕ ВЫПАДАЮЩЕЕ МЕНЮ ДЛЯ СТРАНИЦЫ ПРОСМОТРА ЗАМЕТКИ ✅✅✅ ===== -->
        <template v-if="isItemViewPage">
          <!-- Оборачиваем все действия в компонент v-menu -->
          <v-menu location="bottom end" transition="slide-y-transition">
              <template v-slot:activator="{ props }">
                  <!-- Единственная видимая кнопка - "три точки" -->
                  <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
              </template>
              <!-- Содержимое выпадающего списка -->
              <v-list density="compact" class="pa-0">
                  <!-- 1. Поделиться -->
                  <v-list-item @click="shareCurrentItem"  >
                      <template v-slot:prepend>
                          <v-icon>mdi-share-variant-outline</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('share') }}</v-list-item-title>
                  </v-list-item>
                  <!-- 2. Закрепить/Открепить -->
                  <v-list-item @click="settings.togglePin(currentItemId)" >
                      <template v-slot:prepend>
                          <v-icon :color="settings.isPinned(currentItemId) ? 'primary' : ''">
                              {{ settings.isPinned(currentItemId) ? 'mdi-pin' : 'mdi-pin-outline' }}
                          </v-icon>
                      </template>
                      <v-list-item-title>{{ settings.isPinned(currentItemId) ? $t('unpin') : $t('pin') }}</v-list-item-title>
                  </v-list-item>
                  <!-- 3. Настройки текста -->
                  <v-list-item @click="openTextSettings" >
                      <template v-slot:prepend>
                          <v-icon>mdi-tune-variant</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('textSettings') }}</v-list-item-title>
                  </v-list-item>
                  <!-- 4. Редактировать (только для админа) -->
                  <v-list-item
                      v-if="authStore.user"
                      @click="router.push({ name: 'ItemEdit', params: { id: currentItemId } })"
                  >
                      <template v-slot:prepend>
                          <v-icon>mdi-pencil-outline</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('edit') }}</v-list-item-title>
                  </v-list-item>
              </v-list>
          </v-menu>
        </template>
        <!-- ===== ОСТАЛЬНЫЕ КНОПКИ (ДЛЯ ДРУГИХ СТРАНИЦ) ===== -->
        
        <!-- Кнопка сохранения для страниц /add и /edit -->
        <v-btn v-if="showSaveButton" icon="mdi-check" @click="triggerSave"></v-btn>
        <!-- Кнопка редактирования для страницы "Молитвенное правило" -->
        <v-btn
          v-if="showPrayerRuleEditButton"
          @click="toggleEditing"
        >
          <v-icon>{{ isEditing ? 'mdi-check' : 'mdi-pencil' }}</v-icon>
        </v-btn>
    </template>
  </v-app-bar>


    <v-main>
      <router-view v-if="!authStore.loading" />
      <!-- Показываем красивый индикатор загрузки в центре, пока приложение готовится -->
      <div v-else class="d-flex justify-center align-center fill-height">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      </div>
      <FilterSheet />
      <TextSettingsSheet />
      
    </v-main>
    <NotificationSnackbar ref="snackbar" />
      <ReloadPrompt /> <!-- ✅ ДОБАВЬТЕ ЭТУ СТРОКУ -->
      <!-- ✅ НОВЫЙ ДИАЛОГ-ПРЕДЛОЖЕНИЕ НОВЕННЫ -->
    <v-dialog 
      :model-value="!!suggestion" 
      max-width="500px" 
      persistent
    >
      <v-card v-if="suggestion" class="pa-2">
        <v-card-title class="d-flex align-center">
          <v-icon color="primary" start>mdi-lightbulb-on-outline</v-icon>
          <span class="text-h5">{{ $t('novenaSuggestionTitle') }}</span>
        </v-card-title>
        <v-card-text class="text-body-1 py-4">
          {{ $t('novenaSuggestionText', { title: getTitle(suggestion.item), days: suggestion.days }) }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            color="grey"
            @click="dismissSuggestion(true)"
          >
            {{ $t('decline') }}
          </v-btn>
          <v-btn
            variant="text"
            @click="dismissSuggestion(false)"
          >
            {{ $t('remindLater') }}
          </v-btn>
          
          <v-btn
            color="primary"
            variant="flat"
            @click="viewSuggestedNovena"
          >
            {{ $t('viewPrayer') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref, onMounted, provide, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { useItems } from '@/composables/useItems';
import { useSettingsStore } from '@/stores/settings';
import { useAppBar } from '@/composables/useAppBar';
import { useFilters } from '@/composables/useFilters';

import { usePageMode } from '@/composables/usePageMode'; // ✅ Импорт
import { useAuthStore } from '@/stores/auth';
import { notifier } from '@/composables/useNotifier';
import { useNovenaSuggestions } from '@/composables/useNovenaSuggestions';
import FilterSheet from '@/components/FilterSheet.vue';
import NotificationSnackbar from '@/components/NotificationSnackbar.vue';
import TextSettingsSheet from '@/components/TextSettingsSheet.vue'; // ✅ ИМПОРТ
import { getTitleByLang } from '@/utils/i18n'; // Добавьте этот импорт
import ReloadPrompt from '@/components/ReloadPrompt.vue'; // ✅ ДОБАВЬТЕ ЭТОТ ИМПОРТ

const getTitle = (item) => getTitleByLang(item); // Добавьте эту строку

const settings = useSettingsStore();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const { items, isLoading } = useItems();
const { isDrawerOpen, isSearchActive, isFilterSheetOpen, isTextSettingsSheetOpen  } = useAppBar();
const { selectedTags, search } = useFilters();
const { suggestion, checkSuggestions, viewSuggestedNovena, dismissSuggestion } = useNovenaSuggestions();
const { isEditing, toggleEditing } = usePageMode(); // ✅ Получаем состояние

const snackbar = ref(null);
const showPrayerRuleEditButton = computed(() => route.name === 'PrayerRule');
const isHomePage = computed(() => route.name === 'ItemsList');
const showBackButton = computed(() => !isHomePage.value);
const showSaveButton = computed(() => ['ItemEdit', 'ItemAdd'].includes(route.name));

const isItemViewPage = computed(() => route.name === 'ItemView');
const currentItemId = computed(() => route.params.id); //
const currentItem = computed(() => {
  if (!currentItemId.value || !items.value) return null;
  return items.value.find(i => i.id === currentItemId.value);
});

// ✅ ЛОГИКА ДЛЯ ФУНКЦИИ "ПОДЕЛИТЬСЯ"
async function shareCurrentItem() {
  if (!currentItem.value) return;
  // ✅ СОЗДАЕМ КОРОТКУЮ ССЫЛКУ
  const shareUrl = `${window.location.origin}/p/${currentItem.value.id}`;

  const shareData = {
    title: getTitle(currentItem.value),
    text: `Прочитайте молитву "${getTitle(currentItem.value)}"`,
    url: shareUrl,
  };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      console.error('Share failed:', err);
    }
  } else {
    // Fallback: копирование в буфер обмена
    try {
      await navigator.clipboard.writeText(shareUrl);
      showSuccess(t('linkCopied'));
    } catch (err) {
      showError(t('shareError'));
    }
  }
}



function openTextSettings() {
  console.log(`[App.vue] Button clicked. 'isTextSettingsSheetOpen' is currently: ${isTextSettingsSheetOpen.value}`);
  isTextSettingsSheetOpen.value = true;
  console.log(`[App.vue] State changed. 'isTextSettingsSheetOpen' is now: ${isTextSettingsSheetOpen.value}`);
}

watch(isLoading, (newIsLoading) => {
  if (!newIsLoading && settings.novenaNotificationsEnabled) {
    checkSuggestions();
  }
});

watch(() => route.name, (newName) => {
  console.group(`[App.vue WATCHER] Имя маршрута изменилось!`);
  console.log(`Новое имя маршрута: %c'${newName}'`, 'color: blue; font-weight: bold;');
  const isPrayerRule = newName === 'PrayerRule';
  console.log(`Сравнение с 'PrayerRule' дает: %c${isPrayerRule}`, `color: ${isPrayerRule ? 'green' : 'red'}; font-weight: bold;`);
  console.log(`Итоговое значение showPrayerRuleEditButton: %c${showPrayerRuleEditButton.value}`, `color: ${showPrayerRuleEditButton.value ? 'green' : 'red'}; font-weight: bold;`);
  console.groupEnd();
}, { immediate: true }); // immediate: true выполнит проверку сразу при загрузке
const saveAction = ref(null);
const triggerSave = () => {
  if (saveAction.value) saveAction.value();
};
provide('registerSaveAction', (action) => {
  saveAction.value = action;
});


onMounted(() => {
  notifier.value = snackbar.value;
});

function goHome() {
  if (!isHomePage.value) {
    router.push({ name: 'ItemsList' });
  }
}

function navigateToCategory(category) {
  selectedTags.value = category ? (category.tags || []) : [];
  goHome();
  isDrawerOpen.value = false;
}

async function handleLogout() {
    isDrawerOpen.value = false;
    await authStore.logout();
}
</script>
<style>
.non-selectable {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10+ */
  user-select: none; /* Standard syntax */
}
</style>