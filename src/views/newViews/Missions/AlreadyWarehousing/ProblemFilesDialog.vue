<script setup lang="ts">
  import { computed, ref } from 'vue';
  import AppendFileListDisplay from '@/views/bolita-views/composable/AppendFileListDisplay.vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';

  interface Props {
    info: any;
  }

  const loading = ref(false);

  // Selected file type state

  const props = defineProps<Props>();

  const filteredFiles = computed(() => {
    return props.info.problemFiles;
  });
</script>

<template>
  <loading-frame :loading="loading">
    <append-file-list-display :files-url="filteredFiles" :show-button="false" />
  </loading-frame>
</template>

<style scoped lang="less">
  .filter-container {
    margin-bottom: 16px;
  }

  .file-type-select {
    width: 200px;
  }

  .content-container {
    padding: 16px;
  }

  .empty-files {
    text-align: center;
    padding: 20px;
    color: #999;
  }

  .files-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .file-item {
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .file-preview {
    width: 100%;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    margin-bottom: 10px;
  }

  .file-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .file-icon {
    width: 100%;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
  }

  .file-info {
    width: 100%;
    text-align: center;
  }

  .file-name {
    margin: 0 0 10px;
    font-size: 14px;
    word-break: break-word;
    max-height: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
