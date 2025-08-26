<template>
  <v-bottom-sheet v-model="isFilterSheetOpen">
    <v-card class="pa-4">
      <v-card-title>{{ $t('filters') }}</v-card-title> <!-- Изменили заголовок -->
      <v-card-text>
        <!-- ✅ НОВЫЙ БЛОК ДЛЯ ФИЛЬТРА ПО ЯЗЫКАМ -->
        <!-- <div class="text-subtitle-1 font-weight-medium mb-2">{{ $t('language') }}</div> -->
        <div v-if="allLangs.length === 0" class="text-grey pa-2">Нет языков для выбора</div>
        <v-chip-group v-else v-model="selectedLangs" column multiple>
          <v-chip
            v-for="lang in allLangs"
            :key="lang"
            :value="lang"
            filter
            variant="outlined"
            class="ma-1 text-uppercase"
            size="small"
          >
            {{ lang }}
          </v-chip>
        </v-chip-group>

        <v-divider class="my-4"></v-divider>

        <!-- Существующий блок для тегов -->
        <!-- <div class="text-subtitle-1 font-weight-medium mb-2">{{ $t('tags') }}</div> -->
        <div v-if="allTags.length === 0" class="text-grey pa-2">Нет тегов для выбора</div>
        <v-chip-group v-else v-model="selectedTags" column multiple>
          <v-chip
            v-for="tag in allTags"
            :key="tag"
            :value="tag"
            filter
            variant="outlined"
            class="ma-1"
            size="default"
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
</template>

<script setup>
import { useAppBar } from '@/composables/useAppBar';
import { useFilters } from '@/composables/useFilters';
import { useItems } from '@/composables/useItems';

const { isFilterSheetOpen } = useAppBar();
const { selectedTags, selectedLangs } = useFilters(); // ✅ Получаем selectedLangs
const { allTags, allLangs } = useItems(); // ✅ Получаем allLangs
</script>