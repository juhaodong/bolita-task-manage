<template>
  <n-card :bordered="false" class="proCard">
    <div class="page-header">
      <div class="page-title">
        <n-icon size="20" class="mr-2">
          <CalendarOutlined />
        </n-icon>
        <span>日报表</span>
      </div>
      <div class="filter-section">
        <n-date-picker
          v-model:value="dateRange"
          :default-value="[dayjs().valueOf(), dayjs().valueOf()]"
          clearable
          type="daterange"
          size="medium"
        />
        <n-button class="ml-2" secondary type="primary" @click="reload">
          <template #icon>
            <n-icon>
              <ReloadOutlined />
            </n-icon>
          </template>
          刷新
        </n-button>
      </div>
    </div>

    <div class="my-4"></div>

    <n-tabs v-model:value="activeTab" type="card" tab-style="min-width: 80px;">
      <n-tab-pane name="notify" tab="通知">
        <BasicTable 
          ref="actionNotifyRef" 
          :columns="notifyColumns" 
          :request="loadNotifyDataTable"
          :row-key="(row) => row.id || row.containerNo" 
        />
      </n-tab-pane>
      <n-tab-pane name="outbound" tab="出库">
        <BasicTable
          ref="actionOutboundRef"
          :columns="outboundColumns"
          :request="loadOutboundDataTable"
          :row-key="(row) => row.id || row.REF"
        />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script lang="ts" setup>
  import { $ref } from 'vue/macros';
  import { BasicTable } from '@/components/Table';
  import { valueOfToday } from '@/api/dataLayer/common/Date';
  import dayjs from 'dayjs';
  import { ref } from 'vue';
  import { CalendarOutlined, ReloadOutlined } from '@vicons/antd';
  import { getOutboundForecastList } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';
  import { getNotifyList } from '@/api/newDataLayer/Notify/Notify';

  let dateRange = $ref(valueOfToday);
  let activeTab = $ref('notify'); // Default to notify tab
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

<style lang="less" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 500;
}

.filter-section {
  display: flex;
  align-items: center;
}

.mr-2 {
  margin-right: 8px;
}

.ml-2 {
  margin-left: 8px;
}

.my-4 {
  margin-top: 16px;
  margin-bottom: 16px;
}

:deep(.n-tabs-tab) {
  padding: 8px 16px;
}

:deep(.n-data-table-th) {
  font-weight: 500;
}
</style>
