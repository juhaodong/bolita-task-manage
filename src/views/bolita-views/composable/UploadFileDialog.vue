<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';

  import { getFilesUploadFormField } from '@/api/dataLayer/fieldDefination/common';
  import { useUploadDialog } from '@/store/modules/uploadFileState';
  import AppendFileListDisplay from '@/views/bolita-views/composable/AppendFileListDisplay.vue';

  const checkDialog = useUploadDialog();
  const field = [getFilesUploadFormField('files', false)];
  function deleteFiles(files) {
    console.log(files, 'files123');
    checkDialog.deleteFile(files);
  }
  console.log(checkDialog.disableClick, 'disable');
</script>

<template>
  <n-modal :show="checkDialog.show" @close="checkDialog.close()">
    <n-card :title="checkDialog.title" style="max-width: 700px">
      <append-file-list-display
        :disable-click="checkDialog.disableClick"
        :files-url="checkDialog.currentFileUrls"
        @delete-file="deleteFiles"
      />
      <n-divider class="my-8" />
      <normal-form
        :form-fields="field"
        :show-buttons="false"
        :show-group-header="false"
        class="mt-4"
        @cancel="checkDialog.cancel"
        @submit="checkDialog.confirm"
      >
        <template #extraSubmitButton="{ submit }">
          <n-button type="success" @click="submit">上传</n-button>
        </template>
        <template #extraCancelButton="{ cancel }">
          <n-button type="error" @click="cancel">关闭</n-button>
        </template>
      </normal-form>
    </n-card>
  </n-modal>
</template>

<style lang="less" scoped></style>
