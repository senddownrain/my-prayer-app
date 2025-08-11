<!-- src/components/dialogs/AddCategoryDialog.vue -->
<template>
  <v-dialog
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    max-width="600px"
    :fullscreen="$vuetify.display.mobile"
    scrollable
  >
    <v-card>
      <v-card-title>{{ $t('addCategory') }}</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="onAddCategory">
          <v-text-field
            v-model="newCategory.name"
            :label="$t('categoryName')"
            variant="outlined"
            class="mb-4"
          ></v-text-field>
          <v-combobox
            v-model="newCategory.tags"
            :items="allTags"
            :label="$t('categoryTags')"
            variant="outlined"
            multiple
            chips
            clearable
          ></v-combobox>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="$emit('update:modelValue', false)">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" variant="flat" @click="onAddCategory">{{ $t('add') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useItems } from '@/composables/useItems';

defineProps({ modelValue: Boolean });
const emit = defineEmits(['update:modelValue']);

const settings = useSettingsStore();
const { allTags } = useItems();
const newCategory = ref({ name: '', tags: [] });

function onAddCategory() {
  if (newCategory.value.name && newCategory.value.tags.length > 0) {
    settings.addCategory({ ...newCategory.value });
    newCategory.value = { name: '', tags: [] };
    emit('update:modelValue', false); // Закрываем диалог
  }
}
</script>