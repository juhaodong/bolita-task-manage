<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter">
      <n-button :disabled="checkedRows.length == 0" type="warning" @click="confirmOutbound()">
        确认出库
      </n-button>
    </filter-bar>
    <div class="my-2"></div>
    <n-tabs v-model:value="selectedMonth" tab-style="min-width: 80px;" type="card">
      <n-tab-pane
        v-for="currentMonth in monthTab"
        :key="currentMonth"
        :name="currentMonth"
        :tab="currentMonth"
      >
        <BasicTable
          ref="actionRef"
          v-model:checked-row-keys="checkedRows"
          :actionColumn="actionColumn"
          :columns="columns"
          :request="loadDataTable"
          :row-key="(row) => row.id"
        />
      </n-tab-pane>
    </n-tabs>
    <n-modal
      v-model:show="showOutboundOrderDetail"
      :show-icon="false"
      preset="dialog"
      style="width: 90%; min-width: 600px; max-width: 800px"
      title="出库单"
    >
      <outbound-order
        :amz-id="AMZID"
        :data="currentData"
        :delivery-method="currentDeliveryMethod"
        :fba-code="FBACode"
        :pick-date="pickDate"
        :ref-code="RefCode"
        @saved="closeDetail"
      />
    </n-modal>
    <n-modal
      v-model:show="showOutboundChange"
      :show-icon="false"
      preset="dialog"
      style="width: 90%; min-width: 600px; max-width: 800px"
      title="编辑"
    >
      <change-forecast
        :id="currentId"
        :amz-id="AMZID"
        :change-note="changeNote"
        :isa="ISACode"
        :operator="operator"
        :pick-date="pickDate"
        :pick-time="pickTime"
        :ref-code="RefCode"
        @saved="closeChange"
      />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import { getFileActionButtonByOutForecast } from '@/views/bolita-views/composable/useableColumns';
  import { $ref } from 'vue/macros';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { usePermission } from '@/hooks/web/usePermission';
  import { toastSuccess } from '@/store/utils/utils';
  import { NotifyManager } from '@/api/dataLayer/modules/notify/notify-api';
  import {
    getOutboundForecast,
    updateOutboundForecast,
    updateTaskListConfirmOut,
  } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import OutboundOrder from '@/views/newViews/OutboundForecast/OutboundOrder.vue';
  import dayjs from 'dayjs';
  import ChangeForecast from '@/views/newViews/OutboundForecast/ChangeForecast.vue';
  import { useUserStore } from '@/store/modules/user';
  import { groupBy } from 'lodash';
  import {
    randomContainColorList,
    randomCustomerColorList,
  } from '@/api/dataLayer/common/ColorList';
  import { dateCompare, OneYearMonthTab } from '@/api/dataLayer/common/MonthDatePick';
  import { CarStatus } from '@/views/newViews/OutboundPlan/columns';
  import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
  import { getOutboundForecastById } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';

  const { hasPermission } = usePermission();

  const showModal = ref(false);
  let selectedMonth: any | null = $ref('');
  let monthTab: any | null = $ref(null);
  let allOutboundForecastList = $ref([]);
  let currentData = $ref('');
  let RefCode = $ref('');
  let FBACode = $ref('');
  let pickDate = $ref('');
  let pickTime = $ref('');
  let AMZID = $ref('');
  let currentId = $ref('');
  let ISACode = $ref('');
  let changeNote = $ref('');
  let operator = $ref('');
  let currentDeliveryMethod = $ref('');
  let showOutboundOrderDetail = $ref(false);
  let showOutboundChange = $ref(false);
  let checkedRows = $ref([]);
  const actionRef = ref();
  let filterObj: any | null = $ref(null);
  const loadDataTable = async () => {
    allOutboundForecastList = (await getOutboundForecast())
      .filter((it) => it.carStatus !== CarStatus.Interception)
      .filter((x) => x.outStatus !== '已出库');
    allOutboundForecastList.forEach((it) => {
      it.customerAddress = it?.country + it?.postcode + it?.FBACode + it?.AMZID;
    });
    return allOutboundForecastList.sort(dateCompare('createTimestamp'));
  };

  onMounted(async () => {
    monthTab = OneYearMonthTab();
    selectedMonth = monthTab[0];
  });
  async function confirmOutbound() {
    const userStore = useUserStore();
    for (const item of checkedRows) {
      const list = await getOutboundForecastById(item);
      await updateOutboundForecast(item, {
        outboundDetailInfo: list.outboundDetailInfo,
        outStatus: '已出库',
        carStatus: '已出库',
        realOutDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        unloadPerson: userStore.info?.realName ?? '',
      });
      await updateTaskListConfirmOut(item);
    }
    toastSuccess('success');
    reloadTable();
  }

  async function checkOutboundOrder(id) {
    const res = allOutboundForecastList.find((it) => it.id === id);
    const currentTaskList = [];
    for (const item of res.outboundDetailInfo) {
      const res = await NotifyDetailManager.getById(item);
      currentTaskList.push(res);
    }
    currentData = currentTaskList;
    const customerColor = groupBy(currentData, 'customerName');
    const containColor = groupBy(currentData, 'containerId');
    let customerIndex = 0;
    let containIndex = 0;
    for (const item in customerColor) {
      const customerColorIndex = customerIndex % randomCustomerColorList.length;
      customerColor[item].forEach(
        (x) => (x.customerColor = randomCustomerColorList[customerColorIndex])
      );
      customerIndex = customerIndex + 1;
    }
    for (const item in containColor) {
      const containColorIndex = containIndex % randomContainColorList.length;
      containColor[item].forEach(
        (x) => (x.containColor = randomContainColorList[containColorIndex])
      );
      containIndex = containIndex + 1;
    }
    currentDeliveryMethod = res.deliveryMethod;
    AMZID = res.AMZID;
    pickDate = dayjs(res.reservationGetProductTime).format('YYYY-MM-DD');
    FBACode = res.FBACode;
    RefCode = res.REF;
    showOutboundOrderDetail = true;
  }

  async function changeForecastOrder(id) {
    const res = allOutboundForecastList.find((it) => it.id === id);
    currentId = id;
    AMZID = res.AMZID;
    pickDate = dayjs(res.reservationGetProductTime).format('YYYY-MM-DD');
    pickTime = res.reservationGetProductDetailTime;
    RefCode = res.REF;
    pickTime = res.reservationGetProductDetailTime;
    ISACode = res.ISA;
    operator = res.changeOperator ?? '';
    changeNote = res.changeNote ?? '';
    showOutboundChange = true;
  }

  async function closeDetail() {
    showOutboundOrderDetail = false;
    reloadTable();
  }

  async function closeChange() {
    showOutboundChange = false;
    reloadTable();
  }

  async function startEdit(id) {
    currentModel = await NotifyManager.getById(id);
    showModal.value = true;
  }
  function reloadTable() {
    actionRef.value[0].reload();
    showModal.value = false;
  }

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record) {
      const fileAction = (label, key, icon?: Component, editable = false) => {
        return getFileActionButtonByOutForecast(label, key, reloadTable, record, icon, editable);
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          fileAction('提单文件', 'files'),
          fileAction('POD', 'POD'),
          fileAction('装车照片', 'CMRFilesOut'),
          {
            label: '出库单',
            onClick() {
              checkOutboundOrder(record.id);
            },
          },
          {
            label: '变更',
            onClick() {
              changeForecastOrder(record.id);
            },
          },
          {
            label: '截停',
            async onClick() {
              await updateOutboundForecast(record.id, { carStatus: CarStatus.Interception });
              reloadTable();
            },
          },
          {
            label: '信息已变更',
            async onClick() {
              await updateOutboundForecast(record.id, { alreadyChanged: 0 });
              reloadTable();
            },
            highlight: () => {
              return 'error';
            },
            ifShow: () => {
              return record.alreadyChanged;
            },
          },
        ],
      });
    },
  });

  function addTable() {
    showModal.value = true;
  }
</script>

<style lang="less" scoped></style>
