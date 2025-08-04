<template>
  <v-container>
    <v-list lines="two" subheader>
      <v-list-subheader>{{ $t('appearance') }}</v-list-subheader>
      
      <v-list-item :title="$t('viewMode')" :subtitle="$t('viewModeHint')">
        <template v-slot:prepend><v-icon>mdi-view-dashboard-outline</v-icon></template>
        <template v-slot:append>
          <v-btn-toggle :model-value="settings.viewMode" @update:model-value="settings.toggleViewMode" mandatory variant="outlined" density="compact">
            <v-btn value="card"><v-icon>mdi-view-grid</v-icon></v-btn>
            <v-btn value="compact"><v-icon>mdi-view-list</v-icon></v-btn>
          </v-btn-toggle>
        </template>
      </v-list-item>

      <v-list-item :title="$t('darkTheme')" :subtitle="$t('themeIs', { themeName: $t('themeNames.' + settings.currentTheme) })">
        <template v-slot:prepend><v-icon>mdi-theme-light-dark</v-icon></template>
        <template v-slot:append><v-switch :model-value="settings.currentTheme === 'dark'" @update:model-value="settings.toggleTheme" inset color="primary" hide-details></v-switch></template>
      </v-list-item>
      
      <v-list-item :title="$t('fontSize')" :subtitle="$t('fontSizeHint')">
        <template v-slot:prepend><v-icon>mdi-format-font-size-increase</v-icon></template>
        <template v-slot:append>
          <div class="d-flex align-center">
            <v-btn icon="mdi-minus" variant="text" size="small" @click="settings.decreaseFontSize" :disabled="settings.fontSizeMultiplier <= 0.8"></v-btn>
            <span class="mx-2 font-weight-bold" style="width: 40px; text-align: center;">{{ Math.round(settings.fontSizeMultiplier * 100) }}%</span>
            <v-btn icon="mdi-plus" variant="text" size="small" @click="settings.increaseFontSize" :disabled="settings.fontSizeMultiplier >= 1.5"></v-btn>
          </div>
        </template>
      </v-list-item>
    </v-list>

    <v-divider class="my-4"></v-divider>
    <v-card variant="outlined" class="pa-4">
      <h3 class="v-list-subheader pa-0 mb-2">{{ $t('preview') }}</h3>
      <div class="note-content-area mt-2">
        <p class="text-body-1">Это пример обычного текста. Вы можете видеть, как он изменяется в реальном времени.</p>
        <p class="text-caption mt-2">А это — текст поменьше, для примера.</p>
      </div>
    </v-card>

    <v-divider class="my-4"></v-divider>
    <v-list>
      <v-list-subheader>{{ $t('language') }}</v-list-subheader>
      <v-list-item>
        <v-select
          :label="$t('language')" :items="[{value: 'ru', title: 'Русский'}, {value: 'be', title: 'Беларуская'}]"
          :model-value="settings.currentLanguage" @update:model-value="settings.setLanguage"
          variant="outlined" density="compact" hide-details
        ></v-select>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { useAppBar } from '@/composables/useAppBar';
import { useSettingsStore } from '@/stores/settings';
import { useI18n } from 'vue-i18n';

const { setAppBar, resetAppBar } = useAppBar();
const settings = useSettingsStore();
const { t, locale } = useI18n();

const setupAppBar = () => { setAppBar({ title: t('settings'), showBackButton: true, actions: [] }); };
onMounted(setupAppBar);
onUnmounted(resetAppBar);
watch(locale, setupAppBar);
</script>