<template>
  <v-container>
    <v-list lines="two" subheader>
      <v-list-subheader>{{ $t('generalSettings') }}</v-list-subheader>
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

      <v-list-subheader>{{ $t('appearance') }}</v-list-subheader>
      
      <v-list-item :title="$t('fontFamily')" :subtitle="$t('fontFamilyHint')">
        <template v-slot:prepend><v-icon>mdi-format-font</v-icon></template>
      </v-list-item>
      <v-chip-group 
        class="px-4 pb-2"
        :model-value="settings.fontFamily" 
        @update:model-value="settings.setFontFamily"
        mandatory
      >
        <v-chip v-for="font in fontOptions" :key="font.value" :value="font.value" filter variant="outlined" :style="{ fontFamily: font.value }">
          {{ font.title }}
        </v-chip>
      </v-chip-group>

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
      
      <!-- ✅ --- БЛОК ПРЕДПРОСМОТРА РАЗМЕРА ШРИФТА --- ✅ -->
      <div class="px-4 pb-2">
        <v-card variant="outlined" class="pa-4">
          <div class="note-content-area">
            <p>{{ $t('previewText') }}</p>
          </div>
        </v-card>
      </div>

      <v-list-item :title="$t('darkTheme')" :subtitle="$t('themeIs', { themeName: $t('themeNames.' + settings.currentTheme) })">
        <template v-slot:prepend><v-icon>mdi-theme-light-dark</v-icon></template>
        <template v-slot:append><v-switch :model-value="settings.currentTheme === 'dark'" @update:model-value="settings.toggleTheme" inset color="primary" hide-details></v-switch></template>
      </v-list-item>
      
      <v-list-item :title="$t('viewMode')" :subtitle="$t('viewModeHint')">
        <template v-slot:prepend><v-icon>mdi-view-dashboard-outline</v-icon></template>
        <template v-slot:append>
          <v-btn-toggle :model-value="settings.viewMode" @update:model-value="settings.toggleViewMode" mandatory variant="outlined" density="compact">
            <v-btn value="card"><v-icon>mdi-view-grid</v-icon></v-btn>
            <v-btn value="compact"><v-icon>mdi-view-list</v-icon></v-btn>
          </v-btn-toggle>
        </template>
      </v-list-item>
    </v-list>
    
    <!-- Остальная часть файла с языком и категориями остается без изменений -->
    <v-divider class="my-4"></v-divider>
    <v-list-subheader>{{ $t('language') }}</v-list-subheader>
    <v-item-group mandatory :model-value="settings.currentLanguage" @update:model-value="settings.setLanguage" class="pa-2">
      <v-item v-for="lang in langOptions" :key="lang.value" :value="lang.value" v-slot="{ isSelected, toggle }">
        <v-btn :variant="isSelected ? 'tonal' : 'outlined'" @click="toggle" class="mr-2 mb-2">{{ lang.title }}</v-btn>
      </v-item>
    </v-item-group>

    <v-divider class="my-4"></v-divider>
      <!-- ✅ --- ВОЗВРАЩАЕМ ЛОГИКУ ДОБАВЛЕНИЯ КАТЕГОРИЙ --- ✅ -->
    <v-list-subheader>{{ $t('menuCategories') }}</v-list-subheader>
    <v-list-item v-for="(cat, index) in settings.menuCategories" :key="index">
      <v-list-item-title>{{ cat.name }}</v-list-item-title>
      <v-list-item-subtitle>Фильтр по тегам: `{{ cat.tags?.join(', ') }}`</v-list-item-subtitle>
      <template v-slot:append>
        <v-btn icon="mdi-delete-outline" variant="text" color="grey" @click="settings.removeCategory(index)"></v-btn>
      </template>
    </v-list-item>
    <v-card variant="tonal" class="pa-4 mt-4">
      <h3 class="text-subtitle-1 mb-3">{{ $t('addCategory') }}</h3>
      <v-form @submit.prevent="onAddCategory">
        <v-text-field v-model="newCategory.name" :label="$t('categoryName')" density="compact" variant="solo-filled" flat></v-text-field>
        <v-combobox
          v-model="newCategory.tags"
          :items="allTags"
          :label="$t('categoryTags')"
          density="compact"
          variant="solo-filled"
          flat
          multiple
          chips
          clearable
          class="mt-2"
        ></v-combobox>
        <v-btn type="submit" color="primary" block class="mt-2">{{ $t('add') }}</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useItems } from '@/composables/useItems';

const settings = useSettingsStore();
const { allTags } = useItems();

const fontOptions = ref([
  { title: 'Системный', value: settings.systemFont },
  { title: 'Yeseva One', value: 'Yeseva One' },
  { title: 'Comfortaa', value: 'Comfortaa' },
  { title: 'Old Standard TT', value: 'Old Standard TT' },
  { title: 'Kurale', value: 'Kurale' },
  { title: 'Pacifico', value: 'Pacifico' },
]);

const langOptions = ref([
  { title: 'Русский', value: 'ru' },
  { title: 'Беларуская', value: 'be' }
]);

const newCategory = ref({ name: '', tags: [] });

function onAddCategory() {
  if (newCategory.value.name && newCategory.value.tags.length > 0) {
    settings.addCategory({ ...newCategory.value });
    newCategory.value = { name: '', tags: [] };
  }
}
</script>