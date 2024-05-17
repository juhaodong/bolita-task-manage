<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter">
      <n-button
        v-if="hasAuthPower('orderCarOffer')"
        :disabled="priceRules"
        type="primary"
        @click="startShareCar('offer')"
      >
        <template #icon>
          <n-icon>
            <Box20Filled />
          </n-icon>
        </template>
        报价
      </n-button>
      <n-button
        v-if="hasAuthPower('orderCarBookingCar')"
        :disabled="carRules"
        type="primary"
        @click="startShareCar('car')"
      >
        <template #icon>
          <n-icon>
            <Box20Filled />
          </n-icon>
        </template>
        订车
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
      v-model:show="editOutboundForecast"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="编辑"
    >
      <edit-o-f :id="editId" @saved="saved" />
    </n-modal>
    <n-modal
      v-model:show="showShareCarModel"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="新建订车"
    >
      <new-carpool-management
        :merged-out-ids="checkedRows"
        :type-name="typeName"
        @saved="saveShareCar"
      />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { Box20Filled } from '@vicons/fluent';
  import { Component, computed, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import { CarpoolManager } from '@/api/dataLayer/modules/logistic/carpool';
  import { getFileActionButtonByOutForecast } from '@/views/bolita-views/composable/useableColumns';
  import { useUserStore } from '@/store/modules/user';
  import { CarpoolManagementPower } from '@/api/dataLayer/common/PowerModel';
  import { getOutboundForecast } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import { dateCompare, OneYearMonthTab } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';
  import EditOF from '@/views/newViews/OperationDetail/NotOutbound/EditOF.vue';
  import NewCarpoolManagement from '@/views/newViews/CarpoolManagement/dialog/NewCarpoolManagement.vue';
  import { hasAuthPower } from '@/api/dataLayer/common/power';

  const showModal = ref(false);

  let filterObj: any | null = $ref(null);
  let currentModel: any | null = $ref(null);
  let paymentDialogShow: boolean = $ref(false);
  let selectedMonth: any | null = $ref('');
  let monthTab: any | null = $ref(null);
  let editOutboundForecast = $ref(false);
  let showShareCarModel = $ref(false);
  let checkedRows = $ref([]);
  let typeName = $ref('');
  let editId = $ref('');
  let allList = $ref([]);
  const loadDataTable = async () => {
    allList = (await getOutboundForecast(filterObj))
      .filter((x) => dayjs(x.createBookCarTimestamp).format('YYYY-MM') === selectedMonth)
      .sort(dateCompare('createBookCarTimestamp'));
    return allList;
  };
  const actionRef = ref();

  onMounted(async () => {
    monthTab = OneYearMonthTab();
    selectedMonth = monthTab[0];
  });
  const realDetailInfoById = computed(() => {
    let res = [];
    for (const id of checkedRows) {
      const detailInfoById = allList.find((it) => it.id === id);
      res.push(detailInfoById);
    }
    return res;
  });
  const priceRules = computed(() => {
    return (
      checkedRows.length < 1 || realDetailInfoById?.value.filter((it) => it.waitPrice).length !== 0
    );
  });
  const carRules = computed(() => {
    return (
      checkedRows.length < 1 ||
      realDetailInfoById?.value.filter((it) => it.waitCar).length !== 0 ||
      realDetailInfoById?.value.filter((it) => it.waitPrice === 1).length !== checkedRows.length
    );
  });

  function startShareCar(item) {
    typeName = item;
    showShareCarModel = true;
  }

  async function saveShareCar() {
    reloadTable();
    checkedRows = [];
  }

  function updateFilter(value) {
    if (value !== null) {
      let { filterTitle, filterKey, ...NewObj } = value;
      if (value['filterTitle'] && value['filterKey']) {
        const res = columns.find((it) => it.title === value['filterTitle']).key;
        NewObj[res] = value['filterKey'];
      }
      filterObj = NewObj;
    } else {
      filterObj = null;
    }
    reloadTable();
  }

  function reloadTable() {
    actionRef.value[0].reload();
    showModal.value = false;
    showShareCarModel = false;
    paymentDialogShow = false;
    editOutboundForecast = false;
  }
  async function addOut() {
    showModal.value = true;
  }

  function saved() {
    reloadTable();
  }

  async function startEdit(id) {
    currentModel = await CarpoolManager.getById(id);
    showModal.value = true;
  }

  async function doPayment(id) {
    currentModel = await CarpoolManager.getById(id);
    paymentDialogShow = true;
  }

  const AccountPowerList = computed(() => {
    return useUserStore()?.info?.powerList;
  });
  const SubmitOrderOperate = computed(() => {
    return AccountPowerList.value.includes(CarpoolManagementPower.SubmitOrder);
  });
  const PODOperate = computed(() => {
    return AccountPowerList.value.includes(CarpoolManagementPower.POD);
  });
  const BillOperate = computed(() => {
    return AccountPowerList.value.includes(CarpoolManagementPower.Bill);
  });
  function startEditOF(id) {
    editId = id;
    editOutboundForecast = true;
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record: any) {
      const fileAction = (label, key, icon?: Component, power) => {
        return getFileActionButtonByOutForecast(label, key, reloadTable, record, icon, power);
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '修改',
            onClick() {
              startEditOF(record.id);
            },
            ifShow: () => {
              return hasAuthPower('orderCarEdit');
            },
          },
          fileAction('提单', 'pickupFiles', '', 'orderCarOrder'),
          fileAction('POD', 'PODFiles', '', 'orderCarPOD'),
          fileAction('CMR', 'CMRFiles', '', 'orderCarCMR'),
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
