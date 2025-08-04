<template>
  <v-app :theme="settings.currentTheme">
    <!-- Боковое навигационное меню -->
    <v-navigation-drawer v-model="isDrawerOpen" temporary>
      <v-list nav>
        <v-list-item 
          prepend-icon="mdi-format-list-text" 
          :title="$t('allPrayers')"
          @click="navigateToCategory(null)"
        ></v-list-item>
        
        <v-divider></v-divider>
        <v-list-subheader>Категории</v-list-subheader>
        
        <v-list-item
          v-for="category in settings.menuCategories"
          :key="category.name"
          prepend-icon="mdi-label-outline"
          :title="category.name"
          @click="navigateToCategory(category.tag)"
        ></v-list-item>
        
        <v-divider></v-divider>
        
        <v-list-item 
          prepend-icon="mdi-cog-outline" 
          :title="$t('settings')"
          :to="{ name: 'Settings' }"
        ></v-list-item>
        
        <v-list-item 
          prepend-icon="mdi-information-outline" 
          title="О нас"
          :to="{ name: 'About' }"
        ></v-list-item>
        
         <v-list-item 
          prepend-icon="mdi-shield-crown-outline" 
          title="Админка"
          :to="{ name: 'Admin' }"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Верхняя панель (AppBar) с логикой переключения на поиск -->
    <v-app-bar :elevation="2" app>
      <!-- Состояние 1: Обычная панель (поиск НЕ активен) -->
      <template v-if="!isSearchActive">
        <!-- Кнопка меню или кнопка "назад" -->
        <v-btn v-if="!appBar.showBackButton" icon="mdi-menu" @click="isDrawerOpen = !isDrawerOpen"></v-btn>
        <v-btn v-else icon="mdi-arrow-left" @click="router.back()"></v-btn>
        
        <v-toolbar-title>{{ appBar.title }}</v-toolbar-title>
        <v-spacer></v-spacer>

        <!-- Иконка для активации поиска -->
        <v-btn v-if="appBar.isSearchVisible" icon="mdi-magnify" @click="isSearchActive = true"></v-btn>
        
        <!-- Другие кнопки действий (Сохранить, Редактировать, Фильтр) -->
        <v-btn v-for="action in appBar.actions" :key="action.icon" :icon="action.icon" @click="action.onClick"></v-btn>
      </template>
      
      <!-- Состояние 2: Панель поиска (поиск АКТИВЕН) -->
      <template v-else>
        <v-text-field
          v-model="search"
          :placeholder="$t('searchPlaceholder')"
          variant="solo-inverted"
          flat
          hide-details
          autofocus
          prepend-inner-icon="mdi-arrow-left"
          @click:prepend-inner="isSearchActive = false"
        ></v-text-field>
      </template>
    </v-app-bar>

    <!-- Основной контент приложения -->
    <v-main>
      <router-view />
      <FilterSheet />
    </v-main>
  </v-app>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';
import { useAppBar } from '@/composables/useAppBar';
import { useFilters } from '@/composables/useFilters';
import FilterSheet from '@/components/FilterSheet.vue';

// Инициализация хуков и хранилищ
const settings = useSettingsStore();
const router = useRouter();

// Получение реактивных переменных из composables
const { appBar, isDrawerOpen, isSearchActive } = useAppBar();
const { selectedTags, search } = useFilters();

// Функция для навигации по категориям из бокового меню
function navigateToCategory(tag) {
  // Обновляем фильтр по тегам
  selectedTags.value = tag ? [tag] : [];
  // Переходим на главную страницу со списком
  router.push({ name: 'ItemsList' });
  // Закрываем боковое меню
  isDrawerOpen.value = false;
}
</script>