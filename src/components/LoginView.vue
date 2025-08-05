<template>
  <v-container class="fill-height justify-center">
    <v-card width="100%" max-width="400">
      <v-card-title class="text-center text-h5 py-4">Вход для администратора</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleLogin">
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            variant="outlined"
            class="mb-2"
            :rules="[v => !!v || 'Email обязателен']"
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            label="Пароль"
            type="password"
            variant="outlined"
            :rules="[v => !!v || 'Пароль обязателен']"
            required
          ></v-text-field>
          <v-alert v-if="error" type="error" density="compact" class="mt-4" text>{{ error }}</v-alert>
          <v-btn type="submit" color="primary" block size="large" class="mt-6" :loading="isLoggingIn">Войти</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useAppBar } from '@/composables/useAppBar';

const email = ref('');
const password = ref('');
const error = ref(null);
const isLoggingIn = ref(false);

const authStore = useAuthStore();
const { setAppBar } = useAppBar();

const handleLogin = async () => {
  isLoggingIn.value = true;
  error.value = null;
  try {
    await authStore.login(email.value, password.value);
  } catch (e) {
    error.value = 'Неверный email или пароль.';
  } finally {
    isLoggingIn.value = false;
  }
};

onMounted(() => {
    setAppBar({ title: 'Вход', showBackButton: false });
});
</script>