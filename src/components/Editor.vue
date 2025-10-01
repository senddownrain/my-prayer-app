<template>
  <div>
    <div v-if="editor" class="editor-wrapper">
      <div class="editor-toolbar">
        <!-- Меню стилей -->
        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" density="compact" class="mr-2" style="min-width: 140px;">
              {{ currentStyleLabel }}
              <v-icon right>mdi-menu-down</v-icon>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item @click="editor.chain().focus().setParagraph().run()" :active="editor.isActive('paragraph')">
              <v-list-item-title>{{ $t('style.normal', 'Обычный текст') }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :active="editor.isActive('heading', { level: 1 })">
              <v-list-item-title>{{ $t('style.h1', 'Заголовок 1') }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :active="editor.isActive('heading', { level: 2 })">
              <v-list-item-title>{{ $t('style.h2', 'Заголовок 2') }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :active="editor.isActive('heading', { level: 3 })">
              <v-list-item-title>{{ $t('style.h3', 'Заголовок 3') }}</v-list-item-title>
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

        <v-btn-toggle v-bind="null" density="compact" variant="text">
          <v-btn 
            @click="openLinkDialog" 
            :disabled="editor?.state?.selection?.empty"
            icon="mdi-link-variant-plus"
            title="Добавить ссылку на заметку"
          ></v-btn>
           <v-btn icon :color="isSelectionRed ? 'error' : undefined" title="Сделать красным / Убрать красный" @click="toggleRedColor">
            <v-icon>mdi-format-color-text</v-icon>
          </v-btn>
          <v-btn icon @click="editor.chain().focus().clearNodes().command(joinAllParagraphs).unsetAllMarks().run()" title="Очистить форматирование">
            <v-icon>mdi-format-clear</v-icon>
          </v-btn>
          <v-btn icon @click="toggleHtmlMode" :class="{ 'v-btn--active': isHtmlMode }" title="Редактировать HTML">
            <v-icon>mdi-code-braces</v-icon>
          </v-btn>
        </v-btn-toggle>
        
        <template v-if="isNovena">
          <v-divider vertical class="mx-1"></v-divider>
          <div class="d-flex align-center ga-2">
            <v-btn-toggle :model-value="currentMarker" @update:model-value="setMarker" density="compact" variant="outlined">
              <v-btn value="start" title="Позначыць як уступ"><v-icon>mdi-play-circle-outline</v-icon></v-btn>
              <v-btn value="finish" title="Позначыць як заканчэнне"><v-icon>mdi-flag-checkered</v-icon></v-btn>
            </v-btn-toggle>
            <div class="d-flex align-center ga-1">
              <span class="text-caption mr-1 text-disabled">Дзень:</span>
              <v-btn-toggle :model-value="currentDayMarker" @update:model-value="setDayMarker" density="compact" variant="outlined" divided>
                <v-btn v-for="day in 9" :key="day" :value="day" size="x-small">{{ day }}</v-btn>
              </v-btn-toggle>
              <v-btn icon="mdi-eraser-variant" density="compact" variant="text" title="Сцерці метку дня" @click="setDayMarker(null)"></v-btn>
            </div>
          </div>
        </template>
      </div>

      <div class="editor-content-wrapper">
        <EditorContent v-if="!isHtmlMode" :editor="editor" />
        <v-textarea v-else v-model="rawHtml" variant="solo-filled" flat hide-details class="html-editor" auto-grow></v-textarea>
      </div>
    </div>

    <v-dialog v-model="isLinkDialogOpen" max-width="600px" scrollable>
      <v-card>
        <v-card-title class="headline">{{ $t('linkedNotesSelect') }}</v-card-title>
        <v-card-text class="pa-4">
          <v-text-field v-model="searchQuery" :placeholder="$t('searchPlaceholder')" variant="outlined" density="compact" autofocus hide-details class="mb-4"></v-text-field>
          <v-list v-if="filteredNotes.length > 0">
            <v-list-item v-for="note in filteredNotes" :key="note.id" :title="getTitle(note)" @click="setLink(note.id)">
              <template v-slot:prepend><v-icon>mdi-note-text-outline</v-icon></template>
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
import Paragraph from '@tiptap/extension-paragraph';
import { useI18n } from 'vue-i18n';
import { useItems } from '@/composables/useItems';
import HardBreak from '@tiptap/extension-hard-break';
import * as TextStyleModule from '@tiptap/extension-text-style';
import * as ColorModule from '@tiptap/extension-color';
const TextStyle = TextStyleModule.default ?? TextStyleModule.TextStyle ?? TextStyleModule;
const Color = ColorModule.default ?? ColorModule.Color ?? ColorModule;


const { t } = useI18n();
const props = defineProps({
  modelValue: { type: String, default: '' },
  isNovena: { type: Boolean, default: false }
});
const emit = defineEmits(['update:modelValue']);
const { items, getTitle } = useItems();

const isHtmlMode = ref(false);
const rawHtml = ref(props.modelValue);

function toggleHtmlMode() {
  if (isHtmlMode.value) { editor.value.commands.setContent(rawHtml.value, false); } 
  else { rawHtml.value = editor.value.getHTML(); }
  isHtmlMode.value = !isHtmlMode.value;
}

const joinAllParagraphs = ({ tr, dispatch }) => {
  const { from, to } = tr.selection;
  let start = -1;
  let end = -1;
  tr.doc.nodesBetween(from, to, (node, pos) => {
    if (node.isBlock) {
      if (start === -1) start = pos;
      end = pos + node.nodeSize;
    }
  });
  if (start === -1 || end === -1 || start === end) return false;
  const joinPositions = [];
  for (let i = start + 1; i < end - 1; i++) {
    const resolvedPos = tr.doc.resolve(i);
    if (resolvedPos.parentOffset === 0 && resolvedPos.nodeBefore && resolvedPos.nodeBefore.isBlock) {
      joinPositions.push(i);
    }
  }
  if (dispatch && joinPositions.length > 0) {
    joinPositions.reverse().forEach(pos => tr.join(pos));
  }
  return true;
};

const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      dayMarker: { default: null, parseHTML: el => el.getAttribute('data-day'), renderHTML: attrs => attrs.dayMarker ? { 'data-day': attrs.dayMarker } : {} },
      marker: { default: null, parseHTML: el => el.getAttribute('data-marker'), renderHTML: attrs => attrs.marker ? { 'data-marker': attrs.marker } : {} },
    };
  },
  addKeyboardShortcuts() {
    return {
      'Shift-Enter': () => this.editor.commands.setHardBreak(), // Вставить <br>
      // Можно также явно определить Enter, чтобы он создавал новый параграф (поведение по умолчанию)
      'Enter': () => this.editor.commands.splitBlock(),
    };}
  
});

const editor = useEditor({
  content: props.modelValue,
  editorProps: {
   transformPastedHTML(html) {
      const div = document.createElement('div');
      div.innerHTML = html;
      div.querySelectorAll('*').forEach(el => {
        el.removeAttribute('style');
        el.removeAttribute('class');
      });
      div.querySelectorAll('span, em, i, strong, b').forEach(el => {
        el.replaceWith(...el.childNodes);
      });
      // 💡 Улучшенная очистка пустых параграфов: удаляем даже те, что содержат только &nbsp; или <br>
      div.querySelectorAll('p').forEach(p => {
        const textContent = p.textContent || ''; // textContent может быть null для пустых элементов
        const innerHTML = p.innerHTML || '';
        // Считаем параграф пустым, если он не содержит текста, или содержит только теги <br>, или только &nbsp;
        if (textContent.trim() === '' && innerHTML.replace(/<br\s*\/?>/gi, '').trim() === '&nbsp;') {
          p.remove();
        }
      });
      return div.innerHTML;
    },
  },
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      paragraph: false,
      hardBreak: false,
    }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Link.configure({ openOnClick: false, autolink: true }),
    CustomParagraph,
    TextStyle,
    Color,
    HardBreak
  ],
  onUpdate: ({ editor }) => {
    const html = editor.getHTML();
    emit('update:modelValue', html);
    rawHtml.value = html;
  },
});

const currentStyleLabel = computed(() => {
  if (!editor.value) return '';
  if (editor.value.isActive('heading', { level: 1 })) return t('style.h1', 'Заголовок 1');
  if (editor.value.isActive('heading', { level: 2 })) return t('style.h2', 'Заголовок 2');
  if (editor.value.isActive('heading', { level: 3 })) return t('style.h3', 'Заголовок 3');
  return t('style.normal', 'Обычный текст');
});
const DARK_RED_COLOR = '#E53935'; // Можно использовать любой hex-код, например,  #ff1000это Material Design Red 800

const isSelectionRed = computed(() => editor.value?.isActive('textStyle', { color: DARK_RED_COLOR  }));

function toggleRedColor() {
  const chain = editor.value.chain().focus();
  isSelectionRed.value ? chain.unsetColor().run() : chain.setColor(DARK_RED_COLOR).run();
}

const isLinkDialogOpen = ref(false);
const searchQuery = ref('');
const filteredNotes = computed(() => {
  if (!searchQuery.value) return items.value;
  return items.value.filter(note => getTitle(note).toLowerCase().includes(searchQuery.value.toLowerCase()));
});
function openLinkDialog() {
  if (editor.value.isActive('link')) editor.value.chain().focus().unsetLink().run();
  else isLinkDialogOpen.value = true;
}
function setLink(noteId) {
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: `/item/${noteId}` }).run();
  isLinkDialogOpen.value = false;
  searchQuery.value = '';
}

const currentDayMarker = computed(() => editor.value?.getAttributes('paragraph').dayMarker);
const currentMarker = computed(() => editor.value?.getAttributes('paragraph').marker);
function setDayMarker(day) {
  const chain = editor.value.chain().focus();
  currentDayMarker.value === day ? chain.updateAttributes('paragraph', { dayMarker: null }).run() : chain.updateAttributes('paragraph', { dayMarker: day }).run();
}
function setMarker(type) {
  const chain = editor.value.chain().focus();
  currentMarker.value === type ? chain.updateAttributes('paragraph', { marker: null }).run() : chain.updateAttributes('paragraph', { marker: type }).run();
}

watch(() => props.modelValue, (value) => {
  if (editor.value.getHTML() === value) return;
  isHtmlMode.value ? rawHtml.value = value : editor.value.commands.setContent(value, false);
});

onBeforeUnmount(() => editor.value?.destroy());
</script>

<style scoped>
.editor-wrapper {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 300px;
  max-height: 75vh;
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
  position: relative;
}
.editor-content-wrapper > :deep(.ProseMirror) {
  padding: 8px 12px;
  outline: none;
  min-height: 200px;
}
.html-editor {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
  line-height: 1.5;
  height: 100%;
}
.html-editor :deep(textarea) {
  height: 100%;
}
.v-btn--active {
  background-color: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}
</style>