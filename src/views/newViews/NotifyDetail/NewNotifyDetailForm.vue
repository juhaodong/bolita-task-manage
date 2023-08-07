<template>
  <loading-frame :loading="loading">
    <n-card class="proCard">
      <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
    </n-card>
  </loading-frame>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { sizeFormField } from '@/api/dataLayer/fieldDefination/SizeFormField';
  import { getTargetAddressSelectionGroup } from '@/api/dataLayer/fieldDefination/addressGroup';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
  import { handleRequest } from '@/store/utils/utils';

  interface Props {
    model: any;
  }

  const props = defineProps<Props>();
  let loading: boolean = $ref(false);

  const schemas: FormField[] = [
    {
      field: 'containerId',
      label: '箱号',
      required: false,
    },
    {
      field: 'productSKU',
      label: '产品SKU',
      required: false,
    },
    {
      field: 'trayNum',
      label: '托数',
      required: false,
    },
    {
      field: 'containerNum',
      label: '箱数',
      required: false,
    },
    ...sizeFormField.map((it) => {
      it.required = false;
      return it;
    }),
    {
      field: 'weightKg',
      label: '重量kg',
      required: false,
    },
    {
      field: 'volume',
      label: '体积',
      required: false,
    },
    {
      field: 'waybillId',
      label: '运单号',
      required: false,
    },
    {
      field: 'FBA号',
      label: 'FBANo',
    },
    {
      field: 'productName',
      label: '货物名称',
      required: false,
    },
    {
      field: 'package',
      label: '包装',
      required: false,
    },
    {
      field: 'operationRequirement',
      label: '操作要求',
      required: false,
      componentProps: {
        type: 'textarea',
      },
    },
    ...getTargetAddressSelectionGroup(),
  ];

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    loading = true;
    const res = await NotifyDetailManager.edit(values, props.model.id);
    await handleRequest(res, () => {
      emit('saved');
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
