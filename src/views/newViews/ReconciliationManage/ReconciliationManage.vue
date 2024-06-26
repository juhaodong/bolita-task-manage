<template>
  <n-card v-if="hasAuthPower('billManageView')" :bordered="false" class="proCard">
    <filter-bar
      :default-value-model="filterObj"
      :form-fields="filters"
      @clear="updateFilter(null)"
      @submit="updateFilter"
    />
    <div class="mt-2" style="display: flex; align-items: center; justify-items: center">
      <n-card embedded size="small" style="max-width: 300px">
        <div style="display: flex">
          <n-select
            v-model:value="optionOne"
            :options="realOptions"
            placeholder="过滤项1"
            style="width: 130px"
          />
          <n-input
            v-model:value="valueOne"
            class="ml-2"
            placeholder="过滤值1"
            style="width: 130px"
            type="text"
          />
        </div>
      </n-card>
      <n-card class="ml-2" embedded size="small" style="max-width: 300px">
        <div style="display: flex">
          <n-select
            v-model:value="optionTwo"
            :options="realOptions"
            placeholder="过滤项2"
            style="width: 130px"
          />
          <n-input
            v-model:value="valueTwo"
            class="ml-2"
            placeholder="过滤值2"
            style="width: 130px"
            type="text"
          />
        </div>
      </n-card>
      <n-date-picker v-model:value="dateRange" class="ml-2" clearable type="daterange" />
    </div>
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
        <BasicTable
          ref="actionRef"
          v-model:checked-row-keys="checkedRows"
          :action-column="typeMission === '货柜对账' ? actionColumn : actionColumnContainer"
          :columns="typeMission === '货柜对账' ? columns : downProductsColumns"
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
      title="对账管理"
    >
      <new-reconciliation :model="currentModel" :type-mission="typeMission" @saved="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="showDetailInfoDialog"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 800px; max-width: 800px"
      title="查看详情"
    >
      <show-container-detail-dialog :ids="currentIds" />
    </n-modal>
    <n-modal
      v-model:show="showDownProductsDetailInfoDialog"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 800px; max-width: 800px"
      title="查看详情"
    >
      <show-down-products-detail-dialog :ids="currentIds" />
    </n-modal>
  </n-card>
  <no-power-page v-else />
</template>

<script lang="ts" setup>
  import { Component, computed, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { filters } from './columns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import { FinanceContainerManager, FinanceManager } from '@/api/dataLayer/modules/cash/cash';
  import NewReconciliation from '@/views/newViews/ReconciliationManage/NewReconciliation.vue';
  import {
    getFileActionButton,
    statusColumnEasy,
    timeColumn,
  } from '@/views/bolita-views/composable/useableColumns';
  import { Folder32Filled } from '@vicons/fluent';
  import { dateCompare, OneYearMonthTab } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';
  import { NButton } from 'naive-ui';
  import ShowContainerDetailDialog from '@/views/newViews/ReconciliationManage/ShowContainerDetailDialog.vue';
  import ShowDownProductsDetailDialog from '@/views/newViews/ReconciliationManage/ShowDownProductsDetailDialog.vue';
  import { hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import { valueOfToday } from '@/api/dataLayer/common/Date';
  import { generateOptionFromArray } from '@/store/utils/utils';

  interface Prop {
    outId?: string;
  }
  const props = defineProps<Prop>();
  let currentIds = $ref([]);
  let showDetailInfoDialog = $ref(false);
  let showDownProductsDetailInfoDialog = $ref(false);

  const columns = [
    {
      title: '财务ID',
      key: 'id',
    },
    {
      title: '客户ID',
      key: 'customerName',
    },
    {
      title: '详情',
      key: 'actions',
      render(row) {
        return h(
          NButton,
          {
            strong: true,
            tertiary: true,
            size: 'small',
            onClick: () => {
              currentIds = row.detailInfo;
              showDetailInfoDialog = true;
              console.log(currentIds, 'currentIds');
            },
          },
          { default: () => '查看' }
        );
      },
    },
    timeColumn(),
    {
      title: '本系统结算金额',
      key: 'systemSettlementPrice',
    },
    // {
    //   title: '附件',
    //   key: 'files',
    // },
    {
      title: '其他系统结算',
      key: 'otherSystemSettlement',
    },
    {
      title: '操作费',
      key: 'operateTotal',
    },
    {
      title: '特殊操作费',
      key: 'specialOperateTotal',
    },
    {
      title: '入库费',
      key: 'inboundTotal',
    },
    {
      title: '耗材费',
      key: 'consumablesTotal',
    },
    {
      title: '物流费',
      key: 'deliveryTotal',
    },
    {
      title: '出库费',
      key: 'outboundTotal',
    },
    {
      title: '合计netto',
      key: 'totalPrice',
    },
    {
      title: '发票金额/RMB',
      key: 'RMBPrice',
    },
    {
      title: '发票金额/EUR',
      key: 'EURPrice',
    },
    {
      title: '发票号',
      key: 'invoiceNumber',
    },
    statusColumnEasy({
      title: '回款情况',
      key: 'collectionStatus',
    }),
    {
      title: '备注',
      key: 'note',
    },
  ];
  const downProductsColumns = [
    {
      title: '财务ID',
      key: 'id',
    },
    {
      title: '详情',
      key: 'actions',
      render(row) {
        return h(
          NButton,
          {
            strong: true,
            tertiary: true,
            size: 'small',
            onClick: () => {
              console.log(row, 'row');
              currentIds = row.id;
              showDownProductsDetailInfoDialog = true;
            },
          },
          { default: () => '查看' }
        );
      },
    },
    {
      title: '客户ID',
      key: 'customerName',
    },
    timeColumn(),
    {
      title: '本系统结算金额',
      key: 'systemSettlementPrice',
    },
    {
      title: '其他系统结算',
      key: 'otherSystemSettlement',
    },
    {
      title: '卸柜费',
      key: 'unloadingCabinetsTotal',
    },
    {
      title: '其他费',
      key: 'otherPriceTotal',
    },
    {
      title: '合计netto',
      key: 'subTotal',
    },
    {
      title: '发票金额/RMB',
      key: 'RMBPrice',
    },
    {
      title: '发票金额/EUR',
      key: 'EURPrice',
    },
    {
      title: '发票号',
      key: 'invoiceNumber',
    },
    statusColumnEasy({
      title: '回款情况',
      key: 'collectionStatus',
    }),
    {
      title: '备注',
      key: 'note',
    },
  ];

  onMounted(() => {
    if (props.outId) {
      filterObj = { outId: props.outId };
    }
  });
  const showModal = ref(false);
  let checkedRows = $ref([]);
  let typeTab = $ref(['货柜对账', '卸柜对账']);
  let monthTab: any | null = $ref(null);
  let typeMission: any | null = $ref('');
  let selectedMonth: any | null = $ref('');
  let currentModel: any | null = $ref(null);
  let allList: any | null = $ref([]);
  let optionOne = $ref('');
  let optionTwo = $ref('');
  let valueOne = $ref('');
  let valueTwo = $ref('');
  let dateRange = $ref(null);

  async function startEdit(id) {
    if (typeMission === '货柜对账') {
      currentModel = await FinanceManager.getById(id);
    } else {
      currentModel = await FinanceContainerManager.getById(id);
    }
    showModal.value = true;
  }
  const realOptions = computed(() => {
    return generateOptionFromArray(columns.filter((it) => it.key).map((it) => it.title));
  });
  const loadDataTable = async () => {
    if (typeMission === '货柜对账') {
      allList = await FinanceManager.load(filterObj);
    } else {
      allList = await FinanceContainerManager.load(filterObj);
    }
    if (dateRange) {
      let startDate = dayjs(dateRange[0]).startOf('day').valueOf() ?? valueOfToday[0];
      let endDate = dayjs(dateRange[1]).endOf('day').valueOf() ?? valueOfToday[1];
      allList = allList.filter(
        (it) => it.createTimestamp > startDate && it.createTimestamp < endDate
      );
    }
    console.log(allList, 'list');
    return allList.sort(dateCompare('createTimestamp'));
  };

  let filterObj: any | null = $ref(null);

  function updateFilter(value) {
    if (value !== null) {
      if (optionOne && valueOne) {
        const keyOne = columns.find((it) => it.title === optionOne).key;

        value[keyOne] = valueOne;
      }
      if (optionTwo && valueTwo) {
        const keyTwo = columns.find((it) => it.title === optionTwo).key;
        value[keyTwo] = valueTwo;
      }
      filterObj = value;
    } else {
      filterObj = null;
      optionOne = '';
      valueOne = '';
      optionTwo = '';
      valueTwo = '';
      dateRange = null;
    }
    reloadTable();
  }
  onMounted(async () => {
    monthTab = OneYearMonthTab();
    typeMission = '货柜对账';
    selectedMonth = monthTab[0];
  });

  function showAdd() {
    currentModel = null;
    showModal.value = true;
  }
  const actionRef = ref();

  function reloadTable() {
    actionRef.value[0].reload();
    showModal.value = false;
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 60,
    render(record: any) {
      const fileAction = (label, key, icon?: Component, editable = false) => {
        return getFileActionButton(label, key, FinanceManager, reloadTable, record, icon, editable);
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '修改',
            onClick() {
              startEdit(record.id);
            },
          },
          fileAction('附件', 'files', Folder32Filled, true),
        ],
      });
    },
  });

  const actionColumnContainer = reactive({
    title: '可用动作',
    key: 'action',
    width: 60,
    render(record: any) {
      const fileAction = (label, key, icon?: Component, power) => {
        return getFileActionButton(
          label,
          key,
          FinanceContainerManager,
          reloadTable,
          record,
          icon,
          power
        );
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '修改',
            onClick() {
              startEdit(record.id);
            },
            ifShow: () => {
              return hasAuthPower('billManageEdit');
            },
          },
          fileAction('附件', 'files', Folder32Filled, 'billManageFile'),
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
