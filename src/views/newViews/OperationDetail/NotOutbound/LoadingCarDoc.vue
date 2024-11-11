<script lang="ts" setup>
  import { computed, watchEffect } from 'vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { dayjsDateByYMD } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';
  import { DataTableColumns } from 'naive-ui';
  import { flatMap, groupBy } from 'lodash';
  import FileSaver from 'file-saver';
  import { getOutboundForecastById } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';
  import { getTaskListByIds } from '@/api/newDataLayer/TaskList/TaskList';
  import { timeDisplayYMD } from '@/views/bolita-views/composable/useableColumns';

  interface Props {
    notifyId: string;
  }

  const props = defineProps<Props>();
  let outboundInfo: any | null = $ref(null);
  let currentTaskList: any[] = $ref([]);

  const emit = defineEmits(['close', 'refresh', 'save']);
  watchEffect(async () => {
    await reload();
  });
  const planArriveTime = computed(() => {
    return dayjsDateByYMD(outboundInfo?.planArriveDateTime) ?? dayjs().format('YYYY-MM-DD');
  });

  async function reload() {
    console.log('333');
    if (props.notifyId != null) {
      outboundInfo = await getOutboundForecastById(props.notifyId);
      const detailInfo = await getTaskListByIds(outboundInfo.outboundDetailInfo.split(','));
      console.log(outboundInfo, 'info');
      console.log(detailInfo, 'detailInfo');
      currentTaskList = flatMap(groupBy(detailInfo, 'FCAddress'));
      emit('refresh');
    }
  }

  async function downloadUnloadingFile() {
    let headerTitle = ['Ref,Name des Kunden,Gesamtmenge,Ankunftszeit'];
    let headerDate = [
      outboundInfo?.REF,
      outboundInfo?.customerId,
      outboundInfo?.containerNum,
      outboundInfo?.createBookCarTimestamp,
    ];
    let dataStrings = ['Kenzeichen,FBA,Menge,R/F,Pal Menge,Pal Type,Lager,Contaniner nr.'];
    dataStrings.unshift(headerDate);
    dataStrings.unshift(headerTitle);
    currentTaskList.forEach((it) => {
      const res = [
        it.ticketId,
        it.FBADeliveryCode,
        it.number,
        '',
        '',
        '',
        it.inventory.name,
        it.containerId,
      ];
      dataStrings.push(res.join());
    });
    dataStrings = dataStrings.join('\n');
    const blob = new Blob([dataStrings], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, outboundInfo?.REF + '.csv');
  }

  const columns: DataTableColumns<any> = $computed(() => [
    { title: 'Kenzeichen', key: 'ticketId' },
    { title: 'FBA', key: 'FBADeliveryCode', width: 150 },
    { title: 'Menge', key: 'number' },
    // { title: 'Gesamt', key: 'outBoundContainerNum' },
    { title: 'R/F', key: 'fakeDate' },
    { title: 'Pal Menge', key: 'fakeDate' },
    { title: 'Pal Type', key: 'fakeDate' },
    { title: 'Lager', key: 'inventory.name', width: 200 },
    { title: 'Contaniner nr.', key: 'containerId' },
  ]);

  let loading: boolean = $ref(false);
</script>

<template>
  <div id="print" class="mt-8">
    <loading-frame :loading="loading">
      <n-descriptions v-if="outboundInfo" :columns="2" bordered label-placement="left">
        <n-descriptions-item label="Ref.">
          {{ outboundInfo?.REF ?? outboundInfo?.id }}
        </n-descriptions-item>
        <n-descriptions-item label="Gesamtmenge:">
          {{ outboundInfo?.totalNumber }}</n-descriptions-item
        >
        <n-descriptions-item label="Name des Kunden:">
          {{ outboundInfo?.customer.customerName }}</n-descriptions-item
        >
        <n-descriptions-item label="Abfahrtszeit:">
          {{ timeDisplayYMD(outboundInfo?.bookCarTimestamp) }}</n-descriptions-item
        >
      </n-descriptions>
      <n-data-table
        :bordered="false"
        :columns="columns"
        :data="currentTaskList"
        :single-line="false"
      />
      <n-button @click="downloadUnloadingFile">下载</n-button>
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
