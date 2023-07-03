<template>
  <n-card class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset" />
  </n-card>
</template>
<script setup lang="ts">
  import { FormSchema, useForm } from '@/components/Form';
  import { generateOptionFromArray } from '@/utils/utils';
  import { notifyType } from '@/api/notify/notify-api';
  import { listUser, PermissionEnums } from '@/api/user/baseUser';
  import { ref } from 'vue';

  let warehouseList = ref([]);
  const schemas: FormSchema[] = [
    {
      field: 'totalCount',
      labelMessage: '请在此填入本次预计到达的总箱数，如果是货柜，请填写货柜内的总箱数',
      component: 'NInputNumber',
      label: '箱数',
      componentProps: {
        type: 'number',
        step: 1,
        precision: 0,
        placeholder: '请输入箱数',
      },
      rules: [{ required: true, message: '请输入箱数', trigger: ['blur'], type: 'number' }],
    },
    {
      field: 'arriveMedia',
      component: 'NSelect',
      label: '入库类型',
      componentProps: {
        placeholder: '请选择入库类型',
        options: generateOptionFromArray(notifyType),
        onUpdateValue: (e: any) => {
          console.log(e);
        },
      },
      rules: [{ required: true, message: '请选择入库类型', trigger: ['blur'] }],
    },
    {
      field: 'arriveWarehouseId',
      component: 'NSelect',
      label: '到货仓库',
      componentProps: {
        placeholder: '请选择到货仓库',
        options: warehouseList,
      },
      rules: [{ required: true, message: '请选择到货仓库', trigger: ['blur'] }],
    },
  ];

  const [register, {}] = useForm({
    gridProps: { cols: 1 },
    labelWidth: 80,
    layout: 'vertical',
    submitButtonText: '下一步',
    schemas,
  });
  const emit = defineEmits(['submit']);

  function handleSubmit(values: Recordable) {
    emit('submit', values);
    console.log(values);
  }

  function handleReset(value: Recordable) {
    console.log(value);
  }

  async function init() {
    warehouseList.value = (await listUser(PermissionEnums.Operator)).result.map((it) => ({
      label: it.realName,
      value: it.id,
    }));
  }
  init();
</script>

<style scoped lang="less"></style>
