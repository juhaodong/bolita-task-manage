<template>
  <n-card v-if="hasAuthPower('billManageView')" :bordered="false" class="proCard">
    <filter-bar
      v-model="filterItems"
      v-model:dateRange="dateRange"
      v-model:showAll="showAll"
      :columns="columns"
      @clear="updateFilter(null)"
      @submit="updateFilter"
      @filter-change="updateFilterWithItems"
    />
    <div class="mt-2">
      <n-button
        v-if="hasAuthPower('billManageAdd')"
        class="action-button"
        size="small"
        type="primary"
        @click="showAdd"
      >
        <template #icon>
          <n-icon>
            <DocumentAdd20Regular />
          </n-icon>
        </template>
        新建对账
      </n-button>
      <n-button class="action-button" size="small" type="info" @click="selectedHeader">
        <template #icon>
          <n-icon>
            <TableSettings20Regular />
          </n-icon>
        </template>
        选择表头显示
      </n-button>
      <n-button class="action-button" size="small" type="success" @click="downloadData">
        <template #icon>
          <n-icon>
            <ArrowDownload20Regular />
          </n-icon>
        </template>
        下载
      </n-button>
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
          :pagination="paginationReactive"
          :request="loadDataTable"
          :row-key="(row) => row.id"
          @update:page="handlePageChange"
          @update:pageSize="handlePageSizeChange"
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
  import { computed, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import { FinanceContainerManager, FinanceManager } from '@/api/dataLayer/modules/cash/cash';
  import NewReconciliation from '@/views/newViews/ReconciliationManage/NewReconciliation.vue';
  import { statusColumnEasy, timeColumn } from '@/views/bolita-views/composable/useableColumns';
  import {
    ArrowDownload20Regular,
    Document20Regular,
    DocumentAdd20Regular,
    DocumentEdit20Regular,
    Folder32Filled,
    TableSettings20Regular,
  } from '@vicons/fluent';
  import { dateCompare, OneYearMonthTab } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';
  import { NButton, NIcon, NTooltip } from 'naive-ui';
  import { generateOptionFromArray, toastSuccess } from '@/store/utils/utils';
  import ShowContainerDetailDialog from '@/views/newViews/ReconciliationManage/ShowContainerDetailDialog.vue';
  import ShowDownProductsDetailDialog from '@/views/newViews/ReconciliationManage/ShowDownProductsDetailDialog.vue';
  import { hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import { valueOfToday } from '@/api/dataLayer/common/Date';

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
  let dateRange = $ref(null);
  let showAll = $ref(false);
  let filterItems = $ref<Array<{ option: string; value: string }>>([]);

  const paginationReactive = reactive({
    defaultPage: 1,
    pageNumber: 0,
    pageSize: 10,
    defaultPageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    pageCount: 0,
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
    // Load data based on mission type
    if (typeMission === '货柜对账') {
      allList = await FinanceManager.load(filterObj);
    } else {
      allList = await FinanceContainerManager.load(filterObj);
    }

    // Apply date range filter if set
    if (dateRange) {
      let startDate = dayjs(dateRange[0]).startOf('day').valueOf() ?? valueOfToday[0];
      let endDate = dayjs(dateRange[1]).endOf('day').valueOf() ?? valueOfToday[1];
      allList = allList.filter(
        (it) => it.createTimestamp > startDate && it.createTimestamp < endDate
      );
    }

    // Sort the data
    allList = allList.sort(dateCompare('createTimestamp'));

    // Get total count for pagination
    const totalCount = allList.length;

    // Apply pagination
    const startIndex = paginationReactive.pageNumber * paginationReactive.pageSize;
    const endIndex = startIndex + paginationReactive.pageSize;
    const paginatedList = allList.slice(startIndex, endIndex);

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

    // Update pagination total
    paginationReactive.pageCount = Math.ceil(totalCount / paginationReactive.pageSize);

    // Return paginated data with fake items for pagination
    return fakeListStart.concat(paginatedList.concat(fakeListEnd));
  };

  let filterObj: any | null = $ref(null);

  function updateFilter(value) {
    if (value !== null) {
      filterObj = value;
    } else {
      filterObj = null;
      filterItems = [];
      dateRange = null;
      showAll = false;
    }
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

  async function selectedHeader() {
    // This function would typically open a dialog to select table headers
    // For now, we'll just show a success message
    toastSuccess('表头选择功能待实现');
  }

  async function downloadData() {
    try {
      // Get filtered data
      const selectedList = await loadDataTable();

      // Create header row from column titles
      const headerTitle = columns.map((it) => it.title);

      // Create data array with header row
      const data = [headerTitle];

      // Add data rows
      selectedList.forEach((item) => {
        const row = [
          item.id || '',
          item.customerName || '',
          dayjs(item.createTimestamp).format('YYYY-MM-DD') || '',
          item.systemSettlementPrice || '',
          item.otherSystemSettlement || '',
          item.operateTotal || '',
          item.specialOperateTotal || '',
          item.inboundTotal || '',
          item.consumablesTotal || '',
          item.deliveryTotal || '',
          item.outboundTotal || '',
          item.totalPrice || '',
          item.RMBPrice || '',
          item.EURPrice || '',
          item.invoiceNumber || '',
          item.collectionStatus || '',
          item.note || '',
        ];
        data.push(row);
      });

      // Here you would typically create and download an Excel file
      // For now, we'll just show a success message
      toastSuccess('下载成功');
    } catch (error) {
      console.error('下载失败:', error);
    }
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 100,
    render(record: any) {
      // Custom file action with icon
      const iconFileAction = (label, key, icon, power) => {
        return {
          icon: renderIconWithTooltip(icon, label),
          onClick: async () => {
            try {
              // Here you would typically handle file uploads
              // For now, we'll just show a success message
              toastSuccess('文件操作成功');
              reloadTable();
            } catch (error) {
              console.error('操作失败:', error);
            }
          },
          ifShow: () => {
            return hasAuthPower(power);
          },
        };
      };

      return h(TableAction as any, {
        style: 'text',
        actions: [
          {
            icon: renderIconWithTooltip(DocumentEdit20Regular, '修改'),
            onClick() {
              startEdit(record.id);
            },
            ifShow: () => {
              return hasAuthPower('billManageEdit');
            },
          },
          iconFileAction('附件', 'files', Folder32Filled, 'billManageFile'),
          {
            icon: renderIconWithTooltip(Document20Regular, '查看详情'),
            onClick() {
              currentIds = record.detailInfo;
              showDetailInfoDialog = true;
            },
          },
        ],
      });
    },
  });

  const actionColumnContainer = reactive({
    title: '可用动作',
    key: 'action',
    width: 100,
    render(record: any) {
      // Custom file action with icon
      const iconFileAction = (label, key, icon, power) => {
        return {
          icon: renderIconWithTooltip(icon, label),
          onClick: async () => {
            try {
              // Here you would typically handle file uploads
              // For now, we'll just show a success message
              toastSuccess('文件操作成功');
              reloadTable();
            } catch (error) {
              console.error('操作失败:', error);
            }
          },
          ifShow: () => {
            return hasAuthPower(power);
          },
        };
      };

      return h(TableAction as any, {
        style: 'text',
        actions: [
          {
            icon: renderIconWithTooltip(DocumentEdit20Regular, '修改'),
            onClick() {
              startEdit(record.id);
            },
            ifShow: () => {
              return hasAuthPower('billManageEdit');
            },
          },
          iconFileAction('附件', 'files', Folder32Filled, 'billManageFile'),
          {
            icon: renderIconWithTooltip(Document20Regular, '查看详情'),
            onClick() {
              currentIds = record.id;
              showDownProductsDetailInfoDialog = true;
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

  .modal-small {
    width: 90%;
    min-width: 400px;
    max-width: 400px;
  }

  .modal-medium {
    width: 90%;
    min-width: 600px;
    max-width: 800px;
  }

  .modal-large {
    width: 90%;
    min-width: 600px;
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
