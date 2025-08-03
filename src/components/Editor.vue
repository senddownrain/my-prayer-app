<template>
  <div v-if="editor" class="editor-container">
    <div class="toolbar">
      <v-menu location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" variant="text" class="mr-1" size="small">
            {{ currentStyleName }}
            <v-icon right>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item @click="editor.chain().focus().setParagraph().run()" :class="{ 'is-active': editor.isActive('paragraph') }">
            <v-list-item-title>{{ $t('style.normal') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
            <v-list-item-title>{{ $t('style.h1') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
            <v-list-item-title>{{ $t('style.h2') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">
            <v-list-item-title class="EditorRubricMenu"><h3>{{ $t('style.rubric') }}</h3></v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-divider vertical class="mx-2"></v-divider>
      <v-btn @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }" icon="mdi-format-bold" size="small" variant="text"></v-btn>
      <v-btn @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }" icon="mdi-format-italic" size="small" variant="text"></v-btn>
      <v-btn @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }" icon="mdi-format-list-bulleted" size="small" variant="text"></v-btn>
      <v-btn @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'is-active': editor.isActive('orderedList') }" icon="mdi-format-list-numbered" size="small" variant="text"></v-btn>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { watch, onBeforeUnmount, computed } from 'vue'
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])
const editor = useEditor({
  content: props.modelValue,
  extensions: [ StarterKit ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

const currentStyleName = computed(() => {
  if (!editor.value) return t('style.normal');
  if (editor.value.isActive('heading', { level: 1 })) return t('style.h1');
  if (editor.value.isActive('heading', { level: 2 })) return t('style.h2');
  if (editor.value.isActive('heading', { level: 3 })) return t('style.rubric');
  return t('style.normal');
})

watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.getHTML() !== newValue) {
    editor.value.commands.setContent(newValue, false)
  }
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<style>
.editor-container {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  transition: all 0.2s ease-in-out;
}
.editor-container:focus-within {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2);
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 4px 8px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.toolbar .v-btn.is-active {
  background-color: rgba(var(--v-theme-primary), 0.1);
}
.ProseMirror {
  padding: 12px 16px;
  min-height: 200px;
  outline: none;
}
</style>