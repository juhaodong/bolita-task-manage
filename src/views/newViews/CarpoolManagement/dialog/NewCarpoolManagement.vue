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
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { schemas } from '../columns';
  import { updateOutboundForecast } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import { CarStatus } from '@/views/newViews/OutboundPlan/columns';
  import dayjs from 'dayjs';
  import { FBACodeManager } from '@/api/dataLayer/modules/user/user';

  interface Props {
    model?: any;
    mergedOutIds?: any[];
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    loading = true;
    values.carStatus = CarStatus.Booked;
    values.createBookCarTimestamp = dayjs().format('YYYY-MM-DD');
    const res = (await FBACodeManager.load()).find((it) => it.code === values.FBACode);
    values.street = res.street;
    values.state = res.state;
    values.country = res.country;
    values.houseNo = res.houseNo;
    values.postcode = res.postcode;
    values.city = res.city ?? '';
    values.appendAddress = res.appendAddress ?? '';
    await safeScope(async () => {
      for (const id of prop.mergedOutIds) {
        await updateOutboundForecast(id, values);
      }
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
