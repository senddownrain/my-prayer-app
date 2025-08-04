<template>
  <v-app :theme="settings.currentTheme">
    <v-layout>
      <v-app-bar :elevation="2" app>
        <v-app-bar-nav-icon v-if="appBar.showBackButton" @click="router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-app-bar-nav-icon>
        
        <div @click="appBar.onTitleClick" :style="{ cursor: appBar.isTitleClickable ? 'pointer' : 'default' }">
          <v-toolbar-title>{{ appBar.title }}</v-toolbar-title>
        </div>
        
        <v-spacer></v-spacer>
        
        <v-fade-transition>
          <v-text-field
            v-if="isSearchActive"
            v-model="search"
            :placeholder="$t('searchPlaceholder')"
            variant="solo"
            density="compact"
            hide-details
            single-line
            autofocus
            @blur="isSearchActive = false"
            class="app-bar-search"
          ></v-text-field>
        </v-fade-transition>
        
        <v-btn v-for="action in appBar.actions" :key="action.icon" icon @click="action.onClick">
          <v-icon>{{ action.icon }}</v-icon>
        </v-btn>
      </v-app-bar>

      <v-main>
        <router-view v-slot="{ Component }">
          <v-fade-transition mode="out-in">
            <component :is="Component" />
          </v-fade-transition>
        </router-view>
        <FilterSheet />
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';
import { useAppBar } from '@/composables/useAppBar';
import { useFilters } from '@/composables/useFilters';
import FilterSheet from '@/components/FilterSheet.vue'; // Импортируем новый компонент

const settings = useSettingsStore();
const router = useRouter();
const { appBar, isSearchActive } = useAppBar();
const { search } = useFilters();
</script>

<style scoped>
.app-bar-search {
  max-width: 300px;
}
</style>