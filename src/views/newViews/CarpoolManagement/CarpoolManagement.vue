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
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, computed, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import { CarpoolManager } from '@/api/dataLayer/modules/logistic/carpool';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import { useUserStore } from '@/store/modules/user';
  import { CarpoolManagementPower } from '@/api/dataLayer/common/PowerModel';
  import { getOutboundForecast } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import { OneYearMonthTab } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';

  const showModal = ref(false);

  let filterObj: any | null = $ref(null);
  let currentModel: any | null = $ref(null);
  let paymentDialogShow: boolean = $ref(false);
  let selectedMonth: any | null = $ref('');
  let monthTab: any | null = $ref(null);
  const loadDataTable = async () => {
    return (await getOutboundForecast()).filter(
      (x) => dayjs(x.createTimestamp).format('YYYY-MM') === selectedMonth
    );
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
    actionRef.value.reload();
    showModal.value = false;
    paymentDialogShow = false;
  }
  async function addOut() {
    showModal.value = true;
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

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record: any) {
      const fileAction = (label, key, disableClick, icon?: Component) => {
        return getFileActionButton(
          label,
          key,
          CarpoolManager,
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
            async onClick() {
              console.log(record, 'record');
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
