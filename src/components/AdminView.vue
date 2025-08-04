<template>
  <v-container>
    <v-card>
      <v-card-title class="text-h5">Админка</v-card-title>
      <v-card-text>
        <p>
          Здесь будет панель администратора.
          <br>
          Пока это лишь заготовка для будущих функций.
        </p>
        <v-alert type="warning" variant="outlined" class="mt-4">
          Сейчас приложение работает в локальном режиме. Любой пользователь может редактировать данные. Для реализации полноценного администрирования потребуется система аутентификации.
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAppBar } from '@/composables/useAppBar';
const { setAppBar } = useAppBar();
onMounted(() => {
  setAppBar({ title: 'Админка', showBackButton: true, isMenu: true });
});
</script>