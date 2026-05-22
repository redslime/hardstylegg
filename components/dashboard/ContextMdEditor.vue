<script setup lang="ts">
import YouTubeIcon from "~/components/icons/YouTubeIcon.vue";
import {type ExposeParam, MdEditor, NormalToolbar, type ToolbarNames} from "md-editor-v3";

const markdown = defineModel<string>('markdown', { required: true })
const editorRef = ref<ExposeParam>();
const toolbar: ToolbarNames[] = ["bold", "underline", "italic", "-", "title", "strikeThrough", "sub", "sup", "quote", "unorderedList", "orderedList", "link", "image", 0]

const handleYouTube = () => {
  editorRef.value?.insert(() => {
    return {
      targetValue: '@[youtube]()',
      select: true,
      deviationStart: 11,
      deviationEnd: -1
    };
  });
};
</script>

<template>
  <MdEditor ref="editorRef" v-model="markdown" language="en-US" theme="dark" :toolbars="toolbar" noUploadImg class="md-editor-custom">
    <template #defToolbars>
      <NormalToolbar title="YouTube" @onClick="handleYouTube">
        <template #trigger>
          <YouTubeIcon class="w-5 h-5" />
        </template>
      </NormalToolbar>
    </template>
  </MdEditor>
</template>

<style scoped>
@import "md-editor-v3/lib/style.css";
@import "~/assets/md.css";
</style>