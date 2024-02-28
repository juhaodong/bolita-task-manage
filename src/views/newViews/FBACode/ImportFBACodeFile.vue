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
  import { FBACodeManager } from '@/api/dataLayer/modules/user/user';
  import { collection, deleteDoc, getDocs } from 'firebase/firestore';
  import { db } from '@/store/plugins/firebase';

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
      getNeededColumnByFBACode().map((it) => {
        return [it.title, { prop: it.key }];
      })
    );
    try {
      let { rows, errors } = await readXlsxFile(file, { schema });
      console.log(rows, 'rows');
      await FBACodeManager.massiveAdd(rows);
    } catch (e: any) {
      console.log(e?.message);
    }
    return [];
  }

  async function handleSubmit(values: any) {
    const ref = collection(db, 'FBACode');
    const docs = await getDocs(ref);
    await Promise.all(docs.docs.map((doc) => deleteDoc(doc.ref)));
    await readFile(values.files?.[0].file);
    await safeScope(async () => {
      emit('saved');
    });
  }
</script>

<style lang="less" scoped></style>
