<!-- src/components/NovenaTracker.vue -->
<template>
  <div class="pa-2">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6 font-weight-medium">{{ $t('prayerNovena') }}</h3>
      <v-chip color="primary" variant="flat" label>
        <v-icon start>mdi-flag-checkered</v-icon>
        {{ progressText }}
      </v-chip>
    </div>

    <p class="text-body-2 text-medium-emphasis mb-6">
      {{ $t('novenaTrackerHint') }}
    </p>

    <!-- Новый трекер в виде сетки -->
    <div class="grid-container">
      <div
        v-for="day in daySlots"
        :key="day.date"
        :class="['day-cell', day.status, { 'today': day.isToday }]"
        @click="onDayClick(day)"
      >
        <div class="day-number">{{ day.dayNumber }}</div>
        <div class="day-date">{{ formatDate(day.date) }}</div>
        <v-icon v-if="day.status === 'completed'" class="day-icon" size="small">mdi-check-circle</v-icon>
        <v-icon v-if="day.status === 'missed'" class="day-icon" size="small">mdi-alert-circle</v-icon>
      </div>
    </div>
    
    <v-divider class="my-4"></v-divider>
    
    <v-btn 
      @click="novenaStore.endNovena(noteId)"
      variant="text" 
      color="error" 
      block
    >
      {{ $t('endNovena') }}
    </v-btn>

</div>
</template>

<script setup>
import { computed } from 'vue';
import { useNovenaStore } from '@/stores/novena';
import { useI18n } from 'vue-i18n';

const props = defineProps({ noteId: { type: String, required: true } });
const { t, d } = useI18n(); // d - для форматирования дат
const novenaStore = useNovenaStore();
const today = new Date(novenaStore.getTodayDateString());

const novena = computed(() => novenaStore.getNovenaData(props.noteId));

// Главная логика вычисления статуса каждого дня
const daySlots = computed(() => {
  if (!novena.value) return [];
  const slots = [];
  const startDate = new Date(novena.value.startDate);

  for (let i = 0; i < novena.value.totalDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateString = currentDate.toISOString().split('T')[0];
    
    let status = 'pending';
    const isCompleted = novena.value.completedDates.includes(dateString);

    if (isCompleted) {
      status = 'completed';
    } else if (currentDate < today) {
      status = 'missed';
    } else if (currentDate > today) {
      status = 'future';
    } else {
      status = 'today';
    }

    slots.push({
      dayNumber: i + 1,
      date: dateString,
      status: status, // 'completed', 'missed', 'today', 'future'
      isToday: dateString === novenaStore.getTodayDateString(),
    });
  }
  return slots;
});

const onDayClick = (day) => {
  // Позволяем кликать только по прошедшим и сегодняшним дням
  if (day.status === 'future') return;
  novenaStore.toggleDayCompletion(props.noteId, day.date);
};

const completedCount = computed(() => novena.value?.completedDates.length || 0);
const progressText = computed(() => `${completedCount.value} / ${novena.value?.totalDays || 0}`);

const formatDate = (dateString) => {
  // Форматируем дату, например "14 авг"
  const date = new Date(dateString);
  return d(date, 'short'); // Используем i18n для форматирования
};
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}
.day-cell {
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 8px;
  padding: 8px;
  text-align: center;
  position: relative;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}
.day-cell.future {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: rgba(0,0,0,0.02);
}
.day-cell.today {
  border-width: 2px;
  border-color: rgba(var(--v-theme-primary));
}
.day-cell.completed {
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-color: transparent;
  color: rgb(var(--v-theme-primary));
}
.day-cell.missed {
  border-color: rgba(var(--v-theme-error), 0.5);
}
.day-cell:not(.future):hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.day-number {
  font-size: 0.8rem;
  font-weight: 500;
  opacity: 0.7;
}
.day-date {
  font-size: 1rem;
  font-weight: bold;
}
.day-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0.8;
}
</style>