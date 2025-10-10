<script lang="ts" setup>
  import { computed, onMounted } from 'vue';
  import { $ref } from 'vue/macros';
  import { generateOptionFromArray } from '@/store/utils/utils';
  import { reservationTimeList } from '@/views/newViews/ContainerForecast/columns';
  import dayjs from 'dayjs';
  import { addOrUpdateWithRefOutboundForecast } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';
  import { updateTaskListAfterEditBookingCarWithInfo } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';

  interface Props {
    info?: any;
  }
  const logisticsCompanyList = $ref([
    { label: 'DHL Packet', value: 'DHL Packet' },
    { label: 'DPD', value: 'DPD' },
    { label: 'UPS', value: 'UPS' },
    { label: 'DHL Freight', value: 'DHL Freight' },
    { label: 'GEL', value: 'GEL' },
    { label: 'Fedex', value: 'Fedex' },
    { label: 'Slam', value: 'Slam' },
    { label: 'Amzon Freight', value: 'Amzon Freight' },
    { label: 'Palirox', value: 'Palirox' },
    { label: 'Conwest', value: 'Conwest' },
    { label: 'Bolita', value: 'Bolita' },
    { label: 'FinsterWalder', value: 'FinsterWalder' },
    { label: 'Courierfeld', value: 'Courierfeld' },
  ]);
  let logisticsCompany = $ref('');
  let isa = $ref('');
  let waybillId = $ref('');
  let suggestedPrice = $ref('');
  let reservationGetProductTime = $ref(null);
  let reservationGetProductDetailTime = $ref('');
  let note = $ref('');
  let loading = $ref(false);
  let costPrice = $ref('');
  // const emit = defineEmits(['saved']);
  const prop = defineProps<Props>();
  onMounted(async () => {
    console.log(prop.info, 'info');
    logisticsCompany = prop.info.logisticsCompany ?? 'DHL Freight';
    isa = prop.info.isa ?? '';
    waybillId = prop.info.waybillId ?? '';
    suggestedPrice = prop.info.suggestedPrice ?? '';
    costPrice = prop.info.costPrice ?? '';
    reservationGetProductTime = prop.info.reservationGetProductTime
      ? dayjs(prop.info.reservationGetProductTime).valueOf()
      : new Date();
    reservationGetProductDetailTime = prop.info.reservationGetProductDetailTime ?? '';
    note = prop.info.note ?? '';
  });
  const emit = defineEmits(['saved']);
  const isaRequired = computed(() => {
    return logisticsCompany === 'AF';
  });
  let requiredInfo = $ref(false);
  let errorMessage = $ref('');
  async function saveInfo() {
    requiredInfo = false;
    if (isaRequired.value && !isa) {
      requiredInfo = true;
      errorMessage = '请完整填完必填项！';
      return;
    }
    if (!logisticsCompany || !reservationGetProductTime || !reservationGetProductDetailTime) {
      requiredInfo = true;
      errorMessage = '请完整填完必填项！';
      return;
    }
    let outboundForecastInfo = prop.info;
    loading = true;
    outboundForecastInfo.isa = isa;
    outboundForecastInfo.note = note;
    outboundForecastInfo.reservationGetProductDetailTime = reservationGetProductDetailTime;
    outboundForecastInfo.reservationGetProductTime =
      dayjs(reservationGetProductTime).format('YYYY-MM-DDTHH:mm:ss');
    outboundForecastInfo.waitCar = '1';
    outboundForecastInfo.waybillId = waybillId;
    outboundForecastInfo.suggestedPrice = suggestedPrice;
    outboundForecastInfo.logisticsCompany = logisticsCompany;
    outboundForecastInfo.costPrice = costPrice;
    await updateTaskListAfterEditBookingCarWithInfo(outboundForecastInfo.id, outboundForecastInfo);
    await addOrUpdateWithRefOutboundForecast(outboundForecastInfo);
    loading = false;
    emit('saved');
  }
</script>

<template>
  <loading-frame :loading="loading">
    <div class="mt-8">
      <n-descriptions :columns="1" bordered label-placement="left">
        <n-descriptions-item :span="2" label="物流公司 (必填)">
          <n-select
            v-model:value="logisticsCompany"
            :options="logisticsCompanyList"
            :status="requiredInfo ? 'error' : ''"
          />
        </n-descriptions-item>
        <n-descriptions-item :label="isaRequired ? 'isa (必填)' : 'isa'" :span="2">
          <n-input v-model:value="isa" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="运单号">
          <n-input v-model:value="waybillId" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="整车报价">
          <n-input v-model:value="suggestedPrice" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="底价">
          <n-input v-model:value="costPrice" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="预计取货日期 (必填)">
          <n-date-picker
            v-model:value="reservationGetProductTime"
            :status="requiredInfo ? 'error' : ''"
          />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="预计取货时间 (必填)">
          <n-select
            v-model:value="reservationGetProductDetailTime"
            :options="generateOptionFromArray(reservationTimeList)"
            :status="requiredInfo ? 'error' : ''"
          />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="备注">
          <n-input type="textarea" v-model:value="note" />
        </n-descriptions-item>
      </n-descriptions>
      <n-button style="margin-top: 10px" type="info" @click="saveInfo">确认</n-button>
      <span v-if="requiredInfo" style="color: red">{{ errorMessage }}</span>
    </div>
  </loading-frame>
</template>

<style lang="less" scoped></style>
