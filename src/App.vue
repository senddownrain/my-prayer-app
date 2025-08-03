<template>
  <v-app>
    <v-layout>
      <v-app-bar app color="surface" elevation="2" class="px-2">
        <v-btn v-if="showBackButton" icon="mdi-arrow-left" @click="router.back()"></v-btn>
        <v-toolbar-title v-if="!isSearchActive">{{ title }}</v-toolbar-title>
        <v-text-field
          v-else
          v-model="search"
          :placeholder="$t('searchPlaceholder')"
          variant="solo-filled"
          density="compact"
          hide-details
          autofocus
          @blur="isSearchActive = false"
        ></v-text-field>
        <v-spacer></v-spacer>
        <template v-for="action in actions" :key="action.icon">
          <v-btn :icon="action.icon" @click="action.onClick"></v-btn>
        </template>
      </v-app-bar>
      <v-main>
        <router-view />
      </v-main>
      <v-bottom-sheet v-model="isFilterSheetOpen">
        <v-card class="pa-4">
          <v-card-title>{{ $t('filterByTags') }}</v-card-title>
          <v-card-text>
            <div v-if="allTags.length === 0" class="text-grey pa-2">Нет тегов для выбора</div>
            <v-chip-group v-else v-model="selectedTags" column multiple>
              <v-chip
                v-for="tag in allTags"
                :key="tag"
                :value="tag"
                filter
                variant="outlined"
                class="ma-1"
                size="large"
              >
                {{ tag }}
              </v-chip>
            </v-chip-group>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="text" @click="isFilterSheetOpen = false">{{ $t('done') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-bottom-sheet>
    </v-layout>
  </v-app>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAppBar } from '@/composables/useAppBar';
import { useFilters } from '@/composables/useFilters';
import { useItems } from '@/composables/useItems';
import { useSettingsStore } from '@/stores/settings'
const router = useRouter();
const { title, showBackButton, actions, isSearchActive, isFilterSheetOpen } = useAppBar();
const { search, selectedTags } = useFilters();
const { allTags } = useItems();
useSettingsStore();
</script>