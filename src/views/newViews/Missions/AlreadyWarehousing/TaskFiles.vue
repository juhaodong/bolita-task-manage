<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import AppendFileListDisplay from '@/views/bolita-views/composable/AppendFileListDisplay.vue';
  import { getFilesUploadFormField } from '@/api/dataLayer/fieldDefination/common';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { saveFiles } from '@/api/newDataLayer/Notify/Notify';
  import { addOrUpdateTask, getTaskListById } from '@/api/newDataLayer/TaskList/TaskList';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { userTypeIsCustomer } from '@/api/dataLayer/common/power';

  interface Props {
    info: any;
  }
  const fileTypes = [
    { label: 'All', key: 'all' },
    { label: '卸柜单', key: 'notify.unloadingFile' },
    { label: '卸车图片', key: 'notify.unloadingPic' },
    { label: '换单文件', key: 'changeOrder' },
    { label: '操作图片', key: 'operationFiles' },
    { label: '问题图片', key: 'problemFiles' },
    { label: '装车图片', key: 'outboundForecast.pickupFiles' },
    { label: '装车单', key: 'outboundForecast.loadingCarDoc' },
    { label: 'CMR', key: 'outboundForecast.cmrFiles' },
    { label: 'lieferschein', key: 'outboundForecast.lieferscheinFiles' },
    { label: 'POD', key: 'outboundForecast.podFiles' },
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
      let allFilesArray = [];
      // console.log(currentInfo.value['outboundForecast']['lieferscheinFiles'], 'currentInfo.value');
      fileTypes.forEach((type) => {
        if (type.key !== 'all') {
          let fileValue = '';
          if (type.key.includes('.')) {
            const keys = type.key.split('.');
            // Check if the nested property exists
            if (currentInfo.value[keys[0]] && currentInfo.value[keys[0]][keys[1]]) {
              fileValue = currentInfo.value[keys[0]][keys[1]];
            }
          } else {
            // Check if the property exists
            if (currentInfo.value[type.key]) {
              fileValue = currentInfo.value[type.key];
            }
          }
          // Only add non-empty values
          if (fileValue && fileValue.trim() !== '') {
            // If the value already contains commas, split it and add each part
            if (fileValue.includes(',')) {
              const parts = fileValue.split(',').filter((part) => part.trim() !== '');
              allFilesArray = [...allFilesArray, ...parts];
            } else {
              allFilesArray.push(fileValue);
            }
          }
        }
      });
      return allFilesArray.join(',');
    } else {
      // For specific file types, return files for that key
      if (currentTypeKey.value.includes('.')) {
        const keys = currentTypeKey.value.split('.');
        return currentInfo.value[keys[0]] && currentInfo.value[keys[0]][keys[1]]
          ? currentInfo.value[keys[0]][keys[1]]
          : '';
      } else {
        return currentInfo.value[currentTypeKey.value] || '';
      }
    }
  });

  async function submit(value: any) {
    let currentFilesUrl = '';
    let newFiles = '';

    // Handle nested properties
    if (currentTypeKey.value.includes('.')) {
      const keys = currentTypeKey.value.split('.');
      // Ensure the parent object exists
      if (!currentInfo.value[keys[0]]) {
        currentInfo.value[keys[0]] = {};
      }
      currentFilesUrl = currentInfo.value[keys[0]][keys[1]] || '';
      newFiles = await saveFiles(value.files);
      currentFilesUrl = currentFilesUrl ? currentFilesUrl + ',' + newFiles : newFiles;
      currentInfo.value[keys[0]][keys[1]] = currentFilesUrl;
    } else {
      currentFilesUrl = currentInfo.value[currentTypeKey.value] || '';
      newFiles = await saveFiles(value.files);
      currentFilesUrl = currentFilesUrl ? currentFilesUrl + ',' + newFiles : newFiles;
      currentInfo.value[currentTypeKey.value] = currentFilesUrl;
    }

    await addOrUpdateTask(currentInfo.value);
    await reload();
  }

  const emit = defineEmits(['cancel']);

  function cancel() {
    emit('cancel');
  }

  async function deleteFile(file) {
    // If 'all' is selected, we need to find which property contains the file
    if (currentTypeKey.value === 'all') {
      // Check each file type to find where the file is located
      for (const type of fileTypes) {
        if (type.key !== 'all') {
          let fileValue = '';
          let found = false;

          if (type.key.includes('.')) {
            const keys = type.key.split('.');
            if (currentInfo.value[keys[0]] && currentInfo.value[keys[0]][keys[1]]) {
              fileValue = currentInfo.value[keys[0]][keys[1]];
              if (fileValue.includes(file)) {
                const allFiles = fileValue.split(',');
                currentInfo.value[keys[0]][keys[1]] = allFiles
                  .filter((it) => it !== file)
                  .join(',');
                found = true;
              }
            }
          } else {
            if (currentInfo.value[type.key]) {
              fileValue = currentInfo.value[type.key];
              if (fileValue.includes(file)) {
                const allFiles = fileValue.split(',');
                currentInfo.value[type.key] = allFiles.filter((it) => it !== file).join(',');
                found = true;
              }
            }
          }

          if (found) break; // Stop searching once we've found and updated the file
        }
      }
    } else {
      // Handle specific file type (nested or not)
      let allFiles = [];

      if (currentTypeKey.value.includes('.')) {
        const keys = currentTypeKey.value.split('.');
        if (currentInfo.value[keys[0]] && currentInfo.value[keys[0]][keys[1]]) {
          allFiles = currentInfo.value[keys[0]][keys[1]].split(',');
          currentInfo.value[keys[0]][keys[1]] = allFiles.filter((it) => it !== file).join(',');
        }
      } else {
        if (currentInfo.value[currentTypeKey.value]) {
          allFiles = currentInfo.value[currentTypeKey.value].split(',');
          currentInfo.value[currentTypeKey.value] = allFiles.filter((it) => it !== file).join(',');
        }
      }
    }

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
      <div v-if="selectedFileType !== 'all' && !userTypeIsCustomer()">
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
