<template>
  <n-card v-if="hasAuthPower('outMissionView')" :bordered="false" class="proCard">
    <filter-bar
      v-model="filterItems"
      :columns="operationColumns"
      @clear="updateFilter(null)"
      @submit="updateFilter"
      @filter-change="updateFilterWithItems"
    />
    <div class="mt-2">
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
    <BasicTable
      ref="actionRef"
      v-model:checked-row-keys="checkedRows"
      :actionColumn="actionColumn"
      :columns="currentColumns"
      :pagination="paginationReactive"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      @update:page="handlePageChange"
      @update:pageSize="handlePageSizeChange"
    />
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
      v-model:show="showLoadingCarListDialog"
      :show-icon="false"
      preset="dialog"
      style="width: 90%; min-width: 600px; max-width: 800px"
      title="装柜表"
    >
      <loading-car-list :id="currentId" :outbound-info="currentInfo" @save="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="showFeeDialog"
      :show-icon="false"
      preset="dialog"
      style="width: 90%; min-width: 600px; max-width: 800px"
      title="费用表"
    >
      <out-bound-fee-dialog :current-info="currentInfo" @save="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="showCurrentHeaderDataTable"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 800px; max-width: 800px"
      title="添加表头"
    >
      <selected-header-table
        :all-columns="operationColumns"
        :type="'operation'"
        @saved="reloadHeader"
      />
    </n-modal>
    <n-modal
      v-model:show="showDetailInfoDialog"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 800px; max-width: 800px"
      title="查看详情"
    >
      <detail-info-dialog :ids="currentIds" />
    </n-modal>
    <n-modal
      v-model:show="showLoadingCarDoc"
      :show-icon="false"
      preset="dialog"
      style="width: 90%; min-width: 600px; max-width: 1000px"
      title="装车单"
    >
      <loading-car-doc :notify-id="currentNotifyId!" @save="reloadTable" />
    </n-modal>
  </n-card>
  <no-power-page v-else />
</template>

<script lang="ts" setup>
  import {
    ArrowDownload20Regular,
    ArrowUpload20Regular,
    Box20Filled,
    DocumentAdd20Regular,
    DocumentEdit20Regular,
    Image20Regular,
    Payment20Regular,
    TableSettings20Regular,
  } from '@vicons/fluent';
  import { computed, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import {
    statusColumnSelect,
    timeTableColumn,
  } from '@/views/bolita-views/composable/useableColumns';
  import { $ref } from 'vue/macros';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import NewCarpoolManagement from '@/views/newViews/CarpoolManagement/dialog/NewCarpoolManagement.vue';
  import dayjs from 'dayjs';
  import OutboundOrder from '@/views/newViews/OutboundForecast/OutboundOrder.vue';
  import EditOF from '@/views/newViews/OperationDetail/NotOutbound/EditOF.vue';
  import LoadingCarList from '@/views/newViews/OperationDetail/NotOutbound/LoadingCarList.vue';
  import OutBoundFeeDialog from '@/views/newViews/OperationDetail/NotOutbound/OutBoundFeeDialog.vue';
  import { NButton, NIcon, NTooltip } from 'naive-ui';
  import { generateOptionFromArray, toastSuccess } from '@/store/utils/utils';
  import SelectedHeaderTable from '@/views/newViews/Missions/AlreadyWarehousing/SelectedHeaderTable.vue';
  import DetailInfoDialog from '@/views/newViews/OperationDetail/NotOutbound/DetailInfoDialog.vue';
  import LoadingCarDoc from '@/views/newViews/OperationDetail/NotOutbound/LoadingCarDoc.vue';
  import { hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import FileSaver from 'file-saver';
  import { getTableHeaderGroupItemList } from '@/api/newDataLayer/Header/HeaderGroup';
  import {
    addOrUpdateWithRefOutboundForecast,
    getOutboundForecastListByFilterWithPagination,
    waitOperationStatusList,
  } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';
  import { useUploadDialog } from '@/store/modules/uploadFileState';
  import { addOrUpdateTask, getTaskListByOutboundId } from '@/api/newDataLayer/TaskList/TaskList';
  import { addOrUpdateTaskTimeLine } from '@/api/newDataLayer/TimeLine/TimeLine';
  import { useUserStore } from '@/store/modules/user';
  import * as XLSX from 'xlsx';
  import {
    allInStatusOperationList,
    asyncCustomerByFilter,
    asyncStorageByFilter,
  } from '@/api/dataLayer/common/common';

  const showModal = ref(false);
  let showShareCarModel = $ref(false);
  let checkedRows = $ref([]);
  let monthTab: any | null = $ref(null);
  let typeMission: any | null = $ref('');
  let selectedMonth: any | null = $ref('');
  let showOutboundOrderDetail = $ref(false);
  let editOutboundForecast = $ref(false);
  let currentDeliveryMethod = $ref('');
  let currentData = $ref('');
  let RefCode = $ref('');
  let FBACode = $ref('');
  let pickDate = $ref('');
  let AMZID = $ref('');
  let editId = $ref('');
  let allList = $ref([]);
  let currentId = $ref([]);
  let showLoadingCarListDialog = $ref(false);
  let currentList = $ref([]);
  let currentInfo = $ref([]);
  let showFeeDialog = $ref(false);
  let showDetailInfoDialog = $ref(false);
  let currentIds = $ref([]);
  let currentNotifyId: string | null = $ref(null);
  let showLoadingCarDoc = $ref(false);
  let optionOne = $ref('');
  let optionTwo = $ref('');
  let valueOne = $ref('');
  let valueTwo = $ref('');
  let dateRange = $ref(null);
  let showAll = $ref(false);
  let filterItems = $ref([]);

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

  const operationColumns = $ref([
    {
      title: 'ID',
      key: 'id',
    },
    timeTableColumn('realOutDate', '出库日期'),
    // {
    //   title: '出库日期',
    //   key: 'realOutDate',
    // },
    asyncStorageByFilter(),
    asyncCustomerByFilter(),
    timeTableColumn('pickUpDateTime', '预计取货时间'),
    timeTableColumn('reservationGetProductTime', '预约送货时间'),
    statusColumnSelect({
      title: '状态',
      key: 'inStatus',
      list: generateOptionFromArray(allInStatusOperationList),
    }),
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
              currentIds = row.outboundDetailInfo;
              showDetailInfoDialog = true;
            },
          },
          { default: () => '查看' }
        );
      },
    },
    {
      title: 'Ref',
      key: 'ref',
    },
    {
      title: 'ISA',
      key: 'isa',
    },
    {
      title: 'AMZ-Sendungs ID',
      key: 'amzid',
    },
    {
      title: 'FC/送货地址',
      key: 'fcaddress',
    },
    {
      title: '物流方式',
      key: 'deliveryMethod',
    },
    {
      title: '邮编',
      key: 'postcode',
    },
    // statusColumnEasy({
    //   title: '订车状态',
    //   key: 'carStatus',
    // }),
    {
      title: '操作人',
      key: 'outOperatePerson',
    },
  ]);
  let currentHeader = $ref([]);
  let currentColumns = $ref([]);
  let showCurrentHeaderDataTable = $ref(false);
  const actionRef = ref();
  let filterObj: any | null = $ref(null);

  const realOptions = computed(() => {
    return generateOptionFromArray(operationColumns.filter((it) => it.key).map((it) => it.title));
  });

  async function reloadHeader() {
    currentColumns = [];
    currentHeader = (await getTableHeaderGroupItemList('operation'))
      ? JSON.parse((await getTableHeaderGroupItemList('operation'))?.headerItemJson)
      : [];
    currentHeader.forEach((item) => {
      const res = operationColumns.find((it) => it.key === item.itemKey);
      currentColumns.push(res);
    });
    currentColumns = currentColumns.length > 0 ? currentColumns : operationColumns;
    currentColumns.forEach((item) => {
      item.resizable = true;
    });
    showCurrentHeaderDataTable = false;
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
            op: 'between',
            value: filterTwo[filterItem].value,
          }))
        : [];

      currentFilter = filterWithOutDate.concat(filterWithDate);
    }
    currentFilter.push({
      field: 'inStatus',
      op: 'in',
      value: waitOperationStatusList,
    });

    // Get paginated data
    const res = await getOutboundForecastListByFilterWithPagination(
      currentFilter,
      paginationReactive
    );
    let allList = res.content;
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

    // Sort and return results with fake items for pagination
    return fakeListStart.concat(allList.concat(fakeListEnd));
  };

  async function downloadData() {
    try {
      // Get all data without pagination
      const realDataList = await loadDataTable();

      // Create header row from column titles
      let headerTitle = operationColumns
        .filter((it) => it.title && it.title !== '详情')
        .map((it) => it.title);

      let data = [];
      data.push(headerTitle);

      // Add data rows, filtering out empty rows
      realDataList.forEach((item) => {
        const row = [];
        operationColumns
          .filter((it) => it.title && it.title !== '详情')
          .filter((col) => col.title)
          .forEach((col) => {
            // Handle nested properties like 'customer.customerName'
            if (col.key && col.key.includes('.')) {
              const keys = col.key.split('.');
              let value = item;
              for (const key of keys) {
                value = value && value[key];
              }
              row.push(value || '');
            } else if (col.key) {
              // Handle date fields
              if (col.key === 'planArriveDateTime' && item[col.key]) {
                row.push(dayjs(item[col.key]).format('YYYY-MM-DD'));
              } else {
                row.push(item[col.key] || '');
              }
            } else {
              row.push('');
            }
          });
        const hasValue = row.some((value) => value !== '' && value !== null && value !== undefined);
        if (hasValue) {
          data.push(row);
        }
      });

      // 创建一个工作簿
      const workbook = XLSX.utils.book_new();
      // 将数据转换为工作表
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      // 将工作表添加到工作簿
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // 生成Excel文件
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

      // 保存文件
      FileSaver.saveAs(blob, '出库看板.xlsx');

      toastSuccess('下载成功');
    } catch (error) {
      console.error('下载失败:', error);
    }
  }

  let currentModel = $ref(null);

  function startEditOF(id) {
    editId = id;
    editOutboundForecast = true;
  }

  function startShareCar() {
    showShareCarModel = true;
  }

  function saved() {
    reloadTable();
  }

  async function selectedHeader() {
    showCurrentHeaderDataTable = true;
  }

  function reloadTable() {
    showModal.value = false;
    showShareCarModel = false;
    editOutboundForecast = false;
    showLoadingCarListDialog = false;
    showFeeDialog = false;
    actionRef.value.reload();
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

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  async function saveShareCar() {
    reloadTable();
    checkedRows = [];
  }

  onMounted(async () => {
    await reloadHeader();
    typeMission = '出库任务看板';
  });

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 200,
    render(record) {
      // Custom file action with icon
      const iconFileAction = (label, key, icon, power) => {
        return {
          icon: renderIconWithTooltip(icon, label),
          onClick: async () => {
            try {
              const upload = useUploadDialog();
              const files = await upload.upload(record[key]);
              if (files.checkPassed) {
                record[key] = files.files;
                await addOrUpdateWithRefOutboundForecast(record);
                toastSuccess('上传成功');
                reloadTable();
              }
            } catch (error) {
              console.error('上传失败:', error);
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
              startEditOF(record.id);
            },
            ifShow: () => {
              return hasAuthPower('outMissionEdit');
            },
          },
          iconFileAction(
            '上传装车单',
            'loadingCarDoc',
            ArrowUpload20Regular,
            'outMissionUploadFile'
          ),
          {
            icon: renderIconWithTooltip(DocumentAdd20Regular, '生成装车单'),
            onClick() {
              currentNotifyId = record.id!;
              showLoadingCarDoc = true;
            },
            ifShow: () => {
              return !record?.unloadingFile && hasAuthPower('outMissionCreatUpCarFile');
            },
          },
          {
            icon: renderIconWithTooltip(Box20Filled, '装车'),
            onClick() {
              currentInfo = record;
              currentId = record?.outboundDetailInfo;
              showLoadingCarListDialog = true;
            },
            ifShow: () => {
              return hasAuthPower('outMissionUpCar');
            },
          },
          {
            icon: renderIconWithTooltip(Image20Regular, '装车照片'),
            highlight: () => {
              return record?.['cmrfiles']?.length > 0 ? 'success' : 'error';
            },
            async onClick() {
              const upload = useUploadDialog();
              const files = await upload.upload(record['cmrfiles']);
              if (files.checkPassed) {
                record.CMRFiles = files.files;
                record.inStatus = '已完成';
                record.realOutDate = dayjs().valueOf();
                await addOrUpdateWithRefOutboundForecast(record);
                const taskList = await getTaskListByOutboundId(record.id);
                for (const item of taskList) {
                  item.cmrfiles = files.files;
                  item.inStatus = '已完成';
                  item.deliveryTime = dayjs().valueOf();
                  await addOrUpdateTask(item);
                  const userInfo = useUserStore().info;
                  await addOrUpdateTaskTimeLine({
                    useType: 'normal',
                    bolitaTaskId: item.id,
                    operator: userInfo?.realName,
                    detailTime: dayjs().valueOf(),
                    note: '已装车，已完成',
                  });
                }
              }
              await actionRef.value.reload();
            },
            ifShow: () => {
              return hasAuthPower('outMissionUploadFile');
            },
          },
          {
            icon: renderIconWithTooltip(Payment20Regular, '结算'),
            onClick() {
              currentInfo = record;
              showFeeDialog = true;
            },
            ifShow: () => {
              return hasAuthPower('outMissionSettle');
            },
          },
          {
            icon: renderIconWithTooltip(Box20Filled, '信息已变更'),
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
</script>

<style lang="less" scoped>
  .action-button {
    margin-right: 8px;
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
