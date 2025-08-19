<template>
  <v-card variant="outlined" class="pa-3 mb-3">
    <div class="d-flex align-center ga-3 flex-wrap mb-2">
      <v-text-field
        v-model.number="novena.totalDays"
        type="number" min="1" max="99"
        density="compact"
        :label="$t('novenaDaysLabel')"
        style="max-width: 160px"
      />
      <v-chip-group v-model="selectedDay" class="ml-2" mandatory>
        <v-chip v-for="d in novena.totalDays" :key="`d-${lang}-${d}`" :value="d" size="small" filter>{{ d }}</v-chip>
      </v-chip-group>

      <v-spacer />

      <v-switch
        v-model="novena.useSingleText"
        class="ml-auto"
        inset
        :label="$t('singleTextMode')"
      />
    </div>

    <h4 class="text-subtitle-1 mb-2">{{ $t('opening') }}</h4>
    <Editor v-model="novena.openingTextVersions[lang]" class="mb-4" />

    <template v-if="novena.useSingleText">
      <h4 class="text-subtitle-1 mb-2">{{ $t('day') }} 1…{{ novena.totalDays }}</h4>
      <Editor v-model="novena.singleTextVersions[lang]" class="mb-4" />
    </template>
    <template v-else>
      <h4 class="text-subtitle-1 mb-2">{{ $t('day') }} {{ selectedDay }}</h4>
      <Editor v-model="dayModel" class="mb-4" />
    </template>

    <h4 class="text-subtitle-1 mb-2">{{ $t('closing') }}</h4>
    <Editor v-model="novena.closingTextVersions[lang]" />
  </v-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import Editor from '@/components/Editor.vue';

const props = defineProps({
  modelValue: { type: Object, required: true }, // novena
  lang: { type: String, required: true },
});

const emit = defineEmits(['update:modelValue']);

const novena = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const selectedDay = ref(1);

// Дневной текст для текущего дня/языка
const dayModel = computed({
  get() {
    const key = String(selectedDay.value);
    return novena.value.dailyTextVersions?.[key]?.[props.lang] || '';
  },
  set(v) {
    const key = String(selectedDay.value);
    if (!novena.value.dailyTextVersions[key]) novena.value.dailyTextVersions[key] = {};
    novena.value.dailyTextVersions[key][props.lang] = v;
  }
});

// Инициализация структур
watch(() => props.lang, () => {
  if (!novena.value.openingTextVersions) novena.value.openingTextVersions = {};
  if (!novena.value.closingTextVersions) novena.value.closingTextVersions = {};
  if (!novena.value.singleTextVersions) novena.value.singleTextVersions = {};
  if (!novena.value.dailyTextVersions) novena.value.dailyTextVersions = {};
}, { immediate: true });
</script>