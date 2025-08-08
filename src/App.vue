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

    <!-- AppBar остается без изменений -->
    <v-app-bar 
  :elevation="2" 
  app
  :scroll-behavior="isItemViewPage ? 'hide' : undefined"
>
      <v-btn v-if="showBackButton" icon="mdi-arrow-left" @click="router.back()"></v-btn>
      <v-btn v-else icon="mdi-menu" @click="isDrawerOpen = !isDrawerOpen"></v-btn>
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
      <v-toolbar-title 
        v-if="!isSearchActive" 
        @click="goHome" 
        style="cursor: pointer;"
        class="font-weight-medium"
      >
       <span class="wrappable-toolbar-title app-title non-selectable">{{ $t('appTitle') }}</span>
      </v-toolbar-title>
      <template v-if="!isSearchActive">
          <template v-if="isHomePage">
            <v-btn icon="mdi-magnify" @click="isSearchActive = true"></v-btn>
            <v-btn icon="mdi-filter-variant" @click="isFilterSheetOpen = true"></v-btn>
          </template>
          <template v-if="isItemViewPage">
            <v-btn 
              :icon="settings.isPinned(currentItemId) ? 'mdi-pin' : 'mdi-pin-outline'"
              :color="settings.isPinned(currentItemId) ? 'primary' : 'grey'"
              @click="settings.togglePin(currentItemId)"
            ></v-btn>
            <v-btn icon="mdi-tune-variant" @click="openTextSettings"></v-btn>
            <v-btn 
        v-if="isItemViewPage && authStore.user" 
        icon="mdi-pencil" 
        @click="router.push({ name: 'ItemEdit', params: { id: currentItemId } })"
      ></v-btn>
          </template>
          <v-btn v-if="showSaveButton" icon="mdi-check" @click="triggerSave"></v-btn>

          
       <!-- ✅ НАША НОВАЯ КНОПКА РЕДАКТИРОВАНИЯ ПРАВИЛА -->
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
          {{ $t('novenaSuggestionText', { title: suggestion.item.title, days: suggestion.days }) }}
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