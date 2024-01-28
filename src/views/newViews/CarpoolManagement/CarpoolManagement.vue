<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter" />
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
  </n-card>
</template>

<script lang="ts" setup>
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

  const showModal = ref(false);

  let filterObj: any | null = $ref(null);
  let currentModel: any | null = $ref(null);
  let paymentDialogShow: boolean = $ref(false);
  let selectedMonth: any | null = $ref('');
  let monthTab: any | null = $ref(null);
  let editOutboundForecast = $ref(false);
  let editId = $ref('');
  const loadDataTable = async () => {
    return (await getOutboundForecast())
      .filter((x) => dayjs(x.createBookCarTimestamp).format('YYYY-MM') === selectedMonth)
      .sort(dateCompare('createBookCarTimestamp'));
  };
  const actionRef = ref();

  onMounted(async () => {
    monthTab = OneYearMonthTab();
    selectedMonth = monthTab[0];
  });

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  function reloadTable() {
    actionRef.value[0].reload();
    showModal.value = false;
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
      const fileAction = (label, key, disableClick, icon?: Component) => {
        return getFileActionButtonByOutForecast(
          label,
          key,
          reloadTable,
          record,
          icon,
          true,
          disableClick
        );
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '修改',
            onClick() {
              startEditOF(record.id);
            },
          },
          fileAction('提单', 'pickupFiles', !SubmitOrderOperate.value),
          fileAction('POD', 'PODFiles', !PODOperate.value),
          fileAction('CMR', 'CMRFiles', !BillOperate.value),
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
