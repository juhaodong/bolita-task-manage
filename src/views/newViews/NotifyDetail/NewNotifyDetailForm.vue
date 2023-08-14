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
  import {
    formatItemAddress,
    getTargetAddressSelectionGroup,
  } from '@/api/dataLayer/fieldDefination/addressGroup';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
  import { handleRequest } from '@/store/utils/utils';
  import { formFieldBuilder, noteFormField } from '@/api/dataLayer/fieldDefination/common';
  import { NotifyType } from '@/api/dataLayer/modules/notify/notify-api';
  import { boxDeliveryMethodField } from '@/api/dataLayer/modules/deliveryMethod';

  interface Props {
    model: any;
  }

  const props = defineProps<Props>();
  let loading: boolean = $ref(false);
  const builder = formFieldBuilder();
  builder.addAll([
    {
      field: 'containerId',
      label: '箱号',
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
      field: 'waybillId',
      label: '运单号',
      required: false,
    },
  ]);
  if (props.model.notifyType === NotifyType.Container) {
    builder.addAll([
      {
        field: 'FBA号',
        label: 'FBANo',
        required: false,
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
    ]);
    builder.setGroup('地址信息');
    builder.addAll(getTargetAddressSelectionGroup());
  } else {
    builder.addAll([boxDeliveryMethodField, noteFormField]);
  }

  const schemas: FormField[] = builder.build();

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    loading = true;
    formatItemAddress(values);
    const res = await NotifyDetailManager.edit(values, props.model.id);
    await handleRequest(res, () => {
      emit('saved');
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
