<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <normal-form v-if="!step" class="mt-8" :form-fields="step1Field" @submit="submitStep1" />
      <normal-form
        v-else
        class="mt-8"
        :form-fields="addressFormFields"
        @submit="saveOutboundPlan"
      />
    </loading-frame>
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import {
    deliveryAddressDetail,
    formatItemAddress,
    getTargetAddressSelectionGroup,
  } from '@/api/dataLayer/fieldDefination/addressGroup';
  import {
    asyncCustomerFormField,
    getFilesUploadFormField,
    noteFormField,
  } from '@/api/dataLayer/fieldDefination/common';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { OutBoundPlanManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';
  import { handleRequest } from '@/store/utils/utils';
  import { afterPlanDetailAdded } from '@/api/dataLayer/modules/OutBoundPlan/outAddHook';
  import { sizeFormField } from '@/api/dataLayer/fieldDefination/SizeFormField';
  import { FormFields } from '@/api/dataLayer/common/GeneralModel';
  import { cloneDeep } from 'lodash-es';
  import { DeliveryMethod, truckDeliveryMethod } from '@/api/dataLayer/modules/deliveryMethod';

  const emit = defineEmits(['saved']);

  let loading: boolean = $ref(false);
  let step = $ref(false);

  async function saveOutboundPlan(value) {
    loading = true;

    const res = await OutBoundPlanManager.add(
      Object.assign(detail, value, { onlyDelivery: true }),
      []
    );
    await afterPlanDetailAdded([]);
    await handleRequest(res, () => {
      emit('saved');
    });
    loading = false;
  }

  let detail: any = null;

  function submitStep1(value) {
    detail = value;
    detail.deliveryMethod = DeliveryMethod.Truck;
    formatItemAddress(detail);
    detail.pickUpAddress = detail.deliveryAddress;
    step = true;
  }

  const step1Field: FormFields = [
    asyncCustomerFormField(),
    ...sizeFormField.map((it) => {
      it.required = false;
      return it;
    }),
    { label: '箱数', field: 'containerNum', required: false },
    { label: '托数', field: 'trayNum', required: false },
    { label: 'FBA号', field: 'fbaNo', required: false },
    { label: '邮编', field: 'postCode', group: '取货地址' },
    ...cloneDeep(deliveryAddressDetail).map((it) => {
      it.group = '取货地址';
      return it;
    }),
  ];
  const addressFormFields: FormFields = [
    getFilesUploadFormField('files', false),
    noteFormField,
    ...getTargetAddressSelectionGroup(truckDeliveryMethod),
  ];
</script>

<style lang="less" scoped></style>
