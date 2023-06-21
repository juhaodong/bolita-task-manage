<template>
  <n-card class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset" />
  </n-card>
</template>
<script setup lang="ts">
  import { FormSchema, useForm } from '@/components/Form';
  import { generateOptionFromArray } from '@/utils/utils';
  import { listUser, PermissionEnums } from '@/api/user/baseUser';
  import { Ref, ref, UnwrapRef } from 'vue';
  import { logisticTypes } from '@/api/deliveryMethod/logistic-type';

  let warehouseList: Ref<UnwrapRef<Array<any>>> = ref([]);
  const schemas: FormSchema[] = [
    {
      field: 'boxCount',
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
      field: 'logisticModel',
      component: 'NSelect',
      label: '物流类型',
      componentProps: {
        placeholder: '请选择物流类型',
        options: generateOptionFromArray(logisticTypes),
      },
      rules: [{ required: true, message: '请选择物流类型', trigger: ['blur'] }],
    },
    {
      field: 'warehouseId',
      component: 'NSelect',
      label: '操作仓库',
      componentProps: {
        placeholder: '请选择操作仓库',
        options: warehouseList,
      },
      rules: [{ required: true, message: '请选择到货仓库', trigger: ['blur'] }],
    },
    {
      field: 'note',
      component: 'NInput',
      label: '备注',
      componentProps: {
        placeholder: '一些需要我们注意的事情',
      },
      rules: [{ required: false, trigger: ['blur'] }],
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
