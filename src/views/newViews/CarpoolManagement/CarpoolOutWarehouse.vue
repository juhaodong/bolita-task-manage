<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter">
      <n-button size="small" type="info" @click="addOut"> 外部仓库新建 </n-button>
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
          :actionColumn="actionColumn"
          :columns="columns"
          :request="loadDataTable"
          :row-key="(row) => row.id"
        />
      </n-tab-pane>
    </n-tabs>
    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="新建外部订车"
    >
      <new-out-car :data="data" @saved="reloadTable" />
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
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import { useUserStore } from '@/store/modules/user';
  import NewOutCar from '@/views/newViews/CarpoolManagement/dialog/NewOutCar.vue';
  import { getOutboundForecastByOut } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import { OneYearMonthTab } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';

  const showModal = ref(false);

  let filterObj: any | null = $ref(null);
  let data: any = $ref([]);
  let currentModel: any | null = $ref(null);
  let paymentDialogShow: boolean = $ref(false);
  let selectedMonth: any | null = $ref('');
  let monthTab: any | null = $ref(null);
  const loadDataTable = async () => {
    return (await getOutboundForecastByOut()).filter(
      (x) => dayjs(x.createTimestamp).format('YYYY-MM') === selectedMonth
    );
  };

  onMounted(async () => {
    monthTab = OneYearMonthTab();
    selectedMonth = monthTab[0];
  });
  const actionRef = ref();

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  function reloadTable() {
    console.log(actionRef);
    actionRef.value.reload();
    showModal.value = false;
    paymentDialogShow = false;
  }
  async function addOut() {
    data = [];
    showModal.value = true;
  }

  async function startEdit(id) {
    currentModel = await CarpoolManager.getById(id);
    showModal.value = true;
  }

  const AccountPowerList = computed(() => {
    return useUserStore()?.info?.powerList;
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
              data = record;
              showModal.value = true;
              console.log(record, 'record');
            },
          },
          fileAction('提单', 'pickupFiles', false),
          fileAction('POD', 'PODFiles', false),
          {
            label: '已截停',
            highlight: () => {
              return 'error';
            },
            ifShow: () => {
              return record.interception === 1;
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
