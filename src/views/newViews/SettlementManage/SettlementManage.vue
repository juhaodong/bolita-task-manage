<template>
  <n-card v-if="hasAuthPower('settlementManageView')" :bordered="false" class="proCard">
    <filter-bar
      v-if="finished"
      v-model="filterItems"
      :columns="typeMission === '卸柜结算' ? columnsIn : columnsOut"
      :default-value-model="filterObj"
      :form-fields="filters"
      @clear="updateFilter(null)"
      @submit="updateFilter"
      @filter-change="updateFilterWithItems"
    />
    <!--    <div class="mt-2">-->
    <!--      <n-button-->
    <!--        v-if="hasAuthPower('settlementManageMerge')"-->
    <!--        :disabled="checkedRows.length == 0"-->
    <!--        class="action-button"-->
    <!--        size="small"-->
    <!--        type="primary"-->
    <!--        @click="merge()"-->
    <!--      >-->
    <!--        <template #icon>-->
    <!--          <n-icon>-->
    <!--            <Box20Filled />-->
    <!--          </n-icon>-->
    <!--        </template>-->
    <!--        合并对账-->
    <!--      </n-button>-->
    <!--    </div>-->
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
          :action-column="actionColumn"
          :columns="typeMission === '卸柜结算' ? columnsIn : columnsOut"
          :pagination="paginationReactive"
          :request="loadDataTable"
          :row-key="(row) => row.id"
          @update:page="handlePageChange"
          @update:pageSize="handlePageSizeChange"
        />
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
      v-model:show="showNotifyDetail"
      :show-icon="false"
      preset="dialog"
      style="width: 90%; min-width: 600px; max-width: 800px"
      title="货柜详情"
    >
      <notify-detail :current-date="currentNotify!" @save="reloadTable" />
    </n-modal>
  </n-card>
  <no-power-page v-else />
</template>

<script lang="ts" setup>
  import { h, onMounted, reactive, ref } from 'vue';
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
  import { Document20Regular, DocumentEdit20Regular, Payment20Regular } from '@vicons/fluent';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { safeSumBy } from '@/store/utils/utils';
  import { OneYearMonthTab } from '@/api/dataLayer/common/MonthDatePick';
  import { getSettlementById, updateSettlement } from '@/api/dataLayer/common/SettlementType';
  import NewTotalFee from '@/views/newViews/SettlementManage/NewTotalFee.vue';
  import { hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import { getNotifySettlementByFilterWithPagination } from '@/api/newDataLayer/NotifySettlement/NotifySettlement';
  import { getSettlementListByFilterWithPagination } from '@/api/newDataLayer/TaskListSettlement/TaskListSettlement';
  import { getNotifyById } from '@/api/newDataLayer/Notify/Notify';
  import NotifyDetail from '@/views/newViews/SettlementManage/NotifyDetail.vue';
  import { NIcon, NTooltip } from 'naive-ui';

  let finished = $ref(false);
  let addNewFeeDialog = $ref(false);
  let showFeeDialog = $ref(false);
  let selectedMonth: any | null = $ref('');
  let monthTab: any | null = $ref(null);
  let allList: any | null = $ref([]);
  let currentNotify: string | null = $ref(null);
  let typeMission: any | null = $ref('');
  let currentData: any | null = $ref([]);
  let typeTab = $ref(['卸柜结算', '货柜结算']);
  let showNotifyDetail = $ref(false);
  let filterItems = $ref<Array<{ option: string; value: string }>>([]);
  let filterObj: any | null = $ref(null);

  const paginationReactive = reactive({
    defaultPage: 1,
    pageNumber: 0,
    pageSize: 10,
    defaultPageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    onChange: (page: number) => {
      paginationReactive.pageNumber = page - 1;
      // reloadTable() is called by handlePageChange, no need to call it here
    },
    onUpdatePageSize: (pageSize: number) => {
      paginationReactive.pageSize = pageSize;
      paginationReactive.pageNumber = 0;
      // Let the BasicTable component handle the data fetching
    },
  });

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
    // Build filter criteria
    let currentFilter = [];
    if (filterObj) {
      const filterOne = filterObj.filter((it) => it?.component?.name !== 'DatePicker');
      const filterTwo = filterObj.filter((it) => it?.component?.name === 'DatePicker');
      const filterWithOutDate = filterOne
        ? Object.keys(filterOne).map((filterItem) => ({
            field: filterOne[filterItem].key,
            op: filterOne[filterItem].value ? 'like' : '!=',
            value: `%${filterOne[filterItem].value || ''}%`,
          }))
        : [];
      const filterWithDate = filterTwo
        ? Object.keys(filterTwo).map((filterItem) => ({
            field: filterTwo[filterItem].key,
            op: filterTwo[filterItem].value ? 'like' : '!=',
            value: `%${filterTwo[filterItem].value || ''}%`,
          }))
        : [];
      currentFilter = filterWithOutDate.concat(filterWithDate);
    }

    let res;
    if (typeMission === '货柜结算') {
      res = await getSettlementListByFilterWithPagination(currentFilter, paginationReactive);
    } else {
      res = await getNotifySettlementByFilterWithPagination(currentFilter, paginationReactive);
    }

    allList = res.content;
    const totalCount = res.page.totalElements;

    // Create fake list items for pagination display
    let fakeListStart = [];
    let fakeListEnd = [];

    if (paginationReactive.pageNumber > 0) {
      fakeListStart = Array(paginationReactive.pageNumber * paginationReactive.pageSize)
        .fill(null)
        .map((it, index) => {
          return { key: index };
        });
    }

    if (paginationReactive.pageSize < totalCount) {
      if (totalCount - paginationReactive.pageSize * (paginationReactive.pageNumber + 1) > 0) {
        fakeListEnd = Array(
          totalCount - paginationReactive.pageSize * (paginationReactive.pageNumber + 1)
        )
          .fill(null)
          .map((it, index) => {
            return { key: index };
          });
      }
    }

    // Return results with fake items for pagination
    return fakeListStart.concat(allList.concat(fakeListEnd));
  };

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  function updateFilterWithItems(value) {
    filterObj = value;
    reloadTable();
  }

  function handlePageChange(page: number) {
    paginationReactive.pageNumber = page - 1;
    reloadTable();
  }

  function handlePageSizeChange(pageSize: number) {
    paginationReactive.pageSize = pageSize;
    paginationReactive.pageNumber = 0;
    reloadTable();
  }

  // Helper function to render icon with tooltip
  const renderIconWithTooltip = (icon, tooltip) => {
    return () =>
      h(
        NTooltip,
        { trigger: 'hover', placement: 'top' },
        {
          trigger: () => h(NIcon, { size: 18, class: 'action-icon' }, { default: () => h(icon) }),
          default: () => tooltip,
        }
      );
  };

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
    width: 100,
    render(record: any) {
      return h(TableAction as any, {
        style: 'text',
        actions: [
          {
            icon: renderIconWithTooltip(Document20Regular, '查看'),
            async onClick() {
              currentNotify = await getNotifyById(record.notify);
              showNotifyDetail = true;
            },
            ifShow: () => {
              return typeMission === '卸柜结算';
            },
          },
          {
            icon: renderIconWithTooltip(DocumentEdit20Regular, '修改'),
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
            icon: renderIconWithTooltip(Payment20Regular, '已对账'),
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

<style lang="less" scoped>
  .action-button {
    margin-right: 8px;
  }

  .filter-container {
    display: flex;
    align-items: center;
    margin-top: 8px;
    flex-wrap: wrap;
  }

  .filter-card {
    max-width: 300px;
  }

  .filter-row {
    display: flex;
    align-items: center;
  }

  .ml-2 {
    margin-left: 8px;
  }

  .mt-2 {
    margin-top: 8px;
  }

  .my-2 {
    margin-top: 8px;
    margin-bottom: 8px;
  }

  /* Styles for action icons */
  :deep(.action-icon) {
    margin: 0 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  :deep(.n-icon) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :deep(.n-tooltip) {
    max-width: 200px;
    word-break: keep-all;
  }
</style>
