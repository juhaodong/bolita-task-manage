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
  import { FormFields, safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { InventoryManager } from '@/api/dataLayer/modules/user/user';

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();
  const schemas: FormFields = [
    {
      label: '仓库ID',
      field: 'id',
      disableCondition: () => {
        return prop.model?.id;
      },
    },
    {
      label: '公司名称',
      field: 'companyName',
    },
    {
      label: '国家',
      field: 'country',
      required: false,
    },
    {
      label: '地址',
      field: 'address',
      required: false,
    },
    {
      label: '面积',
      field: 'area',
      required: false,
    },
    {
      label: '结算方式',
      field: 'settlementMethod',
      required: false,
    },
    {
      label: '使用系统',
      field: 'useSystem',
      required: false,
    },
    {
      label: '快递账号',
      field: 'courierAccount',
      required: false,
    },
    {
      label: '备注',
      field: 'note',
      required: false,
    },
  ];

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    loading = true;
    await safeScope(async () => {
      if (prop?.model?.id) {
        await InventoryManager.editInternal(values, prop.model.id);
      } else {
        await InventoryManager.addInternal(values);
      }
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
