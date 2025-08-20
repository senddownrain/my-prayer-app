<template>
  <!-- ✅ ИСПРАВЛЕНИЕ 1: Оборачиваем весь компонент в один родительский div, 
       чтобы решить проблему с "Extraneous non-props attributes" -->
  <div>
    <div v-if="editor" class="editor-wrapper">
      <!-- Панель инструментов -->
      <div class="editor-toolbar">
        <!-- ... (меню стилей, кнопки bold/italic без изменений) ... -->
        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" density="compact" class="mr-2" style="min-width: 130px;">
              {{ currentStyleLabel }}
              <v-icon right>mdi-menu-down</v-icon>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item @click="editor.chain().focus().setParagraph().run()" :active="editor.isActive('paragraph')">
              <v-list-item-title>{{ $t('style.normal') }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :active="editor.isActive('heading', { level: 2 })">
              <v-list-item-title>{{ $t('style.h2') }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :active="editor.isActive('heading', { level: 3 })">
              <v-list-item-title>{{ $t('style.h3') }}</v-list-item-title>
            </v-list-item>
            <!-- ✅ ИСПРАВЛЕНИЕ 4: Команда для рубрики теперь toggleClass -->
            <v-list-item @click="editor.chain().focus().toggleClass('rubric').run()" :active="editor.isActive({ class: 'rubric' })">
              <v-list-item-title>{{ $t('style.rubric') }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-divider vertical class="mx-1"></v-divider>
        <!-- (кнопки форматирования, списков, выравнивания) -->
        <v-btn-toggle v-bind="null" multiple density="compact" variant="text">
          <v-btn @click="editor.chain().focus().toggleBold().run()" :active="editor.isActive('bold')" icon="mdi-format-bold"></v-btn>
          <v-btn @click="editor.chain().focus().toggleItalic().run()" :active="editor.isActive('italic')" icon="mdi-format-italic"></v-btn>
        </v-btn-toggle>
        <v-divider vertical class="mx-1"></v-divider>
        <v-btn-toggle v-bind="null" multiple density="compact" variant="text">
          <v-btn @click="editor.chain().focus().toggleBulletList().run()" :active="editor.isActive('bulletList')" icon="mdi-format-list-bulleted"></v-btn>
          <v-btn @click="editor.chain().focus().toggleOrderedList().run()" :active="editor.isActive('orderedList')" icon="mdi-format-list-numbered"></v-btn>
        </v-btn-toggle>
        <v-divider vertical class="mx-1"></v-divider>
        <v-btn-toggle v-bind="null" multiple density="compact" variant="text">
          <v-btn @click="editor.chain().focus().setTextAlign('left').run()" :active="editor.isActive({ textAlign: 'left' })" icon="mdi-format-align-left"></v-btn>
          <v-btn @click="editor.chain().focus().setTextAlign('center').run()" :active="editor.isActive({ textAlign: 'center' })" icon="mdi-format-align-center"></v-btn>
          <v-btn @click="editor.chain().focus().setTextAlign('justify').run()" :active="editor.isActive({ textAlign: 'justify' })" icon="mdi-format-align-justify"></v-btn>
        </v-btn-toggle>
        <v-divider vertical class="mx-1"></v-divider>
        
        <v-btn 
            @click="openLinkDialog" 
            :disabled="editor.state.selection.empty"
            icon="mdi-link-variant-plus"
            density="compact"
            variant="text"
        ></v-btn>
<template v-if="isNovena">
  <v-divider vertical class="mx-1"></v-divider>
  <div class="d-flex align-center ga-2">
    <!-- Кнопки Старт/Финиш -->
    <v-btn-toggle
        :model-value="currentMarker"
        @update:model-value="setMarker"
        density="compact"
        variant="outlined"
    >
      <v-btn value="start" title="Пазначыць як уступ">
        <v-icon>mdi-play-circle-outline</v-icon>
      </v-btn>
      <v-btn value="finish" title="Пазначыць як заканчэнне">
        <v-icon>mdi-flag-checkered</v-icon>
      </v-btn>
    </v-btn-toggle>
    <!-- Кнопки Дней -->
    <div class="d-flex align-center ga-1">
      <span class="text-caption mr-1 text-disabled">Дзень:</span>
      <v-btn-toggle
        :model-value="currentDayMarker"
        @update:model-value="setDayMarker"
        density="compact"
        variant="outlined"
        divided
      >
        <v-btn v-for="day in 9" :key="day" :value="day" size="x-small">{{ day }}</v-btn>
      </v-btn-toggle>
      <v-btn
        icon="mdi-eraser-variant"
        density="compact"
        variant="text"
        title="Сцерці метку дня"
        @click="setDayMarker(null)"
      ></v-btn>
    </div>
  </div>
</template>
      </div>

      <!-- Контент редактора -->
      <div class="editor-content-wrapper">
        <editor-content :editor="editor" />
      </div>
    </div>

    <!-- Диалог для вставки ссылок (без изменений) -->
    <v-dialog v-model="isLinkDialogOpen" max-width="600px" scrollable>
       <v-card>
      <v-card-title class="headline">{{ $t('linkedNotesSelect') }}</v-card-title>
      <v-card-text class="pa-4">
        <v-text-field
          v-model="searchQuery"
          :placeholder="$t('searchPlaceholder')"
          variant="outlined"
          density="compact"
          autofocus
          hide-details
          class="mb-4"
        ></v-text-field>
        <v-list v-if="filteredNotes.length > 0">
          <v-list-item
            v-for="note in filteredNotes"
            :key="note.id"
            :title="getTitle(note)"
            @click="setLink(note.id)"
          >
            <template v-slot:prepend>
              <v-icon>mdi-note-text-outline</v-icon>
            </template>
          </v-list-item>
        </v-list>
        <div v-else class="text-center text-grey py-4">{{ $t('noNotesFound') }}</div>
      </v-card-text>
    </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, watch, onBeforeUnmount, ref } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { Paragraph } from '@tiptap/extension-paragraph';
import { useI18n } from 'vue-i18n';
import { useItems } from '@/composables/useItems';
import { getTitleByLang } from '@/utils/i18n';

const { t } = useI18n();
const props = defineProps({
  modelValue: { type: String, default: '' },
  isNovena: { type: Boolean, default: false }
});
const emit = defineEmits(['update:modelValue']);
const { items, getTitle } = useItems();

// ✅ ИСПРАВЛЕНИЕ 3: Создаем ОДНО кастомное расширение для параграфа,
// которое будет поддерживать и выравнивание, и рубрики, и метки дней новенны.
const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      // Атрибут для выравнивания
      textAlign: {
        default: 'left',
        renderHTML: attributes => ({ style: `text-align: ${attributes.textAlign}` }),
        parseHTML: element => element.style.textAlign || 'left',
      },
      // Атрибут для рубрик (хранится как CSS-класс)
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => (attributes.class ? { class: attributes.class } : {}),
      },
      // Атрибут для дней новенны (data-day="...")
      dayMarker: {
        default: null,
        parseHTML: element => element.getAttribute('data-day'),
        renderHTML: attributes => (attributes.dayMarker ? { 'data-day': attributes.dayMarker } : {}),
      },
       marker: {
        default: null,
        parseHTML: element => element.getAttribute('data-marker'),
        renderHTML: attributes => (attributes.marker ? { 'data-marker': attributes.marker } : {}),
      },
    };
  },
  // Добавляем команду для установки метки дня
  addCommands() {
    return {
      setDayMarker: (day) => ({ commands }) => {
        return commands.updateAttributes('paragraph', { dayMarker: day });
      },
      // ✅ НОВАЯ КОМАНДА для установки меток "старт" и "финиш"
      setMarker: (type) => ({ commands }) => {
        return commands.updateAttributes('paragraph', { marker: type, dayMarker: null }); // Сбрасываем дневной маркер
      }
    };
  },
});

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      paragraph: false, // ❗ Важно: отключаем стандартный параграф
      link: false,      // ❗ Важно: отключаем стандартную ссылку
    }),
    Paragraph,
    CustomParagraph,   // ✅ Используем наше кастомное расширение
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
    }),
  ],
  onUpdate: () => {
    emit('update:modelValue', editor.value.getHTML());
  },
});

// Вычисляемое свойство для отображения текущего стиля (без изменений)
const currentStyleLabel = computed(() => {
  if (!editor.value) return '';
  if (editor.value.isActive('heading', { level: 2 })) return t('style.h2');
  if (editor.value.isActive('heading', { level: 3 })) return t('style.h3');
  if (editor.value.isActive({ class: 'rubric' })) return t('style.rubric'); // Проверяем по классу
  return t('style.normal');
});

// --- Логика для диалога ссылок (без изменений) ---
const isLinkDialogOpen = ref(false);
const searchQuery = ref('');
const filteredNotes = computed(() => {
  if (!searchQuery.value) {
    return items.value;
  }
  return items.value.filter(note => 
    getTitle(note).toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

function openLinkDialog() {
  // Команда `isActive('link')` проверяет, стоит ли курсор на ссылке
  // Если да, мы убираем ссылку. Если нет, открываем диалог для её создания.
  if (editor.value.isActive('link')) {
    editor.value.chain().focus().unsetLink().run();
  } else {
    isLinkDialogOpen.value = true;
  }
}
function setLink(noteId) {
  const url = `/item/${noteId}`;
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  isLinkDialogOpen.value = false;
  searchQuery.value = ''; // Сбрасываем поиск
}


// --- Новая логика для меток дней новенны ---
const currentDayMarker = computed(() => {
  if (!editor.value || !editor.value.isActive('paragraph')) return null;
  return editor.value.getAttributes('paragraph').dayMarker;
});
// ✅ ВЫЧИСЛЯЕМОЕ СВОЙСТВО ДЛЯ МЕТОК "СТАРТ/ФИНИШ"
const currentMarker = computed(() => {
    if (!editor.value || !editor.value.isActive('paragraph')) return null;
    return editor.value.getAttributes('paragraph').marker;
});

function setDayMarker(day) {
  // Если текущая метка совпадает с нажатой, снимаем выделение
  if (currentDayMarker.value === day) {
    editor.value.chain().focus().setDayMarker(null).run();
  } else {
    editor.value.chain().focus().setDayMarker(day).run();
  }
}

// ✅ ФУНКЦИЯ ДЛЯ УСТАНОВКИ МЕТОК "СТАРТ/ФИНИШ"
function setMarker(type) {
    if (currentMarker.value === type) {
        editor.value.chain().focus().setMarker(null).run();
    } else {
        editor.value.chain().focus().setMarker(type).run();
    }
}



watch(() => props.modelValue, (value) => {
  if (editor.value && editor.value.getHTML() !== value) {
    editor.value.commands.setContent(value, false);
  }
});

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy();
  }
});
</script>

<style scoped>
/* Стили остаются без изменений */
.editor-wrapper {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  position: relative; 
  display: flex;
  flex-direction: column;
  max-height: 70vh; 
}
.editor-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  flex-shrink: 0; 
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 4px 8px;
  gap: 4px;
}
.editor-content-wrapper {
  overflow-y: auto;
  flex-grow: 1;
}
.editor-content-wrapper > :deep(.ProseMirror) {
  padding: 8px 12px;
}
</style>