<template>
  <n-card v-if="hasAuthPower('settlementManageView')" :bordered="false" class="proCard">
    <filter-bar
      v-if="finished"
      :default-value-model="filterObj"
      :form-fields="filters"
      @clear="updateFilter(null)"
      @submit="updateFilter"
    >
      <n-button
        v-if="hasAuthPower('settlementManageMerge')"
        :disabled="checkedRows.length == 0"
        @click="merge()"
      >
        <template #icon>
          <n-icon>
            <Box20Filled />
          </n-icon>
        </template>
        合并对账
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
              :action-column="actionColumn"
              :columns="typeMission === '卸柜结算' ? columnsIn : columnsOut"
              :request="loadDataTable"
              :row-key="(row) => row.id"
            />
          </n-tab-pane>
        </n-tabs>
      </n-tab-pane>
    </n-tabs>

    <n-modal
      v-model:show="addNewFeeDialog"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 800px; max-width: 800px"
      title="管理账单"
    >
      <new-total-fee :current-data="currentData" @saved="reloadTable" />
    </n-modal>

    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="结算管理"
    >
      <new-settlement :model="currentModel" @saved="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="showFeeDialog"
      :show-icon="false"
      preset="dialog"
      style="width: 90%; min-width: 600px; max-width: 800px"
      title="费用表"
    >
      <notify-fee-dialog :notify-id="currentNotifyId!" @save="reloadTable" />
    </n-modal>
  </n-card>
  <no-power-page v-else />
</template>

<script lang="ts" setup>
  import { Component, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columnsIn, columnsOut, filters } from './columns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import {
    CashManager,
    FinanceContainerManager,
    FinanceManager,
  } from '@/api/dataLayer/modules/cash/cash';
  import NewSettlement from '@/views/newViews/SettlementManage/NewSettlement.vue';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import { Box20Filled } from '@vicons/fluent';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { safeSumBy } from '@/store/utils/utils';
  import { dateCompare, OneYearMonthTab } from '@/api/dataLayer/common/MonthDatePick';
  import {
    getSettlement,
    getSettlementById,
    updateSettlement,
  } from '@/api/dataLayer/common/SettlementType';
  import NewTotalFee from '@/views/newViews/SettlementManage/NewTotalFee.vue';
  import dayjs from 'dayjs';
  import NotifyFeeDialog from '@/views/newViews/NotifyList/form/NotifyFeeDialog.vue';
  import { NotifyManager } from '@/api/dataLayer/modules/notify/notify-api';
  import { CashCollectionStatus } from '@/views/newViews/ReconciliationManage/columns';
  import { hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';

  interface Prop {
    outId?: string;
  }

  let finished = $ref(false);
  const props = defineProps<Prop>();
  let addNewFeeDialog = $ref(false);
  let showFeeDialog = $ref(false);
  let selectedMonth: any | null = $ref('');
  let monthTab: any | null = $ref(null);
  let allList: any | null = $ref([]);
  let currentNotifyId: string | null = $ref(null);
  let typeMission: any | null = $ref('');
  let currentData: any | null = $ref([]);
  let typeTab = $ref(['卸柜结算', '货柜结算']);
  onMounted(() => {
    monthTab = OneYearMonthTab();
    selectedMonth = monthTab[0];
    typeMission = '货柜结算';
    finished = true;
  });
  const showModal = ref(false);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);

  async function startEdit(id) {
    currentData = allList.find((it) => it.id === id);
    console.log(currentData, 'data');
    addNewFeeDialog = true;
  }

  const loadDataTable = async () => {
    if (typeMission === '货柜结算') {
      allList = (await getSettlement()).filter(
        (x) => dayjs(x.createTimestamp).format('YYYY-MM') === selectedMonth
      );
    } else {
      allList = (await CashManager.load()).filter(
        (x) => dayjs(x.createTimestamp).format('YYYY-MM') === selectedMonth
      );
    }
    console.log(allList, 'list');
    return allList.sort(dateCompare('createTimestamp'));
  };

  let filterObj: any | null = $ref(null);

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  const actionRef = ref();

  function reloadTable() {
    actionRef.value[0].reload();
    showModal.value = false;
    addNewFeeDialog = false;
    showFeeDialog = false;
  }

  async function merge() {
    await safeScope(async () => {
      const currentList: any[] = [];
      if (typeMission === '货柜结算') {
        for (const checkedRow of checkedRows) {
          const res = await getSettlementById(checkedRow);
          currentList.push(res);
        }
        const operateTotal = safeSumBy(currentList, 'operateTotal');
        const specialOperateTotal = safeSumBy(currentList, 'specialOperateTotal');
        const inboundTotal = safeSumBy(currentList, 'inboundTotal');
        const consumablesTotal = safeSumBy(currentList, 'consumablesTotal');
        const deliveryTotal = safeSumBy(currentList, 'deliveryTotal');
        const outboundTotal = safeSumBy(currentList, 'outboundTotal');
        const totalPrice = safeSumBy(currentList, 'totalPrice');
        const id = await FinanceManager.addInternal({
          detailInfo: currentList.map((it) => it.id),
          operateTotal: operateTotal,
          specialOperateTotal: specialOperateTotal,
          inboundTotal: inboundTotal,
          consumablesTotal: consumablesTotal,
          deliveryTotal: deliveryTotal,
          outboundTotal: outboundTotal,
          totalPrice: totalPrice,
          customerId: currentList[0].customerId,
        });
        for (const checkedRow of checkedRows) {
          const res = await getSettlementById(checkedRow);
          res.finalStatus = '已对账';
          res.financeId = id;
          await updateSettlement(checkedRow, res);
        }
      } else {
        for (const checkedRow of checkedRows) {
          currentList.push(await CashManager.getById(checkedRow));
        }
        const unloadingCabinetsTotal = safeSumBy(currentList, 'amount');
        const otherPriceTotal = safeSumBy(currentList, 'otherPrice');
        const subTotal = safeSumBy(currentList, 'subtotal');
        const id = await FinanceContainerManager.addInternal({
          detailInfo: currentList.map((it) => it.id),
          unloadingCabinetsTotal: unloadingCabinetsTotal,
          otherPriceTotal: otherPriceTotal,
          subTotal: subTotal,
          customerId: currentList[0].customerId,
        });
        await CashManager.massiveUpdate(
          checkedRows.map((it) => ({
            id: it,
            containerFinalStatus: '已对账',
            financeContainerId: id,
          }))
        );
      }
      reloadTable();
      checkedRows = [];
    });
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 60,
    render(record: any) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '修改',
            onClick() {
              startEdit(record.id);
            },
            ifShow: () => {
              return (
                typeMission === '货柜结算' &&
                record.finalStatus !== '已对账' &&
                hasAuthPower('settlementManageEdit')
              );
            },
          },
          {
            label: '已对账',
            highlight: () => {
              return 'success';
            },
            ifShow: () => {
              return record.finalStatus === '已对账';
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
