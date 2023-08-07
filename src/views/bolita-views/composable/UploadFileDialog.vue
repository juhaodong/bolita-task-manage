<script setup lang="ts">
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';

  import { getFilesUploadFormField } from '@/api/dataLayer/fieldDefination/common';
  import { useUploadDialog } from '@/store/modules/uploadFileState';
  import AppendFileListDisplay from '@/views/bolita-views/composable/AppendFileListDisplay.vue';

  const checkDialog = useUploadDialog();
  const field = [getFilesUploadFormField('files', false)];
</script>

<template>
  <n-modal :show="checkDialog.show" @close="checkDialog.close()">
    <n-card :title="checkDialog.title" style="max-width: 700px">
      <append-file-list-display :files-url="checkDialog.currentFileUrls" />
      <normal-form
        :form-fields="field"
        @cancel="checkDialog.cancel"
        @submit="checkDialog.confirm"
        :show-buttons="false"
      >
        <template #extraSubmitButton="{ submit }">
          <n-button @click="submit" type="success">上传</n-button>
        </template>
        <template #extraCancelButton="{ cancel }">
          <n-button @click="cancel" type="error">取消</n-button>
        </template>
      </normal-form>
    </n-card>
  </n-modal>
</template>

<style scoped lang="less"></style>
