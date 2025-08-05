<template>
  <v-snackbar
    v-model="visible"
    :color="color"
    :timeout="timeout"
    location="bottom right"
    variant="elevated"
  >
    {{ message }}
    <template v-slot:actions>
      <v-btn icon="mdi-close" @click="hide"></v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref } from 'vue';

const visible = ref(false);
const message = ref('');
const color = ref('success');
const timeout = ref(3000);

// Глобальная функция для показа уведомления
function show(newMessage, newColor = 'success') {
  message.value = newMessage;
  color.value = newColor;
  visible.value = true;
}

function hide() {
  visible.value = false;
}

// Делаем функцию show доступной извне через ref
defineExpose({ show });
</script>