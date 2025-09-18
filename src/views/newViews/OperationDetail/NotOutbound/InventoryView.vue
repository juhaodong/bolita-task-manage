<template>
  <n-card :bordered="false" class="proCard">
    <div>
      <single-filter-bar
        :form-fields="filters"
        @clear="updateFilter(null)"
        @submit="updateFilter"
      />
      <div class="mt-2">
        <n-button class="action-button" size="small" type="default" @click="downloadData">
          下载
        </n-button>
        <n-button
          :disabled="selectedTaskList.length !== 1"
          class="action-button"
          size="small"
          @click="showTaskTray"
        >
          托盘
        </n-button>
        <n-button
          :disabled="selectedTaskList.length !== 1"
          class="action-button"
          size="small"
          @click="changeOrderFiles"
        >
          换单文件
        </n-button>
        <n-button
          :disabled="selectedTaskList.length !== 1"
          class="action-button"
          size="small"
          @click="operationPic"
        >
          操作图片
        </n-button>
        <n-button
          :disabled="selectedTaskList.length !== 1"
          class="action-button"
          size="small"
          @click="problemPic"
        >
          问题图片
        </n-button>
        <n-button
          :disabled="selectedTaskList.length !== 1"
          class="action-button"
          size="small"
          @click="confirmEdit"
        >
          完成操作
        </n-button>
      </div>

      <BasicTable
        ref="actionRef"
        v-model:checked-row-keys="checkedRows"
        @update:checked-row-keys="handleCheck"
        :columns="columns"
        :pagination="paginationReactive"
        :request="loadDataTable"
        :row-key="(row) => row.id"
      />
      <n-modal
        v-model:show="addNewTrayDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 800px; max-width: 800px"
        title="添加托盘"
      >
        <edit-tray-dialog @saved="reloadTable" :row="currentModel" />
      </n-modal>
    </div>
  </n-card>
</template>

<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';
  import { BasicTable } from '@/components/Table';
  import { $ref } from 'vue/macros';
  import { statusColumnSelect, timeColumn } from '@/views/bolita-views/composable/useableColumns';
  import dayjs from 'dayjs';
  import { getUserCustomerList } from '@/api/dataLayer/common/power';
  import { asyncCustomer, generateOptionFromArray } from '@/store/utils/utils';
  import FileSaver from 'file-saver';
  import {
    getTaskListByFilter,
    getTaskListByFilterWithPagination,
    updateTask,
  } from '@/api/newDataLayer/TaskList/TaskList';
  import { NButton, useMessage } from 'naive-ui';
  import * as XLSX from 'xlsx';
  import SingleFilterBar from '@/views/bolita-views/composable/SingleFilterBar.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { createPaginationPlaceholders } from '@/api/newDataLayer/Common/Common';
  import {
    allDeliveryMethod,
    allInStatusList,
    allOutboundMethod,
  } from '@/views/newViews/Missions/AlreadyWarehousing/columns';
  import { useUploadDialog } from '@/store/modules/uploadFileState';
  import EditTrayDialog from '@/views/newViews/OperationDetail/NotOutbound/dialog/EditTrayDialog.vue';
  import { useUserStore } from '@/store/modules/user';
  import { addOrUpdateTaskTimeLine } from '@/api/newDataLayer/TimeLine/TimeLine';

  const showModal = ref(false);
  let editDetailModel = ref(false);
  let filterObj: any | null = $ref(null);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);
  let typeMission = ref('');
  let allList: any | null = $ref([]);
  let addNewTrayDialog = $ref(false);
  const filters: FormField[] = [
    asyncCustomer(),
    {
      label: '柜号',
      field: 'containerId',
    },
    {
      label: '票号',
      field: 'ticketId',
    },
  ];
  const columns = [
    {
      type: 'selection',
      fixed: 'left',
      width: 50,
    },
    {
      title: '客户',
      fixed: 'left',
      key: 'customer.customerName',
      width: 100,
    },
    {
      title: '柜号',
      fixed: 'left',
      key: 'containerId',
      width: 160,
    },
    {
      title: '票号',
      fixed: 'left',
      key: 'ticketId',
      width: 120,
    },
    {
      title: 'Ref',
      key: 'ref',
      width: 120,
    },
    {
      title: '价格',
      key: 'suggestedPrice',
      width: 120,
    },
    {
      title: '滞留时间',
      key: 'storageTime',
      width: 100,
    },
    statusColumnSelect({
      title: '状态',
      key: 'inStatus',
      list: generateOptionFromArray(allInStatusList),
    }),
    {
      title: '总实重',
      key: 'weight',
    },
    {
      title: '总体积',
      key: 'volume',
    },
    {
      title: '尺寸',
      key: 'size',
    },
    {
      title: '包装',
      key: 'packing',
    },
    {
      title: '客户备注',
      key: 'normalNote',
      width: 96,
    },
    {
      title: 'FBA单号',
      key: 'fbaDeliveryCode',
      width: 100,
    },
    {
      title: '国家',
      key: 'country',
      width: 60,
    },
    {
      title: '邮编',
      key: 'postcode',
    },
    {
      title: 'FC',
      key: 'fcAddress',
    },
    {
      title: '送货地址',
      key: 'address',
      width: 100,
    },
    {
      title: '出库方式',
      key: 'outboundMethod',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(allOutboundMethod),
      },
      width: 100,
    },
    {
      title: '物流渠道',
      key: 'deliveryMethod',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(allDeliveryMethod),
      },
      width: 100,
    },
    {
      title: '库内操作',
      key: 'operateInStorage',
      width: 96,
    },
    {
      title: '换单',
      key: 'changeOrderFiles',
      component: 'NSelect',
      componentProps: {
        options: [
          { label: '是', value: '是' },
          { label: '否', value: '否' },
        ],
      },
    },
    {
      title: '尾板',
      key: 'tailgate',
      component: 'NSelect',
      componentProps: {
        options: [
          { label: '是', value: '是' },
          { label: '否', value: '否' },
        ],
      },
    },
    {
      title: '仓库',
      key: 'inventory.name',
      width: 100,
    },
    {
      title: '预报/实际件数',
      key: 'numberDisplay',
      width: 120,
    },
    {
      title: '预报/实际托数',
      key: 'trayDisplay',
      width: 120,
    },
    timeColumn('planArriveDateTime', '预期到仓日期'),
    timeColumn('arriveTime', '实际到仓日期'),
    timeColumn('deliveryTime', '预计发货时间'),
    timeColumn('outBoundTime', '实际发货时间'),
    {
      title: '出库件数',
      key: 'outContainerNum',
      width: 100,
    },
    {
      title: '出库托数',
      key: 'outTrayNum',
      width: 100,
    },
    {
      title: 'po',
      key: 'po',
    },
    {
      title: 'ISA',
      key: 'isa',
    },
    {
      title: 'Versand Nr',
      key: 'isa',
    },
  ].map((it) => {
    it.ellipsis = {
      tooltip: true,
    };
    return it;
  });

  const actionRef = ref();
  const props = defineProps<Prop>();

  interface Prop {
    belongsToId?: string;
  }
  let selectedTaskList = $ref([]);
  let allTaskList = $ref([]);

  async function handleCheck(rowKeys) {
    checkedRows = rowKeys;
    const currentPageSelected = allTaskList.filter((item) => rowKeys.includes(item.id));
    // 合并到全局选中集合
    selectedTaskList = [
      ...selectedTaskList.filter(
        (item) => !allTaskList.some((pageItem) => pageItem.id === item.id)
      ),
      ...currentPageSelected,
    ];
  }

  function showTaskTray() {
    currentModel = selectedTaskList[0];
    addNewTrayDialog = true;
  }

  const message = useMessage();

  async function handleFileUpload(fieldName) {
    if (selectedTaskList.length !== 1) return;

    currentModel = selectedTaskList[0];
    const upload = useUploadDialog();
    const files = await upload.upload(currentModel[fieldName]);

    if (files.checkPassed) {
      currentModel[fieldName] = files.files;
      await updateTask(currentModel);
    }

    await actionRef.value.reload();
  }

  async function confirmEdit() {
    const currentTask = Object.assign({}, selectedTaskList[0]);
    currentTask.operateInStorage = '否';
    const userInfo = useUserStore().info;
    await addOrUpdateTaskTimeLine({
      useType: 'normal',
      bolitaTaskId: currentTask.id,
      operator: userInfo?.realName,
      detailTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      note: '完成库内操作',
    });
    await updateTask(currentTask);
    await actionRef.value.reload();
  }

  async function changeOrderFiles() {
    await handleFileUpload('changeOrder');
  }

  async function operationPic() {
    await handleFileUpload('operationFiles');
  }

  async function problemPic() {
    await handleFileUpload('problemFiles');
  }

  async function getAllTaskListByFilter() {
    await getCurrentFilter();

    // Get paginated data
    return await getTaskListByFilter(currentFilter);
  }

  async function downloadData() {
    let selectedList = [];
    selectedList = await getAllTaskListByFilter();
    // Create a 2D array for Excel data
    const data = [];
    const headers = columns.filter((it) => it.title).map((it) => it.title);
    data.push(headers);

    // Add data rows
    selectedList.forEach((item) => {
      const row = [];
      columns
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
            } else if (col.key === 'arriveTime' && item[col.key]) {
              row.push(dayjs(item[col.key]).format('YYYY-MM-DD'));
            } else if (col.key === 'deliveryTime' && item[col.key]) {
              row.push(dayjs(item[col.key]).format('YYYY-MM-DD'));
            } else if (col.key === 'outBoundTime' && item[col.key]) {
              row.push(dayjs(item[col.key]).format('YYYY-MM-DD HH:mm:ss'));
            } else if (col.key === 'currentDate' && item[col.key]) {
              row.push(dayjs(item[col.key][0]).format('YYYY-MM-DD'));
            } else {
              row.push(item[col.key] || '');
            }
          } else {
            row.push('');
          }
        });

      // Only add non-empty rows to the data array
      // Check if the row has at least one non-empty value
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
    FileSaver.saveAs(blob, '任务明细.xlsx');
  }

  const paginationReactive = reactive({
    defaultPage: 1,
    pageNumber: 0,
    pageSize: 10,
    defaultPageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    onChange: (page: number) => {
      paginationReactive.pageNumber = page - 1;
      reloadTable();
    },
    onUpdatePageSize: (pageSize: number) => {
      paginationReactive.pageSize = pageSize;
      paginationReactive.pageNumber = 0;
      reloadTable();
    },
  });
  let currentFilter = $ref([]);

  async function getCurrentFilter() {
    currentFilter = [];
    currentFilter['operateInStorage'] = '是';
    currentFilter['inStatusNotIn'] = ['已拆分', '已取消'];
    if (filterObj) {
      currentFilter = filterObj;
      const customerId = await getUserCustomerList();
      if (!filterObj['customer.id']) {
        currentFilter['customerIds'] = customerId;
      } else {
        currentFilter['customerIds'] = [filterObj['customer.id']];
      }
      if (currentFilter['containerId']) {
        currentFilter['containerIdLike'] = currentFilter['containerId'];
      }
      if (currentFilter['ticketId']) {
        currentFilter['ticketIdLike'] = currentFilter['ticketId'];
      }
    }
  }

  const loadDataTable = async () => {
    await getCurrentFilter();
    const res = await getTaskListByFilterWithPagination(currentFilter, paginationReactive);
    allList = res.rows.map((it) => {
      it.numberDisplay = it.number + '/' + it.arrivedContainerNum;
      it.trayDisplay = it.trayNum + '/' + it.arrivedTrayNum;
      return it;
    });
    const totalCount = res.totalRowCount;
    // Create pagination placeholders
    const { fakeListStart, fakeListEnd } = createPaginationPlaceholders(
      paginationReactive.pageNumber,
      paginationReactive.pageSize,
      totalCount
    );
    allList.forEach((it) => {
      if (it.trayItems.length > 0) {
        it.trayDisplay = it.trayItems.map(
          (a) => a.trayType + '(' + a.size + ')' + '*' + a.amount + ' / '
        );
      }
      // todo 滞留时间
      if (it.outboundForecast?.outDate || !it.arriveTime) {
        it.storageTime = '/';
      } else {
        it.storageTime = dayjs().diff(dayjs(it.arriveTime), 'hour') ?? '/';
      }
    });
    allTaskList = [...fakeListStart, ...allList, ...fakeListEnd];
    return allTaskList;
  };

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  async function reloadTable() {
    showModal.value = false;
    editDetailModel.value = false;
    addNewTrayDialog = false;
    checkedRows = [];
    selectedTaskList = [];
    await actionRef.value.reload();
  }

  onMounted(async () => {
    await reloadTable();
  });
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
