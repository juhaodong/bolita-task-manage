<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <normal-form :default-value-model="model" :form-fields="realSchemas" @submit="handleSubmit" />
    </loading-frame>
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { carSchemas, offerSchemas } from '../columns';
  import {
    updateOutboundForecast,
    updateTaskListAfterBookingCar,
    updateTaskListAfterOfferPriceCar,
  } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import dayjs from 'dayjs';
  import { CarStatus } from '@/views/newViews/OutboundPlan/columns';
  import { computed, onMounted } from 'vue';

  interface Props {
    model?: any;
    mergedOutIds?: any[];
    typeName?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();

  const emit = defineEmits(['saved']);

  onMounted(async () => {
    console.log(prop.model, 'model');
  });

  const realSchemas = computed(() => {
    return prop.typeName === 'offer' ? offerSchemas : carSchemas;
  });

  async function handleSubmit(values: any) {
    loading = true;
    if (prop.typeName === 'car') {
      values.carStatus = CarStatus.Booked;
      values.inStatus = CarStatus.Booked;
      values.waitCar = 1;
    } else {
      values.waitPrice = 1;
    }
    values.createBookCarTimestamp = dayjs().format('YYYY-MM-DD');
    await safeScope(async () => {
      for (const id of prop.mergedOutIds) {
        if (prop.typeName === 'car') {
          await updateOutboundForecast(id, values);
          await updateTaskListAfterBookingCar(id);
        } else {
          await updateOutboundForecast(id, values);
          await updateTaskListAfterOfferPriceCar(id, values);
        }
      }
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
