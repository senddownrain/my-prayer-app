<template>
  <v-app :theme="settings.currentTheme">
    <v-navigation-drawer v-model="isDrawerOpen" temporary>
      
      <!-- ✅ --- ФИНАЛЬНАЯ ВЕРСИЯ БЛОКА С ИЗОБРАЖЕНИЕМ --- ✅ -->
      <!-- Картинка теперь просто шапка, без текста внутри -->
        <v-img
        height="180"
        :src="settings.currentTheme === 'dark' ? '/menu-dark.png' : '/menu-light.png'"
        cover
        gradient="to top right, rgba(0,0,0,.5), rgba(0,0,0,.1)"
      >
        <div class="d-flex flex-column justify-end h-100 pl-4 pb-2 text-white">
          <h2 class="font-weight-bold">{{ $t('appTitle') }}</h2>
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
    <v-app-bar :elevation="2" app>
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
          ></v-text-field>
      </v-expand-x-transition>
      <v-toolbar-title 
        v-if="!isSearchActive" 
        @click="goHome" 
        style="cursor: pointer;"
        class="font-weight-medium"
      >
        {{ $t('appTitle') }}
      </v-toolbar-title>
      <v-spacer v-if="!isSearchActive"></v-spacer>
      <template v-if="!isSearchActive">
          <template v-if="isHomePage">
            <v-btn icon="mdi-magnify" @click="isSearchActive = true"></v-btn>
            <v-btn icon="mdi-filter-variant" @click="isFilterSheetOpen = true"></v-btn>
          </template>
          <v-btn v-if="showSaveButton" icon="mdi-check" @click="triggerSave"></v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <router-view />
      <FilterSheet />
    </v-main>
    <NotificationSnackbar ref="snackbar" />
  </v-app>
</template>

<script setup>
import { ref, onMounted, provide, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';
import { useAppBar } from '@/composables/useAppBar';
import { useFilters } from '@/composables/useFilters';
import { useAuthStore } from '@/stores/auth';
import { notifier } from '@/composables/useNotifier';
import FilterSheet from '@/components/FilterSheet.vue';
import NotificationSnackbar from '@/components/NotificationSnackbar.vue';

const settings = useSettingsStore();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { isDrawerOpen, isSearchActive, isFilterSheetOpen } = useAppBar();
const { selectedTags, search } = useFilters();
const snackbar = ref(null);

const isHomePage = computed(() => route.name === 'ItemsList');
const showBackButton = computed(() => !isHomePage.value);
const showSaveButton = computed(() => ['ItemEdit', 'ItemAdd'].includes(route.name));

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