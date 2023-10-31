<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
    </loading-frame>
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { FormFields } from '@/api/dataLayer/common/GeneralModel';
  import {
    asyncInventoryFormField,
    customerStatusSelection,
  } from '@/api/dataLayer/modules/user/user';

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();
  const schemas: FormFields = [
    {
      label: '客户名称',
      field: 'customerName',
    },
    {
      label: '业务关联方',
      field: 'businessParty',
      required: false,
    },
    asyncInventoryFormField({
      label: '所属仓库',
      field: 'warehouseId',
    }),
    {
      label: '使用系统',
      field: 'useSystem',
      required: false,
    },
    {
      label: '快速账号绑定',
      field: 'quickBindAccount',
      required: false,
    },
    customerStatusSelection,
    {
      label: '备注',
      field: 'note',
      required: false,
    },
  ];

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    loading = true;
    // console.log(values);
    await safeScope(async () => {
      if (prop?.model?.id) {
        await CustomerManager.editInternal(values, prop.model.id);
      } else {
        await CustomerManager.addInternal(values);
      }
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
