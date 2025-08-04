<template>
  <v-container>
    <v-card>
      <v-card-title class="text-h5">О приложении</v-card-title>
      <v-card-text>
        <p>Это приложение создано для личного сбора молитв и заметок.</p>
        <p class="mt-4">Версия: 1.0.0</p>
        <p>Разработано с любовью.</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAppBar } from '@/composables/useAppBar';
const { setAppBar } = useAppBar();
onMounted(() => {
  setAppBar({ title: 'О нас', showBackButton: true, isMenu: true });
});
</script>