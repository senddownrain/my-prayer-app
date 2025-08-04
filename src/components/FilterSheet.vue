<template>
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
</template>

<script setup>
import { useAppBar } from '@/composables/useAppBar';
import { useFilters } from '@/composables/useFilters';
import { useItems } from '@/composables/useItems';

const { isFilterSheetOpen } = useAppBar();
const { selectedTags } = useFilters();
const { allTags } = useItems();
</script>