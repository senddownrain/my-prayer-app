<template>
  <div v-if="editor" class="editor-container">
    <!-- ✅ ОБНОВЛЕННАЯ ПАНЕЛЬ ИНСТРУМЕНТОВ -->
    <div class="editor-toolbar">
      <!-- Выпадающий список для стилей -->
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
           <v-list-item @click="editor.chain().focus().toggleRubric().run()" :active="editor.isActive('rubric')">
            <v-list-item-title>{{ $t('style.rubric') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-divider vertical class="mx-1"></v-divider>

      <!-- Кнопки форматирования -->
      <v-btn-toggle multiple density="compact" variant="text">
        <v-btn @click="editor.chain().focus().toggleBold().run()" :class="{ 'v-btn--active': editor.isActive('bold') }" icon="mdi-format-bold"></v-btn>
        <v-btn @click="editor.chain().focus().toggleItalic().run()" :class="{ 'v-btn--active': editor.isActive('italic') }" icon="mdi-format-italic"></v-btn>
      </v-btn-toggle>

      <v-divider vertical class="mx-1"></v-divider>

       <!-- Списки -->
      <v-btn-toggle multiple density="compact" variant="text">
        <v-btn @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'v-btn--active': editor.isActive('bulletList') }" icon="mdi-format-list-bulleted"></v-btn>
        <v-btn @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'v-btn--active': editor.isActive('orderedList') }" icon="mdi-format-list-numbered"></v-btn>
      </v-btn-toggle>
       <v-divider vertical class="mx-1"></v-divider>
      <!-- Выравнивание -->
      <v-btn-toggle multiple density="compact" variant="text">
        <v-btn @click="editor.chain().focus().setTextAlign('left').run()" :class="{ 'v-btn--active': editor.isActive({ textAlign: 'left' }) }" icon="mdi-format-align-left"></v-btn>
        <v-btn @click="editor.chain().focus().setTextAlign('center').run()" :class="{ 'v-btn--active': editor.isActive({ textAlign: 'center' }) }" icon="mdi-format-align-center"></v-btn>
        <v-btn @click="editor.chain().focus().setTextAlign('justify').run()" :class="{ 'v-btn--active': editor.isActive({ textAlign: 'justify' }) }" icon="mdi-format-align-justify"></v-btn>
      </v-btn-toggle>

    </div>

    <editor-content :editor="editor" />
  </div>
</template>

<script setup>
import { computed, watch, onBeforeUnmount, ref } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Node } from '@tiptap/core';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps({ modelValue: { type: String, default: '' } });
const emit = defineEmits(['update:modelValue']);

// ✅ Пользовательское расширение для Рубрики
const Rubric = Node.create({
  name: 'rubric',
  group: 'block',
  content: 'inline*',
  parseHTML() { return [{ tag: 'p.rubric', class: 'rubric' }]; },
  renderHTML({ HTMLAttributes }) { return ['p', { ...HTMLAttributes, class: 'rubric' }, 0]; },
  addCommands() {
    return {
      toggleRubric: () => ({ commands, state }) => {
        const isActive = this.editor.isActive('rubric');
        if (isActive) {
          return commands.setNode('paragraph');
        }
        return commands.setNode(this.name);
      },
    };
  },
});

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3] }, // Заголовки h2 и h3
      paragraph: false, // Отключаем стандартный, чтобы добавить свой
    }),
    Paragraph, // Добавляем стандартный параграф
    TextAlign.configure({ types: ['heading', 'paragraph', 'rubric'] }),
    Rubric, // Наше расширение для рубрик
  ],
  onUpdate: () => {
    emit('update:modelValue', editor.value.getHTML());
  },
});

// ✅ Логика для отображения текущего стиля в кнопке
const currentStyleLabel = computed(() => {
  if (!editor.value) return '';
  if (editor.value.isActive('heading', { level: 2 })) return t('style.h2');
  if (editor.value.isActive('heading', { level: 3 })) return t('style.h3');
  if (editor.value.isActive('rubric')) return t('style.rubric');
  return t('style.normal');
});


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