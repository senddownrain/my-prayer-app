<template>
  <v-bottom-sheet v-model="isTextSettingsSheetOpen">
    <v-card class="pa-4" rounded="t-xl">
      <v-list lines="two" subheader>
       

        <!-- Настройка размера -->
<v-list-subheader>{{ $t('fontSize') }}</v-list-subheader>
<v-list-item>
  <div class="d-flex align-center justify-space-between">
    <!-- Кнопка уменьшения -->
    <v-btn 
      variant="tonal" 
      @click="settings.decreaseFontSize" 
      :disabled="settings.fontSizeMultiplier <= 0.8"
      class="font-size-button"
    >
      <span class="text-h6 font-weight-bold">A</span>
      <v-icon right>mdi-minus</v-icon>
    </v-btn>

    <!-- Текущее значение в процентах -->
    <span class="mx-4 font-weight-bold text-h6 text-center" style="min-width: 80px;">
      {{ Math.round(settings.fontSizeMultiplier * 100) }}%
    </span>

    <!-- Кнопка увеличения -->
    <v-btn 
      variant="tonal" 
      @click="settings.increaseFontSize" 
      :disabled="settings.fontSizeMultiplier >= 1.5"
      class="font-size-button"
    >
      <span class="text-h5 font-weight-bold">A</span>
      <v-icon right>mdi-plus</v-icon>
    </v-btn>
  </div>
</v-list-item>
 <!-- Настройка шрифта -->
        <v-list-subheader>{{ $t('fontFamily') }}</v-list-subheader>
        <v-list-item class="px-1">
          <v-chip-group 
            :model-value="settings.fontFamily" 
            @update:model-value="settings.setFontFamily"
            mandatory
          >
            <v-chip v-for="font in fontOptions" :key="font.value" :value="font.value" filter variant="outlined" :style="{ fontFamily: font.value }">
              {{ font.title }}
            </v-chip>
          </v-chip-group>
        </v-list-item>
        <v-list-item :title="$t('keepScreenOn')" :subtitle="$t('keepScreenOnHint')">
          <template v-slot:prepend><v-icon>mdi-lightbulb-on-outline</v-icon></template>
          <template v-slot:append>
            <v-switch 
              :model-value="settings.keepScreenOn" 
              @update:model-value="settings.setKeepScreenOn" 
              inset color="primary" hide-details>
            </v-switch>
          </template>
        </v-list-item>
      </v-list>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="isTextSettingsSheetOpen = false">{{ $t('done') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useAppBar } from '@/composables/useAppBar';

const settings = useSettingsStore();
const { isTextSettingsSheetOpen } = useAppBar();

// // ✅ ЛОГ 4: Отслеживаем, получает ли этот компонент обновление состояния
// watch(isTextSettingsSheetOpen, (newValue, oldValue) => {
//   console.log(`%c[TextSettingsSheet.vue WATCHER] 'isTextSettingsSheetOpen' changed from ${oldValue} to ${newValue}`, 'color: green; font-weight: bold;');
// });

const fontOptions = ref([
  { title: 'Системный', value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
  { title: 'Kurale', value: 'Kurale' },
  { title: 'Yeseva One', value: 'Yeseva One' },
  { title: 'Old Standard TT', value: 'Old Standard TT' },
  { title: 'Pacifico', value: 'Pacifico' },
  { title: 'Comfortaa', value: 'Comfortaa' },
]);
</script>