<script lang="ts" setup>
  import { computed, onMounted } from 'vue';
  import { $ref } from 'vue/macros';
  import { generateOptionFromArray } from '@/store/utils/utils';
  import { reservationTimeList } from '@/views/newViews/ContainerForecast/columns';
  import dayjs from 'dayjs';
  import { addOrUpdateWithRefOutboundForecast } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';
  import { updateTaskListAfterBookingCar } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';

  interface Props {
    info?: any;
  }
  const logisticsCompanyList = $ref([
    { label: 'DHL Freight', value: 'DHL Freight' },
    { label: 'AF', value: 'AF' },
    { label: '第三方', value: '第三方' },
  ]);
  let logisticsCompany = $ref('');
  let ISA = $ref('');
  let waybillId = $ref('');
  let reservationGetProductTime = $ref(null);
  let reservationGetProductDetailTime = $ref('');
  let AMZID = $ref('');
  let note = $ref('');
  // const emit = defineEmits(['saved']);
  const prop = defineProps<Props>();
  onMounted(async () => {
    console.log(prop.info, 'info');
    logisticsCompany = prop.info.logisticsCompany ?? 'DHL Freight';
    ISA = prop.info.ISA ?? '';
    waybillId = prop.info.waybillId ?? '';
    reservationGetProductTime = prop.info.reservationGetProductTime
      ? parseFloat(prop.info.reservationGetProductTime)
      : new Date();
    reservationGetProductDetailTime = prop.info.reservationGetProductDetailTime ?? '';
    AMZID = prop.info.AMZID ?? '';
    note = prop.info.note ?? '';
  });
  const emit = defineEmits(['saved']);
  const currentNeedInfo = computed(() => {
    if (logisticsCompany === 'DHL Freight') {
      return { label: 'AX4 Nr.', value: '' };
    } else if (logisticsCompany === 'AF') {
      return { label: 'AMZ-Sendungs ID', value: '' };
    } else {
      return { label: '车队', value: '' };
    }
  });
  const isaRequired = computed(() => {
    return logisticsCompany === 'AF';
  });
  let requiredInfo = $ref(false);
  let errorMessage = $ref('');
  async function saveInfo() {
    requiredInfo = false;
    if (isaRequired.value && !ISA) {
      requiredInfo = true;
      errorMessage = '请完整填完必填项！';
      return;
    }
    if (
      !logisticsCompany ||
      !reservationGetProductTime ||
      !reservationGetProductDetailTime ||
      !AMZID
    ) {
      requiredInfo = true;
      errorMessage = '请完整填完必填项！';
      return;
    }
    let outboundForecastInfo = prop.info;
    await updateTaskListAfterBookingCar(outboundForecastInfo.id);
    outboundForecastInfo.AMZID = AMZID;
    outboundForecastInfo.ISA = ISA;
    outboundForecastInfo.bookCarTimestamp = dayjs().valueOf();
    outboundForecastInfo.inStatus = '已订车';
    outboundForecastInfo.carStatus = '已订车';
    outboundForecastInfo.note = note;
    outboundForecastInfo.reservationGetProductDetailTime = reservationGetProductDetailTime;
    outboundForecastInfo.reservationGetProductTime = reservationGetProductTime;
    outboundForecastInfo.waitCar = '1';
    outboundForecastInfo.waybillId = waybillId;
    outboundForecastInfo.logisticsCompany = logisticsCompany;
    await addOrUpdateWithRefOutboundForecast(outboundForecastInfo);
    emit('saved');
  }
</script>

<template>
  <div class="mt-8">
    <n-descriptions :columns="1" bordered label-placement="left">
      <n-descriptions-item :span="2" label="物流公司 (必填)">
        <n-select
          v-model:value="logisticsCompany"
          :options="logisticsCompanyList"
          :status="requiredInfo ? 'error' : ''"
        />
      </n-descriptions-item>
      <n-descriptions-item :label="currentNeedInfo.label + ' (必填)'" :span="2">
        <n-input v-model:value="AMZID" :status="requiredInfo ? 'error' : ''" />
      </n-descriptions-item>
      <n-descriptions-item :label="isaRequired ? 'ISA (必填)' : 'ISA'" :span="2">
        <n-input v-model:value="ISA" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="运单号">
        <n-input v-model:value="waybillId" />
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
        <n-input v-model:value="note" />
      </n-descriptions-item>
    </n-descriptions>
    <n-button style="margin-top: 10px" type="info" @click="saveInfo">确认</n-button>
    <span v-if="requiredInfo" style="color: red">{{ errorMessage }}</span>
  </div>
</template>

<style lang="less" scoped></style>
