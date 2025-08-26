<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import AppendFileListDisplay from '@/views/bolita-views/composable/AppendFileListDisplay.vue';
  import { getFilesUploadFormField } from '@/api/dataLayer/fieldDefination/common';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { saveFiles } from '@/api/newDataLayer/Notify/Notify';
  import { addOrUpdateTask, getTaskListById } from '@/api/newDataLayer/TaskList/TaskList';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';

  interface Props {
    info: any;
  }
  const fileTypes = [
    { label: 'All', key: 'all' },
    { label: '卸柜单', key: 'xieguidan' },
    { label: '卸车图片', key: 'xieguipic' },
    { label: '换单文件', key: 'changeOrder' },
    { label: '操作图片', key: 'operationFiles' },
    { label: '问题图片', key: 'problemFiles' },
    { label: '装车单', key: 'zhuangchedan' },
    { label: '装车图片', key: 'zhuangchepic' },
    { label: 'CMR', key: 'cmr' },
    { label: 'Lieferschein', key: 'lieferschein' },
    { label: 'POD', key: 'pod' },
  ];

  const loading = ref(false);

  onMounted(async () => {
    await reload();
  });

  // Selected file type state
  const selectedFileType = ref(fileTypes[0].key);

  const field = [getFilesUploadFormField('files', false)];

  const props = defineProps<Props>();

  // Get the current selected type's key
  const currentTypeKey = computed(() => {
    return selectedFileType.value || 'all';
  });

  // Get files based on the selected file type
  const filteredFiles = computed(() => {
    if (!currentInfo.value) return [];

    if (currentTypeKey.value === 'all') {
      // For 'All' option, collect files from all keys
      let allFiles = '';
      fileTypes.forEach((type) => {
        if (type.key !== 'all') {
          allFiles += currentInfo.value[type.key] ?? '';
        }
      });
      return allFiles;
    } else {
      // For specific file types, return files for that key
      return currentInfo.value[currentTypeKey.value] || '';
    }
  });

  async function submit(value: any) {
    let currentFilesUrl = currentInfo.value[currentTypeKey.value];
    let newFiles = '';
    newFiles = await saveFiles(value.files);
    currentFilesUrl = currentFilesUrl + ',' + newFiles;
    currentInfo.value[currentTypeKey.value] = currentFilesUrl;
    await addOrUpdateTask(currentInfo.value);
    await reload();
  }

  async function deleteFile(file) {
    const allFiles = currentInfo.value[currentTypeKey.value].split(',');
    currentInfo.value[currentTypeKey.value] = allFiles.filter((it) => it !== file).join(',');
    await addOrUpdateTask(currentInfo.value);
    await reload();
  }

  const currentInfo = ref({});

  async function reload() {
    loading.value = true;
    currentInfo.value = await getTaskListById(props.info.id);
    loading.value = false;
  }
</script>

<template>
  <loading-frame :loading="loading">
    <div class="filter-container">
      <n-select
        v-model:value="selectedFileType"
        :options="fileTypes"
        label-field="label"
        value-field="key"
        placeholder="Select file type"
        class="file-type-select"
      />
    </div>
    <div class="content-container">
      <div v-if="filteredFiles.length === 0" class="empty-files">
        <p>No files available</p>
      </div>
      <div v-else>
        <append-file-list-display
          :showButton="selectedFileType !== 'all'"
          :files-url="filteredFiles"
          @delete-file="deleteFile"
        />
      </div>
      <div v-if="selectedFileType !== 'all'">
        <n-divider class="my-8" />
        <normal-form
          :form-fields="field"
          :show-buttons="false"
          :show-group-header="false"
          class="mt-4"
          @cancel="cancel"
          @submit="submit"
        >
          <template #extraSubmitButton="{ submit }">
            <n-button type="success" @click="submit">上传</n-button>
          </template>
          <template #extraCancelButton="{ cancel }">
            <n-button type="error" @click="cancel">关闭</n-button>
          </template>
        </normal-form>
      </div>
    </div>
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
