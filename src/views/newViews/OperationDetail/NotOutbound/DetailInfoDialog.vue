<script lang="ts" setup>
  import { $ref } from 'vue/macros';
  import {
    getTaskListByIds,
    getTaskListByNotifyId,
    updateTask,
  } from '@/api/newDataLayer/TaskList/TaskList';
  import { statusColumnEasy } from '@/views/bolita-views/composable/useableColumns';
  import { h, onMounted } from 'vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { DataTableColumns, NButton } from 'naive-ui';
  import { addOrUpdateOutboundForecast } from '@/api/newDataLayer/CarManage/CarManage';
  import { addOrUpdateTaskTimeLine } from '@/api/newDataLayer/TimeLine/TimeLine';
  import dayjs from 'dayjs';
  import { useUserStore } from '@/store/modules/user';
  import {
    addOrUpdateWithRefOutboundForecast,
    defaultOutboundList,
    getOutboundRef,
  } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';

  onMounted(async () => {
    await reload();
  });
  const allColumns: DataTableColumns<any> = [
    {
      title: '票号',
      key: 'ticketId',
      fixed: 'left',
      width: 120,
    },
    {
      title: 'Ref',
      key: 'outboundForecast.ref',
      width: 120,
    },
    {
      title: '国家',
      key: 'country',
      width: 60,
    },
    {
      title: 'FC',
      key: 'fcAddress',
      width: 80,
    },
    {
      title: 'FBA单号',
      key: 'fbaDeliveryCode',
      width: 140,
    },
    {
      title: '物流渠道',
      key: 'deliveryMethod',
      width: 100,
    },
    {
      title: '总实重',
      key: 'weight',
      width: 80,
    },
    {
      title: '总体积',
      key: 'volume',
      width: 80,
    },
    {
      title: '尺寸',
      key: 'size',
      width: 80,
    },
    statusColumnEasy({
      title: '状态',
      key: 'inStatus',
    }),
    {
      title: 'Action',
      key: 'actions',
      width: 80,
      render(row) {
        return h(
          NButton,
          {
            strong: true,
            tertiary: true,
            size: 'small',
            onClick: () => changeToPickUp(row),
          },
          { default: () => '自提' }
        );
      },
    },
    {
      title: 'Action',
      key: 'actions',
      width: 80,
      render(row) {
        return h(
          NButton,
          {
            strong: true,
            tertiary: true,
            size: 'small',
            onClick: () => letTaskOut(row),
          },
          { default: () => '剔除' }
        );
      },
    },
  ].map((it) => {
    it.ellipsis = {
      tooltip: true,
    };
    return it;
  });

  interface Props {
    ids: [];
    notifyId: '';
    outboundForecastInfo: '';
  }
  let loading = $ref(false);
  const props = defineProps<Props>();
  let currentList = $ref([]);
  const emit = defineEmits(['saved']);

  async function letTaskOut(row) {
    loading = true;
    console.log(row, 'row');
    const currentTaskInfo = Object.assign({}, row);
    currentTaskInfo.outboundForecastId = null;
    await updateTask(currentTaskInfo);
    const userInfo = useUserStore().info;
    await addOrUpdateTaskTimeLine({
      useType: 'normal',
      bolitaTaskId: currentTaskInfo.id,
      operator: userInfo?.realName,
      detailTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      note: '状态异常!异常原因:出库方式需要改为自提',
    });
    const editOutboundForecast = Object.assign({}, props.outboundForecastInfo);
    editOutboundForecast.bolitaTaskIds = editOutboundForecast.bolitaTaskIds.filter(
      (it) => it !== row.id
    );
    editOutboundForecast.outboundDetailInfo = editOutboundForecast.bolitaTaskIds
      .filter((it) => it !== row.id)
      .join(',');
    await addOrUpdateOutboundForecast(editOutboundForecast);
    loading = false;
    emit('saved');
  }

  async function changeToPickUp(row) {
    loading = true;
    const currentTaskInfo = Object.assign({}, row);
    currentTaskInfo.inStatus = '异常';
    currentTaskInfo.outboundForecastId = null;
    currentTaskInfo.errorReason = '改为自提';
    await updateTask(currentTaskInfo);
    const userInfo = useUserStore().info;
    await addOrUpdateTaskTimeLine({
      useType: 'normal',
      bolitaTaskId: currentTaskInfo.id,
      operator: userInfo?.realName,
      detailTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      note: '状态异常!异常原因:出库方式需要改为自提',
    });
    const res = {
      fcAddress: currentTaskInfo.fcAddress ?? '',
      deliveryMethod: '客户自提',
      postcode: currentTaskInfo.postcode ?? '',
      needCar: '0',
      inStatus: '无需定车',
      carStatus: '无需定车',
      outboundDetailInfo: currentTaskInfo.id,
      totalVolume: currentTaskInfo.volume,
      totalWeight: currentTaskInfo.weight,
      totalNumber: currentTaskInfo.arrivedContainerNum,
      trayNum: currentTaskInfo.arrivedTrayNum,
      suggestedPrice: currentTaskInfo.suggestedPrice,
      bolitaTaskIds: [currentTaskInfo.id],
      isa: '',
      waybillId: '',
      reservationGetProductTime: '',
      reservationGetProductDetailTime: '',
      po: '',
      note: '',
      logisticsCompany: '',
      costPrice: '',
    };
    const currentInfo = Object.assign(defaultOutboundList, res);
    const outboundId = (await addOrUpdateWithRefOutboundForecast(currentInfo)).data.id;
    const editOutboundForecast = Object.assign({}, props.outboundForecastInfo);
    editOutboundForecast.bolitaTaskIds = editOutboundForecast.bolitaTaskIds.filter(
      (it) => it !== row.id
    );
    editOutboundForecast.outboundDetailInfo = editOutboundForecast.bolitaTaskIds
      .filter((it) => it !== row.id)
      .join(',');
    await addOrUpdateOutboundForecast(editOutboundForecast);
    await getOutboundRef('WithoutCar', '', '', outboundId);
    loading = false;
    emit('saved');
  }

  async function reload() {
    loading = true;
    if (props.ids) {
      currentList = await getTaskListByIds(props.ids);
    }
    if (props.notifyId) {
      currentList = (await getTaskListByNotifyId(props.notifyId)).map((it) => {
        it.numberDisplay = it.number + '/' + it.arrivedContainerNum;
        it.trayDisplay = it.trayNum + '/' + it.arrivedTrayNum;
        return it;
      });
    }
    loading = false;
  }
</script>

<template>
  <loading-frame :loading="loading">
    <n-data-table :max-height="400" :columns="allColumns" :data="currentList" />
  </loading-frame>
</template>

<style lang="less" scoped>
  @media print {
    .noMaxHeight {
      max-height: unset !important;
      overflow: hidden;
    }
  }
</style>
