<template>
  <v-container>
    <v-card>
      <v-card-title class="text-h5">{{ $t('admin') }}</v-card-title>
      <v-card-text>
        <p>
          {{ $t('adminText') }}
        </p>
      </v-card-text>
    </v-card>

    <v-list lines="two" subheader class="mt-4">
      <v-list-subheader>{{ $t('generalSettings') }}</v-list-subheader>
      <v-list-item 
        :title="$t('showHiddenNotes')" 
        :subtitle="$t('showHiddenNotesHint')"
      >
        <template v-slot:prepend><v-icon>mdi-eye-off-outline</v-icon></template>
        <template v-slot:append>
          <v-switch
            :model-value="settings.showHiddenItems"
            @update:model-value="settings.toggleShowHiddenItems"
            color="primary"
            inset
            hide-details
          ></v-switch>
        </template>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script setup>
import { useSettingsStore } from '@/stores/settings';
const settings = useSettingsStore();
</script>