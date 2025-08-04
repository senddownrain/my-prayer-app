<template>
  <div v-if="editor" class="editor-container">
    <div class="editor-toolbar">
      <v-btn-toggle v-model="textStyle" mandatory density="compact" variant="outlined">
        <v-btn value="paragraph">{{ $t('style.normal') }}</v-btn>
        <v-btn value="heading-2">{{ $t('style.h2') }}</v-btn>
        <v-btn value="heading-3">{{ $t('style.h3') }}</v-btn>
        <v-btn value="rubric">{{ $t('style.rubric') }}</v-btn>
      </v-btn-toggle>

      <v-spacer></v-spacer>
      
      <v-btn-toggle density="compact" variant="outlined">
        <v-btn @click="editor.chain().focus().setTextAlign('left').run()" :class="{ 'v-btn--active': editor.isActive({ textAlign: 'left' }) }" icon="mdi-format-align-left"></v-btn>
        <v-btn @click="editor.chain().focus().setTextAlign('center').run()" :class="{ 'v-btn--active': editor.isActive({ textAlign: 'center' }) }" icon="mdi-format-align-center"></v-btn>
        <v-btn @click="editor.chain().focus().setTextAlign('justify').run()" :class="{ 'v-btn--active': editor.isActive({ textAlign: 'justify' }) }" icon="mdi-format-align-justify"></v-btn>
      </v-btn-toggle>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, onMounted } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';

const props = defineProps({ modelValue: { type: String, default: '' } });
const emit = defineEmits(['update:modelValue']);

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({ heading: { levels: [2, 3] } }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
  ],
  onUpdate: () => { emit('update:modelValue', editor.value.getHTML()); },
});

const textStyle = ref('paragraph');

watch(() => props.modelValue, (value) => {
  if (editor.value && editor.value.getHTML() !== value) {
    editor.value.commands.setContent(value, false);
  }
});

watch(textStyle, (newStyle) => {
  if (!editor.value) return;
  const chain = editor.value.chain().focus();
  
  const isRubric = editor.value.getAttributes('paragraph').class === 'rubric';

  if (newStyle === 'paragraph') {
    chain.setParagraph().run();
  } else if (newStyle === 'heading-2') {
    chain.toggleHeading({ level: 2 }).run();
  } else if (newStyle === 'heading-3') {
    chain.toggleHeading({ level: 3 }).run();
  } else if (newStyle === 'rubric') {
    if (isRubric) {
        chain.setParagraph().run(); // Снимаем стиль
    } else {
        chain.setParagraph().setNode('paragraph', { class: 'rubric' }).run(); // Применяем
    }
  }
});

onBeforeUnmount(() => { if (editor.value) editor.value.destroy(); });
</script>