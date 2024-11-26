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
  import { ReloadOutlined } from '@vicons/antd';
  import { getOutboundForecastList } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';
  import { getNotifyList } from '@/api/newDataLayer/Notify/Notify';

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
      key: 'inventory.name',
    },
    {
      title: '客户ID',
      key: 'customer.customerName',
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
    {
      title: '备注',
      key: 'note',
    },
  ].map((it) => {
    it.resizable = true;
    return it;
  });

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
      title: '总件数',
      key: 'totalNumber',
    },
  ].map((it) => {
    it.resizable = true;
    return it;
  });

  const loadNotifyDataTable = async () => {
    let startDate = dayjs(dateRange[0]).startOf('day').valueOf() ?? valueOfToday[0];
    let endDate = dayjs(dateRange[1]).endOf('day').valueOf() ?? valueOfToday[1];
    const res = (await getNotifyList()).filter(
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
    console.log(res, 'res');
    return res;
  };

  const loadOutboundDataTable = async () => {
    let startDate = dayjs(dateRange[0]).startOf('day').valueOf() ?? valueOfToday[0];
    let endDate = dayjs(dateRange[1]).endOf('day').valueOf() ?? valueOfToday[1];
    const res = (await getOutboundForecastList()).filter(
      (it) => it.createTimestamp > startDate && it.createTimestamp < endDate
    );
    res.forEach((it) => {
      if (!it.REF) {
        it.REF = it.ref ? it.ref : it.id;
      }
    });
    return res;
  };

  function reload() {
    actionNotifyRef.value.reload();
    actionOutboundRef.value.reload();
  }
</script>

<style lang="less" scoped></style>
