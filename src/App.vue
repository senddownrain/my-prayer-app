<template>
  <v-app :theme="settings.currentTheme">
    <!-- ✅ НАВИГАЦИОННОЕ МЕНЮ -->
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

    <!-- ✅ ОБНОВЛЕННЫЙ APPBAR -->
    <v-app-bar :elevation="2" app>
      <!-- Либо кнопка меню, либо кнопка "назад" -->
      <v-app-bar-nav-icon v-if="appBar.isMenu" @click="isDrawerOpen = !isDrawerOpen"></v-app-bar-nav-icon>
      <v-btn v-else icon="mdi-arrow-left" @click="router.back()"></v-btn>
      
      <v-toolbar-title>{{ appBar.title }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- Кнопки действий остаются как были -->
      <v-btn v-for="action in appBar.actions" :key="action.icon" icon @click="action.onClick"></v-btn>
    </v-app-bar>

    <v-main>
      <!-- RouterView и FilterSheet без изменений -->
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

const settings = useSettingsStore();
const router = useRouter();
const { appBar, isDrawerOpen } = useAppBar();
const { selectedTags } = useFilters();

function navigateToCategory(tag) {
  // Обновляем фильтр
  selectedTags.value = tag ? [tag] : [];
  // Переходим на главную страницу
  router.push({ name: 'ItemsList' });
  // Закрываем меню
  isDrawerOpen.value = false;
}
</script>