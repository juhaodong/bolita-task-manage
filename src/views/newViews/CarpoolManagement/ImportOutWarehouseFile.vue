<template>
  <n-card className="proCard">
    <normal-form :form-fields="schemas" @submit="handleSubmit" />
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { getFilesUploadFormField } from '@/api/dataLayer/fieldDefination/common';
  import { FormFields, safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { getNeededColumnByOutWarehouseCar } from '@/api/dataLayer/modules/notify/NotifyRepository';
  import readXlsxFile from 'read-excel-file';
  import dayjs from 'dayjs';
  import { OutWarehouseManager } from '@/api/dataLayer/modules/OutWarehouseCar/OutWarehouseModel';

  const schemas: FormFields = [
    getFilesUploadFormField('files', false, () => {
      window.open(
        'https://firebasestorage.googlea' +
          'pis.com/v0/b/bolita-task-manage.appspot.' +
          'com/o/%E8%B4%A7%E6%9F%9C%E6%A8%A1%E6%9D%BF' +
          '.xlsx?alt=media&token=a5cfed10-917c-41dd-806d-5d9addd5156d'
      );
    }),
  ];

  const emit = defineEmits(['saved', 'closed']);

  async function readFile(file) {
    if (!file) {
      return [];
    }
    const schema = Object.fromEntries(
      getNeededColumnByOutWarehouseCar().map((it) => {
        return [it.title, { prop: it.key }];
      })
    );
    console.log(schema, 'schema');
    try {
      let { rows, errors } = await readXlsxFile(file, { schema });
      rows = rows.slice(1);
      rows.forEach((it) => {
        it.status = '待下单';
        it.date = dayjs(it.date).format('YYYY-MM-DD HH:mm:ss');
        it.pickingDate = dayjs(it.pickingDate).format('YYYY-MM-DD HH:mm:ss');
        it.sendingDate = dayjs(it.sendingDate).format('YYYY-MM-DD HH:mm:ss');
      });
      await OutWarehouseManager.massiveAdd(rows);
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
