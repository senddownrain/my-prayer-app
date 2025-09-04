<template>
  <div>
    <div v-if="editor" class="editor-wrapper">
      <div class="editor-toolbar">
        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" density="compact" class="mr-2" style="min-width: 140px;">
              {{ currentStyleLabel }}
              <v-icon right>mdi-menu-down</v-icon>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item @click="editor.chain().focus().setNode('paragraph', { class: null, dayMarker: null, marker: null }).run()" :active="editor.isActive('paragraph')">
              <v-list-item-title>{{ $t('style.normal') }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :active="editor.isActive('heading', { level: 2 })">
              <v-list-item-title>{{ $t('style.h2') }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :active="editor.isActive('heading', { level: 3 })">
              <v-list-item-title>{{ $t('style.h3') }}</v-list-item-title>
            </v-list-item>
            <v-list-item 
              @click="editor.chain().focus().toggleRubric().run()" 
              :active="editor?.value?.getAttributes('paragraph')?.class === 'rubric'">
              <v-list-item-title>{{ $t('style.rubric') }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-divider vertical class="mx-1"></v-divider>

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
          :disabled="editor?.state?.selection?.empty"
          icon="mdi-link-variant-plus"
          density="compact"
          variant="text"
        ></v-btn>

        <v-divider vertical class="mx-1"></v-divider>

        <!-- Размер / цвет -->
        <div class="d-flex align-center">
          <v-btn icon density="compact" variant="text" title="Увеличить размер" @click="increaseSelectionFontSize">
            <v-icon>mdi-arrow-up-bold</v-icon>
          </v-btn>
          <v-btn icon density="compact" variant="text" title="Уменьшить размер" @click="decreaseSelectionFontSize">
            <v-icon>mdi-arrow-down-bold</v-icon>
          </v-btn>

          <v-btn icon density="compact" variant="text" :color="isSelectionRed ? 'error' : undefined" title="Сделать красным / Убрать красный" @click="toggleRedColor">
            <v-icon>mdi-format-color-text</v-icon>
          </v-btn>
        </div>

        <v-divider vertical class="mx-1"></v-divider>

        <template v-if="isNovena">
          <v-divider vertical class="mx-1"></v-divider>
          <div class="d-flex align-center ga-2">
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

      <div class="editor-content-wrapper">
        <EditorContent :editor="editor" />
      </div>
    </div>

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
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Paragraph from '@tiptap/extension-paragraph'; // default import
import * as TextStyleModule from '@tiptap/extension-text-style';
import * as ColorModule from '@tiptap/extension-color';
const TextStyle = TextStyleModule.default ?? TextStyleModule.TextStyle ?? TextStyleModule;
const Color = ColorModule.default ?? ColorModule.Color ?? ColorModule;

import { useI18n } from 'vue-i18n';
import { useItems } from '@/composables/useItems';

const { t } = useI18n();

const props = defineProps({
  modelValue: { type: String, default: '' },
  isNovena: { type: Boolean, default: false }
});
const emit = defineEmits(['update:modelValue']);
const { items, getTitle } = useItems();

// Custom paragraph extension
const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      textAlign: {
        default: 'left',
        renderHTML: attributes => ({ style: `text-align: ${attributes.textAlign}` }),
        parseHTML: element => element.style.textAlign || 'left',
      },
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => (attributes.class ? { class: attributes.class } : {}),
      },
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
  addCommands() {
    return {
      toggleRubric: () => ({ commands, state }) => {
        const currentClass = state.selection?.$from?.parent?.attrs?.class ?? null;
        return commands.updateAttributes('paragraph', { class: currentClass === 'rubric' ? null : 'rubric' });
      },
      setDayMarker: (day) => ({ commands }) => {
        return commands.updateAttributes('paragraph', { dayMarker: day });
      },
      setMarker: (type) => ({ commands }) => {
        return commands.updateAttributes('paragraph', { marker: type, dayMarker: null });
      }
    };
  },
});

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      paragraph: false,
      link: false,
    }),
    CustomParagraph,
    TextStyle.configure?.({}),
    Color.configure?.({}),
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

// Toolbar label
const currentStyleLabel = computed(() => {
  if (!editor.value) return '';
  if (editor.value.isActive('heading', { level: 2 })) return t('style.h2');
  if (editor.value.isActive('heading', { level: 3 })) return t('style.h3');
  if (editor.value.getAttributes('paragraph')?.class === 'rubric') return t('style.rubric');
  return t('style.normal');
});

// Link dialog state
const isLinkDialogOpen = ref(false);
const searchQuery = ref('');
const filteredNotes = computed(() => {
  if (!searchQuery.value) return items.value;
  return items.value.filter(note => getTitle(note).toLowerCase().includes(searchQuery.value.toLowerCase()));
});
function openLinkDialog() {
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
  searchQuery.value = '';
}

// Novena markers
const currentDayMarker = computed(() => {
  if (!editor.value || !editor.value.isActive('paragraph')) return null;
  return editor.value.getAttributes('paragraph').dayMarker;
});
const currentMarker = computed(() => {
  if (!editor.value || !editor.value.isActive('paragraph')) return null;
  return editor.value.getAttributes('paragraph').marker;
});
function setDayMarker(day) {
  if (currentDayMarker.value === day) {
    editor.value.chain().focus().setDayMarker(null).run();
  } else {
    editor.value.chain().focus().setDayMarker(day).run();
  }
}
function setMarker(type) {
  if (currentMarker.value === type) {
    editor.value.chain().focus().setMarker(null).run();
  } else {
    editor.value.chain().focus().setMarker(type).run();
  }
}

// Font size / color helpers
function parseStyleString(style = '') {
  const obj = {};
  style.split(';').map(s => s.trim()).filter(Boolean).forEach(pair => {
    const [k, v] = pair.split(':').map(s => s.trim());
    if (k && v) obj[k] = v;
  });
  return obj;
}
function styleObjectToString(obj = {}) {
  return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join('; ');
}
const DEFAULT_BASE_PX = 16;
const SIZE_STEP_PX = 2;
const MIN_FONT_PX = 10;

function getCurrentTextStyleObj() {
  const attrs = editor.value?.getAttributes('textStyle') || {};
  const styleStr = attrs.style || '';
  return parseStyleString(styleStr);
}

function applyFontSizePx(newPx) {
  const styleObj = getCurrentTextStyleObj();
  styleObj['font-size'] = `${newPx}px`;
  const newStyle = styleObjectToString(styleObj);
  editor.value.chain().focus().extendMarkRange('textStyle').setMark('textStyle', { style: newStyle }).run();
  // debug
  // console.log('[Editor] applied textStyle:', editor.value.getAttributes('textStyle'));
}

function increaseSelectionFontSize() {
  if (!editor.value) return;
  if (editor.value.state.selection.empty) {
    // optionally select word: editor.value.chain().focus().selectWord().run();
    console.warn('[Editor] selection is collapsed — select text to change existing font-size.');
  }
  const styleObj = getCurrentTextStyleObj();
  let font = styleObj['font-size'] || null;
  let currentPx = null;
  if (font) {
    const m = font.match(/([\d.]+)(px|rem|em)/);
    if (m) {
      const value = parseFloat(m[1]);
      const unit = m[2];
      if (unit === 'px') currentPx = value;
      else if (unit === 'rem' || unit === 'em') currentPx = Math.round(value * DEFAULT_BASE_PX);
    }
  }
  if (!currentPx) currentPx = DEFAULT_BASE_PX;
  const newPx = Math.round(currentPx + SIZE_STEP_PX);
  applyFontSizePx(newPx);
}

function decreaseSelectionFontSize() {
  if (!editor.value) return;
  if (editor.value.state.selection.empty) {
    console.warn('[Editor] selection is collapsed — select text to change existing font-size.');
  }
  const styleObj = getCurrentTextStyleObj();
  let font = styleObj['font-size'] || null;
  let currentPx = null;
  if (font) {
    const m = font.match(/([\d.]+)(px|rem|em)/);
    if (m) {
      const value = parseFloat(m[1]);
      const unit = m[2];
      if (unit === 'px') currentPx = value;
      else if (unit === 'rem' || unit === 'em') currentPx = Math.round(value * DEFAULT_BASE_PX);
    }
  }
  if (!currentPx) currentPx = DEFAULT_BASE_PX;
  const newPx = Math.max(MIN_FONT_PX, Math.round(currentPx - SIZE_STEP_PX));
  applyFontSizePx(newPx);
}

const isSelectionRed = computed(() => {
  if (!editor.value) return false;
  const attrs = editor.value.getAttributes('textStyle') || {};
  const styleObj = parseStyleString(attrs.style || '');
  const color = styleObj.color || attrs.color;
  if (!color) return false;
  return color === 'red' || color === '#ff0000' || color.startsWith('rgb(255,0,0');
});

function toggleRedColor() {
  if (!editor.value) return;
  try {
    if (isSelectionRed.value) {
      const styleObj = getCurrentTextStyleObj();
      delete styleObj.color;
      const newStyle = styleObjectToString(styleObj);
      if (newStyle) {
        editor.value.chain().focus().extendMarkRange('textStyle').setMark('textStyle', { style: newStyle }).run();
      } else {
        editor.value.chain().focus().unsetMark('textStyle').run();
        try { editor.value.chain().focus().unsetColor().run(); } catch (e) {}
      }
    } else {
      try {
        editor.value.chain().focus().setColor('red').run();
      } catch {
        const styleObj = getCurrentTextStyleObj();
        styleObj.color = 'red';
        const newStyle = styleObjectToString(styleObj);
        editor.value.chain().focus().extendMarkRange('textStyle').setMark('textStyle', { style: newStyle }).run();
      }
    }
  } catch (e) {
    console.error('toggleRedColor error', e);
  }
}

watch(() => props.modelValue, (value) => {
  if (editor.value && editor.value.getHTML() !== value) {
    editor.value.commands.setContent(value, false);
  }
});

onBeforeUnmount(() => {
  if (editor.value) editor.value.destroy();
});
</script>

<style scoped>
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