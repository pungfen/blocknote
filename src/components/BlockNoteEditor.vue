<script setup lang="tsx">
import { applyPureReactInVue } from 'veaury'
import { setVeauryOptions } from 'veaury'

import { createRoot } from 'react-dom/client'

import {
  BlockNoteEditor,
  BlockNoteSchema,
  createBlockSpec,
  defaultBlockSpecs,
  defaultProps,
  createVideoBlockConfig,
  type BlockSchema,
  type BlockNoteEditorOptions,
  type InlineContentSchema,
  type StyleSchema,
  FILE_VIDEO_ICON_SVG
} from '@blocknote/core'

import { ResizableFileBlockWrapper, createReactBlockSpec } from '@blocknote/react'

import { BlockNoteView } from '@blocknote/mantine'

import { zh } from '@blocknote/core/locales'

type BlockNoteEditorProps = BlockNoteEditorOptions<BlockSchema, InlineContentSchema, StyleSchema>

setVeauryOptions({ react: { createRoot } })

const { theme = 'light', onUploadFile } = defineProps<{
  editable?: boolean
  theme?: 'light' | 'dark'
  onUploadFile?: (file: File) => Promise<string>
}>()
const NoteView = applyPureReactInVue(BlockNoteView)

const html = defineModel<string>('html')

const editor = shallowRef<BlockNoteEditor | null>(null)

const createVideoBlockSpec = createBlockSpec(
  {
    type: 'video',
    content: 'none',
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      backgroundColor: defaultProps.backgroundColor,
      name: { default: '' },
      url: { default: '' },
      caption: { default: '' },
      showPreview: { default: true },
      previewWidth: { default: undefined, type: 'number' }
    }
  },
  {
    render(block, editor) {
      const icon = document.createElement('div')
      icon.innerHTML = FILE_VIDEO_ICON_SVG

      const videoWrapper = document.createElement('div')
      videoWrapper.className = 'bn-visual-media-wrapper'

      const video = document.createElement('video')
      video.className = 'bn-visual-media'
      if (editor.resolveFileUrl) {
        editor.resolveFileUrl(block.props.url).then((downloadUrl) => {
          video.src = downloadUrl
        })
      } else {
        video.src = block.props.url
      }

      video.controls = true
      video.contentEditable = 'false'
      video.draggable = false
      video.width = block.props.previewWidth
      videoWrapper.appendChild(video)

      return {}
    }
  }
)

const VideoBlock = createReactBlockSpec(createVideoBlockConfig, (config) => ({}))

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
  focus: () => editor.value?.focus()
})

const editorProps = {
  schema: BlockNoteSchema.create({
    blockSpecs: {
      ...defaultBlockSpecs,
      video: createVideoBlockSpec()
    }
  })
}
</script>

<template>
  <NoteView
    v-if="editor?.mount"
    :theme="theme"
    :editor="editor"
    :editor-props="editorProps"
    @change="change"
  />
</template>
