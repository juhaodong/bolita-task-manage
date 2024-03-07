<template>
  <div class="mt-8">
    <n-descriptions :columns="3" bordered label-placement="left">
      <n-descriptions-item :span="2" label="出库方式">
        <n-select
          v-model:value="newDeliveryDetail"
          :options="generateOptionFromArray(allDeliveryMethod)"
        />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="REF">
        <n-input v-model:value="newRef" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="ISA">
        <n-input v-model:value="newISA" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="AMZ-Sendungs ID">
        <n-input v-model:value="newAMZ" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="运单号">
        <n-input v-model:value="newWaybillId" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="FC/送货地址">
        <n-select v-model:value="newFBACode" :options="options" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="订车价格">
        <n-input v-model:value="newOrderCarPrice" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="预约取货日期">
        <n-date-picker v-model:value="newReservationGetProductTime" type="date" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="取货时间">
        <n-input v-model:value="newReservationGetProductDetailTime" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="备注">
        <n-input v-model:value="newNote" />
      </n-descriptions-item>
    </n-descriptions>
    <n-space class="mt-4" style="float: right">
      <n-button secondary type="warning" @click="handleSubmit">保存</n-button>
    </n-space>
  </div>
</template>
<script lang="ts" setup>
  import {
    getOutboundForecast,
    updateOutboundForecast,
  } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import { CarStatus } from '@/views/newViews/OutboundPlan/columns';
  import dayjs from 'dayjs';
  import { FBACodeManager } from '@/api/dataLayer/modules/user/user';
  import { onMounted } from 'vue';
  import { $ref } from 'vue/macros';
  import { generateOptionFromArray } from '@/store/utils/utils';
  import { allDeliveryMethod } from '@/api/dataLayer/common/DeliveryMethod';
  import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { getFBACodeList } from '@/api/dataLayer/fieldDefination/common';

  interface Props {
    id?: any[];
  }

  let loading: boolean = $ref(false);
  let currentInfo = $ref([]);
  let newRef = $ref('');
  let newISA = $ref('');
  let newAMZ = $ref('');
  let newWaybillId = $ref('');
  let newFBACode = $ref('');
  let newOrderCarPrice = $ref('');
  let newReservationGetProductTime = $ref(null);
  let newReservationGetProductDetailTime = $ref(null);
  let newDeliveryDetail = $ref('');
  let newNote = $ref('');
  let options = $ref([]);

  const prop = defineProps<Props>();

  onMounted(async () => {
    options = generateOptionFromArray(await getFBACodeList());
    currentInfo = (await getOutboundForecast()).find((it) => it.id === prop.id);
    newDeliveryDetail = currentInfo.deliveryDetail;
    newRef = currentInfo?.REF;
    newISA = currentInfo?.ISA;
    newAMZ = currentInfo?.AMZID;
    newWaybillId = currentInfo?.waybillId;
    newFBACode = currentInfo?.FBACode;
    newOrderCarPrice = currentInfo?.orderCarPrice;
    newReservationGetProductTime = dayjs(currentInfo?.reservationGetProductTime).valueOf();
    newReservationGetProductDetailTime = currentInfo?.reservationGetProductDetailTime;
    newNote = currentInfo?.note;
  });

  const emit = defineEmits(['saved']);

  async function handleSubmit() {
    loading = true;
    const FBAList = (await FBACodeManager.load()).find((it) => it.code === newFBACode);
    const childrenInfo = currentInfo?.outboundDetailInfo;
    for (const item of childrenInfo) {
      item.operation = newDeliveryDetail;
      await NotifyDetailManager.editInternal(item, item.id);
    }
    const res = {
      REF: newRef,
      ISA: newISA,
      AMZID: newAMZ,
      waybillId: newWaybillId,
      FBACode: newFBACode,
      orderCarPrice: newOrderCarPrice,
      reservationGetProductTime: newReservationGetProductTime,
      reservationGetProductDetailTime: newReservationGetProductDetailTime,
      deliveryDetail: newDeliveryDetail,
      note: newNote,
      outboundDetailInfo: childrenInfo,
      carStatus: CarStatus.Booked,
      createBookCarTimestamp: dayjs().format('YYYY-MM-DD'),
      street: FBAList.street,
      state: FBAList.state,
      country: FBAList.country,
      houseNo: FBAList.houseNo,
      postcode: FBAList.postcode,
      city: FBAList.city ?? '',
      appendAddress: FBAList.appendAddress ?? '',
    };
    for (const item of currentInfo?.outboundDetailInfo) {
      item.operation = newDeliveryDetail;
      await NotifyDetailManager.editInternal(item, item.id);
    }
    await safeScope(async () => {
      await updateOutboundForecast(prop.id, res);
      emit('saved', res);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
