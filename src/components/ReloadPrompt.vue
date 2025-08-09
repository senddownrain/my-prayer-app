<!-- src/components/ReloadPrompt.vue -->
<template>
  <v-snackbar
    :model-value="needRefresh"
    color="primary"
    variant="elevated"
    :timeout="-1"
    location="bottom right"
    class="mb-4"
  >
    <div class="text-subtitle-1">
      Доступна новая версия приложения!
    </div>

    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="updateServiceWorker()"
      >
        Обновить
      </v-btn>
       <v-btn
        icon="mdi-close"
        variant="text"
        @click="close"
      >
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue';

// useRegisterSW - это специальная функция из плагина VitePWA
// needRefresh - станет true, когда новый SW будет готов
// updateServiceWorker - функция, которая активирует новый SW и перезагрузит страницу
const {
  needRefresh,
  updateServiceWorker,
} = useRegisterSW();

const close = () => {
  needRefresh.value = false;
};
</script>