<script setup lang="tsx">
import { applyPureReactInVue } from 'veaury'
import { setVeauryOptions } from 'veaury'

import { createRoot } from 'react-dom/client'

import { BlockNoteEditor } from '@blocknote/core'
import { BlockNoteView } from '@blocknote/mantine'

import { zh } from '@blocknote/core/locales'

setVeauryOptions({ react: { createRoot } })

const { theme = 'light', onUploadFile } = defineProps<{
  editable?: boolean
  theme?: 'light' | 'dark'
  onUploadFile?: (file: File) => Promise<string>
}>()
const NoteView = applyPureReactInVue(BlockNoteView)

const html = defineModel<string>('html')

const editor = shallowRef<BlockNoteEditor | null>(null)

onMounted(() => {
  editor.value = BlockNoteEditor.create({
    dictionary: zh,
    uploadFile: onUploadFile ? (file) => onUploadFile?.(file) : undefined
  })
})
onBeforeUnmount(() => {
  editor.value = null
})

watchEffect(() => {
  if (editor.value && editor.value.isEmpty && html.value) {
    const blocks = editor.value.tryParseHTMLToBlocks(html.value)
    editor.value.replaceBlocks(editor.value.document, blocks)
  }
})

const change = () => {
  html.value = editor.value?.blocksToHTMLLossy(editor.value.document)
}

defineExpose({
  undo: () => editor.value?.undo(),
  redo: () => editor.value?.redo(),
  focus: () => editor.value?.focus(),
  tryParseHTMLToBlocks: (html: string) => editor.value?.tryParseHTMLToBlocks(html)
})
</script>

<template>
  <NoteView v-if="editor?.mount" :theme="theme" :editor="editor" @change="change" />
</template>
