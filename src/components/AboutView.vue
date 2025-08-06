<template>
  <v-container>
    <v-card>
      <v-card-title class="text-h5">{{ $t('about') }}</v-card-title>
      <v-card-text>
        <p>{{ $t('aboutText') }}</p>
        <p class="mt-4">{{ $t('version') }}</p>
        <p>{{ $t('devWithLove') }}</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
// Скрипт больше не нужен, так как AppBar управляется глобально
</script>