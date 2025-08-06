<template>
  <v-container class="fill-height justify-center">
    <v-card width="100%" max-width="400">
      <v-card-title class="text-center text-h5 py-4">{{ $t('loginTitle') }}</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleLogin">
          <v-text-field
            v-model="email"
            :label="$t('email')"
            type="email"
            variant="outlined"
            class="mb-2"
            :rules="[v => !!v || $t('emailRequired')]"
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            :label="$t('password')"
            type="password"
            variant="outlined"
            :rules="[v => !!v || $t('passwordRequired')]"
            required
          ></v-text-field>
          <v-alert v-if="error" type="error" density="compact" class="mt-4" text>{{ error }}</v-alert>
          <v-btn type="submit" color="primary" block size="large" class="mt-6" :loading="isLoggingIn">{{ $t('login') }}</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const email = ref('');
const password = ref('');
const error = ref(null);
const isLoggingIn = ref(false);
const authStore = useAuthStore();

const handleLogin = async () => {
  isLoggingIn.value = true;
  error.value = null;
  try {
    await authStore.login(email.value, password.value);
  } catch (e) {
    error.value = t('loginError');
  } finally {
    isLoggingIn.value = false;
  }
};
</script>