<script lang="ts" setup>
  import { computed, watchEffect } from 'vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { NotifyManager } from '@/api/dataLayer/modules/notify/notify-api';
  import { getNotifyDetailListByNotify } from '@/api/dataLayer/modules/notify/notify-detail';
  import { dayjsDateByYMD } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';
  import { DataTableColumns } from 'naive-ui';
  import { flatMap, groupBy } from 'lodash';

  interface Props {
    notifyId: string;
  }

  const props = defineProps<Props>();
  let notifyInfo: any | null = $ref(null);
  let currentTaskList: any[] = $ref([]);

  const emit = defineEmits(['close', 'refresh', 'save']);
  watchEffect(async () => {
    await reload();
  });
  const currentArriveTime = computed(() => {
    return dayjsDateByYMD(notifyInfo?.currentDate) ?? dayjs().format('YYYY-MM-DD');
  });

  async function reload() {
    if (props.notifyId != null) {
      notifyInfo = await NotifyManager.getById(props.notifyId);
      const res = await getNotifyDetailListByNotify(props.notifyId);
      currentTaskList = flatMap(groupBy(res, 'FCAddress'));
      currentTaskList.forEach((it) => {
        if (it.outboundMethod === '存仓') {
          it.Anmerkung = 'Loose';
        } else if (it.outboundMethod === '大件托盘') {
          it.Anmerkung = 'PL';
        } else if (it.outboundMethod === '标准托盘') {
          if (it.deliveryMethod === 'FBA卡派') {
            it.Anmerkung = 'AMZ PL';
          } else {
            it.Anmerkung = 'PRI PL';
          }
        } else if (it.outboundMethod === '散货') {
          it.Anmerkung = 'Loose';
        }
      });
      emit('refresh');
    }
  }

  const columns: DataTableColumns<any> = $computed(() => [
    { title: 'Kenzeichen', key: 'ticketId' },
    { title: 'FBA', key: 'FBADeliveryCode', width: 150 },
    { title: 'Menge', key: 'number' },
    // { title: 'Gesamt', key: 'outBoundContainerNum' },
    // { title: 'R/F', key: 'weight' },
    { title: 'Pal Menge', key: 'trayNum' },
    { title: 'Pal Type', key: 'trayType' },
    { title: 'Adresse', key: 'FCAddress', width: 200 },
    { title: 'Anmerkung', key: 'Anmerkung' },
  ]);

  let loading: boolean = $ref(false);
</script>

<template>
  <div id="print" class="mt-8">
    <loading-frame :loading="loading">
      <n-descriptions v-if="notifyInfo" :columns="2" bordered label-placement="left">
        <n-descriptions-item label="Container Nr.">
          {{ notifyInfo?.containerNo }}
        </n-descriptions-item>
        <n-descriptions-item label="Gesamtmenge:">
          {{ notifyInfo?.arrivedCount }}</n-descriptions-item
        >
        <n-descriptions-item label="Name des Kunden:">
          {{ notifyInfo?.customerId }}</n-descriptions-item
        >
        <n-descriptions-item label="Ankunftszeit:"> {{ currentArriveTime }}</n-descriptions-item>
      </n-descriptions>
      <n-data-table
        :bordered="false"
        :columns="columns"
        :data="currentTaskList"
        :single-line="false"
      />
    </loading-frame>
  </div>
</template>

<style lang="less" scoped>
  @media print {
    .noMaxHeight {
      max-height: unset !important;
      overflow: hidden;
    }
  }
</style>
