<template>
  <n-card :bordered="false" class="proCard">
    <div style="display: flex; align-items: center; justify-items: center">
      <n-date-picker
        v-model:value="dateRange"
        :default-value="[dayjs().valueOf(), dayjs().valueOf()]"
        class="ml-2"
        clearable
        type="daterange"
      />
      <div class="table-toolbar-right-icon" @click="reload">
        <n-icon size="18">
          <ReloadOutlined />
        </n-icon>
      </div>
    </div>
    <n-grid :cols="2" x-gap="12">
      <n-gi>
        <BasicTable ref="actionNotifyRef" :columns="notifyColumns" :request="loadNotifyDataTable" />
      </n-gi>
      <n-gi>
        <BasicTable
          ref="actionOutboundRef"
          :columns="outboundColumns"
          :request="loadOutboundDataTable"
        />
      </n-gi>
    </n-grid>
  </n-card>
</template>

<script lang="ts" setup>
  import { $ref } from 'vue/macros';
  import { BasicTable } from '@/components/Table';
  import { valueOfToday } from '@/api/dataLayer/common/Date';
  import dayjs from 'dayjs';
  import { ref } from 'vue';
  import { getOutboundForecast } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import { NotifyManager } from '@/api/dataLayer/modules/notify/notify-api';
  import { ReloadOutlined } from '@vicons/antd';

  let dateRange = $ref(valueOfToday);
  const actionNotifyRef = ref();
  const actionOutboundRef = ref();
  const notifyColumns = [
    {
      title: '货柜号',
      key: 'containerNo',
    },
    {
      title: '问题',
      key: 'problem',
    },
    {
      title: '仓库',
      key: 'warehouseId',
    },
    {
      title: '客户ID',
      key: 'customerName',
    },
    {
      title: '预约到仓时间',
      key: 'inHouseTime',
    },
    {
      title: '卸货人员',
      key: 'unloadPerson',
    },
    {
      title: '整柜数量',
      key: 'arrivedCount',
    },
    // {
    //   title: '卸货单',
    //   key: 'unloadingFile',
    // },
  ];

  const outboundColumns = [
    {
      title: 'REF',
      key: 'REF',
    },
    {
      title: 'ISA',
      key: 'ISA',
    },
    {
      title: 'AMZ-Sendungs ID',
      key: 'AMZID',
    },
    {
      title: '取货时间',
      key: 'reservationGetProductDetailTime',
    },
    {
      title: '报价',
      key: 'totalOutOffer',
    },
    {
      title: '总件数',
      key: 'containerNum',
    },
  ];

  const loadNotifyDataTable = async () => {
    let startDate = dayjs(dateRange[0]).startOf('day').valueOf() ?? valueOfToday[0];
    let endDate = dayjs(dateRange[1]).endOf('day').valueOf() ?? valueOfToday[1];
    const res = (await NotifyManager.load(null)).filter(
      (it) => it.createTimestamp > startDate && it.createTimestamp < endDate
    );
    res.forEach((x) => {
      if (
        dayjs().valueOf() >
        dayjs(dayjs(x.planArriveDateTime).format('YYYY-MM-DD') + ' ' + x.inHouseTime).valueOf()
      ) {
        x.problem = 'Verp';
      }
      if (x.inStatus === '已取消') {
        x.problem = 'Absage';
      }
      if (x.number > 1300) {
        x.problem = 'Schwer';
      }
    });
    return res;
  };

  const loadOutboundDataTable = async () => {
    let startDate = dayjs(dateRange[0]).startOf('day').valueOf() ?? valueOfToday[0];
    let endDate = dayjs(dateRange[1]).endOf('day').valueOf() ?? valueOfToday[1];
    return (await getOutboundForecast(null)).filter(
      (it) => it.createTimestamp > startDate && it.createTimestamp < endDate
    );
  };

  function reload() {
    actionNotifyRef.value.reload();
    actionOutboundRef.value.reload();
  }
</script>

<style lang="less" scoped></style>
