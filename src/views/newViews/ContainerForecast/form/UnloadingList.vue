<script lang="ts" setup>
  import { computed, watchEffect } from 'vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { NotifyManager } from '@/api/dataLayer/modules/notify/notify-api';
  import { getNotifyDetailListByNotify } from '@/api/dataLayer/modules/notify/notify-detail';
  import { dayjsDateByYMD } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';
  import { DataTableColumns } from 'naive-ui';
  import { flatMap, groupBy } from 'lodash';
  import FileSaver from 'file-saver';

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
  const planArriveTime = computed(() => {
    return dayjsDateByYMD(notifyInfo?.planArriveDateTime) ?? dayjs().format('YYYY-MM-DD');
  });

  async function reload() {
    if (props.notifyId != null) {
      notifyInfo = await NotifyManager.getById(props.notifyId);
      const res = await getNotifyDetailListByNotify(props.notifyId);
      console.log(res, 'res');
      currentTaskList = flatMap(groupBy(res, 'FCAddress'));
      currentTaskList.forEach((it) => {
        if (it.outboundMethod === '存仓') {
          it.Anmerkung = 'Im Lager';
        } else if (it.outboundMethod === '大件托盘') {
          it.Anmerkung = 'PL';
        } else if (it.outboundMethod === '标准托盘') {
          if (it.deliveryMethod === 'FBA卡车派送') {
            it.Anmerkung = 'AMZ PL';
          } else {
            it.Anmerkung = 'PRI PL';
          }
        } else if (it.outboundMethod === '散货') {
          it.Anmerkung = 'Loose';
        }
        if (it.deliveryMethod === 'FBA卡车派送') {
          it.Adresse = it.FCAddress;
        } else if (
          it.deliveryMethod === 'DHL' ||
          it.deliveryMethod === 'DPD' ||
          it.deliveryMethod === 'UPS' ||
          it.deliveryMethod === 'GLS'
        ) {
          it.Adresse = it.deliveryMethod;
        } else {
          it.Adresse = '-';
        }
      });
      emit('refresh');
    }
  }

  async function downloadUnloadingFile() {
    let headerTitle = ['Container Nr,Name des Kunden,Gesamtmenge,Ankunftszeit'];
    let headerDate = [
      notifyInfo?.containerNo,
      notifyInfo?.customerId,
      notifyInfo?.arrivedCount,
      planArriveTime.value,
    ];
    let dataStrings = ['Kenzeichen,FBA,Menge,R/F,Pal Menge,Pal Type,adresse,Anmerkung'];
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
        it.Adresse,
        it.Anmerkung,
      ];
      dataStrings.push(res.join());
    });
    dataStrings = dataStrings.join('\n');
    const blob = new Blob([dataStrings], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, notifyInfo?.containerNo + '.csv');
  }

  const columns: DataTableColumns<any> = $computed(() => [
    { title: 'Kenzeichen', key: 'ticketId' },
    { title: 'FBA', key: 'FBADeliveryCode', width: 150 },
    { title: 'Menge', key: 'number' },
    // { title: 'Gesamt', key: 'outBoundContainerNum' },
    { title: 'R/F', key: 'fakeDate' },
    { title: 'Pal Menge', key: 'fakeDate' },
    { title: 'Pal Type', key: 'fakeDate' },
    { title: 'Adresse', key: 'Adresse', width: 200 },
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
        <n-descriptions-item label="Ankunftszeit:"> {{ planArriveTime }}</n-descriptions-item>
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
