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
  import { carSchemas } from '../columns';
  import dayjs from 'dayjs';
  import { CarStatus } from '@/views/newViews/OutboundPlan/columns';
  import { computed, onMounted } from 'vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import {
    updateTaskListAfterBookingCar,
    updateTaskListAfterOfferPriceCar,
  } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import {
    addOrUpdateOutboundForecast,
    getOutboundForecastById,
  } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';

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

  const defaultRef = computed(() => {
    if (prop.mergedOutIds?.length === 1) {
      return prop.mergedOutIds[0];
    } else {
      return '';
    }
  });

  const realSchemas = computed(() => {
    return prop.typeName === 'offer' ? offerSchemas : carSchemas;
  });

  const offerSchemas: FormField[] = [
    {
      field: 'REF',
      label: 'REF.',
      defaultValue: defaultRef,
    },
    {
      field: 'suggestedPrice',
      label: '建议报价',
    },
    {
      field: 'costPrice',
      label: '成本价',
    },
    {
      field: 'externalPrice',
      label: '对外报价',
      disableCondition() {
        return true;
      },
    },
  ].map((it) => {
    it.required = false;
    return it;
  });

  async function handleSubmit(values: any) {
    loading = true;
    if (prop.typeName === 'car') {
      values.inStatus = '已定车';
      values.carStatus = CarStatus.Booked;
      values.inStatus = CarStatus.Booked;
      values.waitCar = '1';
      values.bookCarTimestamp = dayjs().valueOf();
    } else {
      values.inStatus = '已报价';
      values.waitPrice = '1';
    }
    await safeScope(async () => {
      for (const id of prop.mergedOutIds) {
        const outboundForecastInfo = await getOutboundForecastById(id);
        if (prop.typeName === 'car') {
          outboundForecastInfo.AMZID = values.AMZID;
          outboundForecastInfo.ISA = values.ISA;
          outboundForecastInfo.bookCarTimestamp = values.bookCarTimestamp;
          outboundForecastInfo.inStatus = values.inStatus;
          outboundForecastInfo.carStatus = values.carStatus;
          outboundForecastInfo.note = values.note;
          outboundForecastInfo.reservationGetProductDetailTime =
            values.reservationGetProductDetailTime;
          outboundForecastInfo.reservationGetProductTime = values.reservationGetProductTime;
          outboundForecastInfo.waitCar = '1';
          outboundForecastInfo.waybillId = values.waybillId;
          await updateTaskListAfterBookingCar(id);
        } else {
          outboundForecastInfo.REF = values.REF;
          outboundForecastInfo.costPrice = values.costPrice;
          outboundForecastInfo.inStatus = values.inStatus;
          outboundForecastInfo.suggestedPrice = values.suggestedPrice;
          outboundForecastInfo.waitPrice = '1';
          await updateTaskListAfterOfferPriceCar(id, values);
        }
        await addOrUpdateOutboundForecast(outboundForecastInfo);
      }
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
