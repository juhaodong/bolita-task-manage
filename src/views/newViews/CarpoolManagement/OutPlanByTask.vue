<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <n-data-table
        :columns="displayColumns"
        :data="model"
        class="my-4"
        max-height="450"
        virtual-scroll
      />
      <n-alert v-if="hasDifferentDeliveryMethods" type="warning" class="mb-2">
        物流方式不同无法订车！
      </n-alert>
      <span>是否需要定车</span>
      <n-select
        v-model:value="needCar"
        :options="[
          { value: '1', label: '是' },
          { value: '0', label: '否' },
        ]"
        placeholder="是否需要定车"
      />
      <template v-if="needCar === '1'">
        <div class="mt-2">
          <n-descriptions :columns="4" bordered label-placement="left">
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
            <n-descriptions-item :span="2" label="PO">
              <n-input v-model:value="po" />
            </n-descriptions-item>
            <n-descriptions-item :span="2" label="整车报价">
              <n-input v-model:value="suggestedPrice" />
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
          <span v-if="requiredInfo" style="color: red">{{ errorMessage }}</span>
        </div>
      </template>
      <n-space v-if="model.length > 0" align="center" class="mt-4" justify="space-between">
        <div>总数量: {{ totalNumber }}件 {{ totalTray }}托</div>
        <div :style="{ color: parseFloat(totalWeight) > 20000 ? 'red' : '' }"
          >总重量: {{ totalWeight }}</div
        >
        <div :style="{ color: parseFloat(totalVolume) > 70 ? 'red' : '' }"
          >总体积: {{ totalVolume }}</div
        >
        <div :style="{ color: parseFloat(totalVolume) > 70 ? 'red' : '' }"
          >总价格: {{ suggestedPrice }}</div
        >
      </n-space>
      <n-button
        :disabled="hasDifferentDeliveryMethods"
        :loading="btnLoading"
        type="primary"
        @click="handleSubmit"
      >
        保存
      </n-button>
    </loading-frame>
  </n-card>
</template>
<script lang="ts" setup>
  import { computed, watch } from 'vue';
  import { DataTableColumns } from 'naive-ui';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { generateOptionFromArray, safeSumBy } from '@/store/utils/utils';
  import { $ref } from 'vue/macros';
  import {
    addOrUpdateWithRefOutboundForecast,
    defaultOutboundList,
    getOutboundRef,
  } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';
  import { reservationTimeList } from '@/views/newViews/ContainerForecast/columns';
  import { allDeliveryList } from '@/api/dataLayer/common/AllKeys';
  import dayjs from 'dayjs';
  import { updateTaskListAfterBookingCarWithInfo } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';

  interface Props {
    model?: any;
    initialKey?: any[];
  }

  const prop = defineProps<Props>();
  let loading: boolean = $ref(false);
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
  let reservationGetProductTime = $ref(null);
  let reservationGetProductDetailTime = $ref('');
  let note = $ref('');
  let po = $ref('');
  let requiredInfo = $ref(false);
  let isaRequired = $ref(false);
  let errorMessage = $ref('请填写必填项');

  const totalNumber = computed(() => {
    return safeSumBy(prop.model, 'arrivedContainerNum');
  });

  const totalTray = computed(() => {
    return safeSumBy(prop.model, 'arrivedTrayNum');
  });

  const totalVolume = computed(() => {
    return safeSumBy(prop.model, 'volume');
  });

  const totalWeight = computed(() => {
    return safeSumBy(prop.model, 'weight');
  });

  const suggestedPrice = computed(() => {
    const allPriceList = prop.model.map((it) => it.suggestedPrice);
    if (allPriceList.includes('人工询价')) {
      return '人工询价';
    } else {
      return safeSumBy(prop.model, 'suggestedPrice');
    }
  });

  const hasDifferentDeliveryMethods = computed(() => {
    if (!prop.model || prop.model.length <= 1) return false;
    const firstDeliveryMethod = prop.model[0].deliveryMethod;
    return prop.model.some((item) => item.deliveryMethod !== firstDeliveryMethod);
  });

  let needCar = $ref('0');
  let btnLoading = $ref(false);

  // Reset needCar to '0' if deliveryMethods become different
  watch(hasDifferentDeliveryMethods, (newVal) => {
    if (newVal && needCar === '1') {
      needCar = '0';
    }
  });
  const emit = defineEmits(['saved']);

  async function handleSubmit() {
    if (hasDifferentDeliveryMethods.value && needCar === '1') {
      return;
    }
    btnLoading = true;
    const taskIds = prop.model.map((it) => it.id);
    const res = {
      fcAddress: prop.model[0].fcAddress ?? '',
      deliveryMethod: prop.model[0].deliveryMethod,
      postcode: prop.model[0].postcode ?? '',
      needCar: needCar,
      inStatus: needCar === '1' ? '已定车' : '无需定车',
      carStatus: needCar === '1' ? '已定车' : '无需定车',
      outboundDetailInfo: taskIds.join(','),
      totalVolume: safeSumBy(prop.model, 'volume'),
      totalWeight: safeSumBy(prop.model, 'weight'),
      totalNumber: safeSumBy(prop.model, 'arrivedContainerNum'),
      trayNum: safeSumBy(prop.model, 'arrivedTrayNum'),
      suggestedPrice: safeSumBy(prop.model, 'suggestedPrice'),
      bolitaTaskIds: taskIds,
      isa: isa,
      waybillId: waybillId,
      reservationGetProductTime:
        dayjs(reservationGetProductTime).format('YYYY-MM-DDTHH:mm:ss') ?? '',
      reservationGetProductDetailTime: reservationGetProductDetailTime,
      po: po,
      note: note,
      logisticsCompany: logisticsCompany,
    };
    const currentInfo = Object.assign(defaultOutboundList, res);

    const outboundId = (await addOrUpdateWithRefOutboundForecast(currentInfo)).data.id;
    await updateTaskListAfterBookingCarWithInfo(outboundId, currentInfo);
    if (needCar === '1') {
      if (prop.model[0].outboundMethod === '散货') {
        if (allDeliveryList.includes(prop.model[0].deliveryMethod)) {
          await getOutboundRef('Channel', '', prop.model[0].deliveryMethod, outboundId);
        } else {
          await getOutboundRef('Other', prop.model[0].postcode, '', outboundId);
        }
      } else {
        await getOutboundRef('Tray', prop.model[0].postcode, '', outboundId);
      }
    } else {
      await getOutboundRef('WithoutCar', '', '', outboundId);
    }
    btnLoading = false;
    emit('saved');
  }

  const displayColumns: DataTableColumns<any> = $computed(() => [
    { title: '票号', key: 'ticketId' },
    { title: '柜号', key: 'containerId' },
    { title: '托数', key: 'arrivedTrayNum', width: 50 },
    { title: '箱数', key: 'arrivedContainerNum', width: 50 },
    { title: '重量', key: 'weight', width: 50 },
    { title: '体积', key: 'volume', width: 50 },
    { title: '邮编', key: 'postcode', width: 80 },
    { title: '预计出库方式', key: 'outboundMethod' },
    { title: '物流方式', key: 'deliveryMethod', width: 100 },
    { title: 'FBA单号', key: 'fbaDeliveryCode' },
    { title: '仓库', key: 'inventory.name', width: 100 },
    { title: '价格', key: 'suggestedPrice', width: 100 },
  ]);
</script>

<style lang="less" scoped></style>
