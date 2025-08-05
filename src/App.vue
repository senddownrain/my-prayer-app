<template>
  <v-app :theme="settings.currentTheme">
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
          @click="navigateToCategory(category)"
        ></v-list-item>
        <v-divider></v-divider>
        
        <!-- ✅ Настройки теперь доступны ВСЕМ пользователям -->
        <v-list-item 
          prepend-icon="mdi-cog-outline" 
          :title="$t('settings')"
          :to="{ name: 'Settings' }"
        ></v-list-item>

        <!-- Ссылки, видимые только администратору -->
        <v-list-item 
          v-if="authStore.user"
          prepend-icon="mdi-shield-crown-outline" 
          title="Админка"
          :to="{ name: 'Admin' }"
        ></v-list-item>
        
        <!-- Общие ссылки -->
        <v-list-item 
          prepend-icon="mdi-information-outline" 
          title="О нас"
          :to="{ name: 'About' }"
        ></v-list-item>
        <v-divider></v-divider>

        <!-- Кнопка Выход / Вход -->
        <v-list-item
          v-if="authStore.user"
          prepend-icon="mdi-logout"
          title="Выход"
          @click="handleLogout"
        ></v-list-item>
         <v-list-item
          v-else
          prepend-icon="mdi-login"
          title="Вход"
          :to="{ name: 'Login' }"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar :elevation="2" app>
        <v-btn v-if="!appBar.showBackButton" icon="mdi-menu" @click="isDrawerOpen = !isDrawerOpen"></v-btn>
        <v-btn v-else icon="mdi-arrow-left" @click="router.back()"></v-btn>
        
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
                @blur="isSearchActive = false; search = ''"
            ></v-text-field>
        </v-expand-x-transition>

        <v-toolbar-title v-if="!isSearchActive">
            {{ appBar.title }}
        </v-toolbar-title>

        <v-spacer v-if="!isSearchActive"></v-spacer>

        <template v-if="!isSearchActive">
            <v-btn v-if="appBar.isSearchVisible" icon="mdi-magnify" @click="isSearchActive = true"></v-btn>
            <v-btn v-for="action in appBar.actions" :key="action.icon" :icon="action.icon" @click="action.onClick"></v-btn>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';
import { useAppBar } from '@/composables/useAppBar';
import { useFilters } from '@/composables/useFilters';
import { useAuthStore } from '@/stores/auth';
import { notifier } from '@/composables/useNotifier';
import FilterSheet from '@/components/FilterSheet.vue';
import NotificationSnackbar from '@/components/NotificationSnackbar.vue';

const settings = useSettingsStore();
const router = useRouter();
const authStore = useAuthStore();

const { appBar, isDrawerOpen, isSearchActive } = useAppBar();
const { selectedTags, search } = useFilters();
const snackbar = ref(null);

onMounted(() => {
  notifier.value = snackbar.value;
});

function navigateToCategory(category) {
  selectedTags.value = category ? (category.tags || []) : [];
  
  if (router.currentRoute.value.name !== 'ItemsList') {
    router.push({ name: 'ItemsList' });
  }
  
  isDrawerOpen.value = false;
}

// ✅ Добавляем отдельную функцию для выхода, чтобы закрывать меню
async function handleLogout() {
    isDrawerOpen.value = false;
    await authStore.logout();
}
</script>