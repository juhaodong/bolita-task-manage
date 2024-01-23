<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter">
      <n-button
        v-if="typeMission === '待操作'"
        :disabled="checkedRows.length == 0"
        type="warning"
        @click="startShareCar()"
      >
        订车
      </n-button>
    </filter-bar>
    <div class="my-2"></div>
    <n-tabs
      v-model:value="typeMission"
      animated
      class="card-tabs"
      pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
      pane-wrapper-style="margin: 0 -4px"
      size="large"
    >
      <n-tab-pane
        v-for="currentType in typeTab"
        :key="currentType"
        :name="currentType"
        :tab="currentType"
      >
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
      v-model:show="showShareCarModel"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="新建订车"
    >
      <new-carpool-management :merged-out-ids="checkedRows" @saved="saveShareCar" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import { Folder32Filled } from '@vicons/fluent';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import { $ref } from 'vue/macros';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { usePermission } from '@/hooks/web/usePermission';
  import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outboundDetail';
  import NewCarpoolManagement from '@/views/newViews/CarpoolManagement/dialog/NewCarpoolManagement.vue';
  import { getOutboundForecast } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import { OneYearMonthTab } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';
  import { useUserStore } from '@/store/modules/user';
  import OutboundOrder from '@/views/newViews/OutboundForecast/OutboundOrder.vue';
  import { groupBy } from 'lodash';
  import {
    randomContainColorList,
    randomCustomerColorList,
  } from '@/api/dataLayer/common/ColorList';

  const { hasPermission } = usePermission();

  const showModal = ref(false);
  let showShareCarModel = $ref(false);
  let checkedRows = $ref([]);
  let typeTab = $ref(['已出库', '待操作', '已截停']);
  let monthTab: any | null = $ref(null);
  let typeMission: any | null = $ref('');
  let selectedMonth: any | null = $ref('');
  let showOutboundOrderDetail = $ref(false);
  let currentDeliveryMethod = $ref('');
  let currentData = $ref('');
  let RefCode = $ref('');
  let FBACode = $ref('');
  let pickDate = $ref('');
  let AMZID = $ref('');
  let allList = $ref([]);
  let currentList = $ref([]);
  const actionRef = ref();
  let filterObj: any | null = $ref(null);
  const loadDataTable = async () => {
    const userStore = useUserStore();
    console.log(userStore.info, 'user');
    let allList = (await getOutboundForecast()).filter(
      (x) => dayjs(x.createTimestamp).format('YYYY-MM') === selectedMonth
    );
    if (typeMission === '待操作') {
      currentList = allList
        .filter((it) => it.outStatus !== '已出库')
        .filter((it) => !it.interception || it.interception !== 1);
      currentList.forEach((it) => {
        it.customerAddress = it?.country + it?.postcode + it?.FBACode + it?.AMZID;
      });
    } else if (typeMission === '已出库') {
      currentList = allList
        .filter((it) => !it.interception || it.interception !== 1)
        .filter((x) => x.outStatus === '已出库');
      currentList.forEach((it) => {
        it.customerAddress = it?.country + it?.postcode + it?.FBACode + it?.AMZID;
      });
    } else {
      currentList = allList.filter((it) => it.interception === 1);
      currentList.forEach((it) => {
        it.customerAddress = it?.country + it?.postcode + it?.FBACode + it?.AMZID;
      });
    }
    console.log(currentList, 'res');
    return currentList;
  };
  function startShareCar() {
    console.log(checkedRows, 'check');
    showShareCarModel = true;
  }
  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
    showShareCarModel = false;
  }

  async function checkOutboundOrder(id) {
    const res = currentList.find((it) => it.id === id);
    currentData = res.outboundDetailInfo;
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
    currentDeliveryMethod = res.deliveryDetail;
    AMZID = res.AMZID;
    pickDate = dayjs(res.reservationGetProductTime).format('YYYY-MM-DD');
    FBACode = res.FBACode;
    RefCode = res.REF;
    showOutboundOrderDetail = true;
  }

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  async function saveShareCar() {
    reloadTable();
    checkedRows = [];
  }

  onMounted(async () => {
    monthTab = OneYearMonthTab();
    typeMission = '待操作';
    selectedMonth = monthTab[0];
  });

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record) {
      const fileAction = (label, key, icon?: Component, editable = false) => {
        return getFileActionButton(
          label,
          key,
          OutBoundDetailManager,
          reloadTable,
          record,
          icon,
          editable
        );
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          fileAction('提单文件', 'files', Folder32Filled),
          fileAction('POD', 'POD'),
          fileAction('操作文件', 'operationFiles'),
          fileAction('问题图片', 'problemFiles'),
          {
            label: '出库单',
            ifShow: () => {
              return typeMission === '已出库';
            },
            onClick() {
              console.log(record.id, 'id');
              checkOutboundOrder(record.id);
            },
          },
          {
            label: '信息已变更',
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
