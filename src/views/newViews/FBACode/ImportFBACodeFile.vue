<template>
  <n-card className="proCard">
    <normal-form :form-fields="schemas" @submit="handleSubmit" />
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { getFilesUploadFormField } from '@/api/dataLayer/fieldDefination/common';
  import { FormFields, safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { getNeededColumnByFBACode } from '@/api/dataLayer/modules/notify/NotifyRepository';
  import readXlsxFile from 'read-excel-file';
  import { addOrUpdateFBACode, deleteFbaCodeAll } from '@/api/newDataLayer/FBACode/FBACode';

  const schemas: FormFields = [
    getFilesUploadFormField('files', false, () => {
      window.open('https://aaden-storage.s3.eu-central-1.amazonaws.com/FbaCode.xlsx');
    }),
  ];

  const emit = defineEmits(['saved', 'closed']);

  async function readFile(file) {
    if (!file) {
      return [];
    }
    const schema = Object.fromEntries(
      getNeededColumnByFBACode().map((it) => {
        return [it.title, { prop: it.key }];
      })
    );
    try {
      let { rows, errors } = await readXlsxFile(file, { schema });
      await deleteFbaCodeAll();
      let request = [];
      for (const row of rows) {
        request.push(addOrUpdateFBACode(row));
      }
      await Promise.all(request);
    } catch (e: any) {
      console.log(e?.message);
    }
    return [];
  }

  async function handleSubmit(values: any) {
    await readFile(values.files?.[0].file);
    await safeScope(async () => {
      emit('saved');
    });
  }
</script>

<style lang="less" scoped></style>
