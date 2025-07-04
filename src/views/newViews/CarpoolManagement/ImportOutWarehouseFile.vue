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
  import utc from 'dayjs/plugin/utc';
  import { getCustomerList } from '@/api/newDataLayer/Customer/Customer';
  import { addExternalVehicle } from '@/api/newDataLayer/CarManage/ExternalVehicle';
  import { saveFiles } from '@/api/newDataLayer/Notify/Notify';

  dayjs.extend(utc);

  const schemas: FormFields = [
    getFilesUploadFormField('files', false, () => {
      window.open(
        'https://firebasestorage.googleapis.com/v0/b/bolita-task-manage.appspot.com/o/OutMoBan0604.xlsx?alt=media&token=6a2cecb4-fb67-4275-af20-3927fc2b4191'
      );
    }),
  ];

  const emit = defineEmits(['saved', 'closed']);

  async function readFile(file, filesUrl) {
    if (!file) {
      return [];
    }
    const schema = Object.fromEntries(
      getNeededColumnByOutWarehouseCar().map((it) => {
        return [it.title, { prop: it.key }];
      })
    );
    const customerList = await getCustomerList();
    let errorMessage = [];
    try {
      let { rows, errors } = await readXlsxFile(file, { schema });
      rows = rows.slice(1);
      rows.forEach((it) => {
        const currentCustomerId = customerList.find((x) => x.customerName === it.customer);
        if (currentCustomerId) {
          it.customerId = currentCustomerId.id;
        } else {
          errorMessage.push({ message: it.customer + ' 该客户不再系统内！' });
        }
        it.orderDate = it.orderDate
          ? dayjs(it.orderDate).utcOffset(1).valueOf()
          : dayjs().valueOf();
        it.pickupDate = it.pickupDate
          ? dayjs(it.pickupDate).utc().format('YYYY-MM-DD HH:mm:ss')
          : '';
        it.deliveryDate = it.deliveryDate
          ? dayjs(it.deliveryDate).utc().format('YYYY-MM-DD HH:mm:ss')
          : '';
        it.files = filesUrl;
      });
      if (errorMessage.length > 0) {
        return false;
      } else {
        const quest = rows.map(async (it) => {
          await addExternalVehicle(it);
        });
        await Promise.all(quest);
      }
      // await OutWarehouseManager.massiveAdd(rows);
    } catch (e: any) {
      console.log(e?.message);
      errorMessage.push({ message: e?.message });
    }
  }

  async function handleSubmit(values: any) {
    const filesUrl = await saveFiles(values.files);
    await readFile(values.files?.[0].file, filesUrl);
    await safeScope(async () => {
      emit('saved');
    });
  }
</script>

<style lang="less" scoped></style>
