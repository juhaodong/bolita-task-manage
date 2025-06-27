<template>
  <n-card v-if="hasAuthPower('inStorageView')" :bordered="false" class="proCard">
    <div>
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
          class="action-button"
          size="small"
          type="primary"
          @click="selectedHeader"
        >
          <template #icon>
            <n-icon>
              <TableSettings20Regular />
            </n-icon>
          </template>
          选择表头显示
        </n-button>
        <n-button
          class="action-button"
          size="small"
          type="primary"
          @click="finishedCancel"
        >
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          操作完成
        </n-button>
        <n-button
          class="action-button"
          size="small"
          type="success"
          @click="downloadData"
        >
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
        :request="loadDataTable"
        :row-key="(row) => row.id"
      />
      <n-modal
        v-model:show="showModal"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 600px; max-width: 1200px"
        title="出库计划"
      >
        <new-outbound-plan @saved="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="editDetailModel"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 600px; max-width: 600px"
        title="编辑详情"
      >
        <edit-mission-detail :model="currentModel" @saved="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="addNewFeeDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 800px; max-width: 800px"
        title="新建费用"
      >
        <new-total-fee :current-data="currentData" @saved="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="addNewTrayDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 800px; max-width: 800px"
        title="添加托盘"
      >
        <new-tray-dialog :current-data="recordData" @saved="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="showCurrentHeaderDataTable"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 800px; max-width: 800px"
        title="添加表头"
      >
        <selected-header-table :all-columns="columns" :type="'taskList'" @saved="reloadHeader" />
      </n-modal>
      <n-modal
        v-model:show="showTimeLine"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 800px; max-width: 800px"
        title="时间线"
      >
        <time-line :ids="currentId" />
      </n-modal>
      <n-modal
        v-model:show="showConfirmDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 400px; max-width: 400px"
        title="请确认"
      >
        <confirm-dialog :title="'您确定要执行这个操作吗？'" @saved="confirmFinish" />
      </n-modal>
    </div>
  </n-card>
  <no-power-page v-else />
</template>

<script lang="ts" setup>
  import { Component, computed, h, onMounted, reactive, ref } from 'vue';
  import { NIcon, NTooltip } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from '@/views/newViews/Missions/AlreadyWarehousing/columns';
  import { $ref } from 'vue/macros';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
  import { InBoundDetailStatus, InBoundStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import { 
    ArrowDownload20Regular,
    Box20Filled,
    TableSettings20Regular,
    DocumentEdit20Regular,
    Image20Regular,
    Document20Regular
  } from '@vicons/fluent';
  import NewOutboundPlan from '@/views/newViews/OutboundPlan/NewOutboundPlan.vue';
  import dayjs from 'dayjs';
  import EditMissionDetail from '@/views/newViews/Missions/AlreadyWarehousing/EditMissionDetail.vue';
  import NewTotalFee from '@/views/newViews/SettlementManage/NewTotalFee.vue';
  import NewTrayDialog from '@/views/newViews/Missions/AlreadyWarehousing/NewTrayDialog.vue';
  import SelectedHeaderTable from '@/views/newViews/Missions/AlreadyWarehousing/SelectedHeaderTable.vue';
  import TimeLine from '@/views/newViews/Missions/AlreadyWarehousing/TimeLine.vue';
  import { useUserStore } from '@/store/modules/user';
  import { getUserCustomerList, hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import { generateOptionFromArray } from '@/store/utils/utils';
  import { valueOfToday } from '@/api/dataLayer/common/Date';
  import ConfirmDialog from '@/views/newViews/Common/ConfirmDialog.vue';
  import { inStorageObj } from '@/views/newViews/Missions/AlreadyWarehousing/selectionType';
  import FileSaver from 'file-saver';
  import {
    addOrUpdateTask,
    getTaskListByFilter,
    getTaskListByIds,
  } from '@/api/newDataLayer/TaskList/TaskList';
  import { addOrUpdateTaskTimeLine } from '@/api/newDataLayer/TimeLine/TimeLine';
  import { getTableHeaderGroupItemList } from '@/api/newDataLayer/Header/HeaderGroup';
  import { useUploadDialog } from '@/store/modules/uploadFileState';
  import * as XLSX from 'xlsx';

  const showModal = ref(false);
  let editDetailModel = ref(false);

  let filterObj: any | null = $ref(null);
  let addNewFeeDialog = $ref(false);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);
  let monthTab: any | null = $ref(null);
  let typeMission: any | null = $ref('');
  let selectedMonth: any | null = $ref('');
  let currentData: any | null = $ref('');
  let recordData: any | null = $ref('');
  let allList: any | null = $ref([]);
  let addNewTrayDialog = $ref(false);
  let showCurrentHeaderDataTable = $ref(false);
  let currentHeader = $ref([]);
  let currentColumns = $ref([]);
  let currentId = $ref('');
  let showTimeLine = $ref(false);
  let optionOne = $ref('');
  let optionTwo = $ref('');
  let valueOne = $ref('');
  let valueTwo = $ref('');
  let dateRange = $ref(null);
  let showConfirmDialog = $ref(false);
  let cancelIds = $ref([]);
  let showAll = $ref(false);
  let filterItems = $ref<Array<{ option: string; value: string }>>([]);
  const actionRef = ref();
  const props = defineProps<Prop>();
  interface Prop {
    belongsToId?: string;
  }

  async function startEdit(id) {
    currentModel = await NotifyDetailManager.getById(id);
    editDetailModel.value = true;
  }

  async function selectedHeader() {
    showCurrentHeaderDataTable = true;
  }

  async function startAddTray(id) {
    addNewTrayDialog = true;
  }

  const realOptions = computed(() => {
    return generateOptionFromArray(columns.filter((it) => it.key).map((it) => it.title));
  });

  const loadDataTable = async () => {
    let currentFilter = [
      {
        field: 'inStatus',
        op: 'in',
        value: ['入库待操作'],
      },
    ];
    if (filterObj) {
      const res = Object.keys(filterObj);

      for (const filterItem of res) {
        currentFilter.push({
          field: filterItem,
          op: filterObj[filterItem] ? 'like' : '!=',
          value: '%' + filterObj[filterItem] + '%' ?? '',
        });
      }
    }
    const customerId = await getUserCustomerList();
    currentFilter.push({ field: 'customer.id', op: 'in', value: customerId });
    allList = await getTaskListByFilter(currentFilter);
    allList.forEach((it) => {
      const storageTime = it.timelines.filter((x) => x.useType === 'storage');
      let stayTime = '';
      if (storageTime) {
        for (let i = 0; i < storageTime.length - 1; i += 2) {
          stayTime =
            stayTime +
            dayjs(storageTime[i].detailTime).diff(dayjs(storageTime[i + 1].detailTime), 'day');
        }
        const timeListLength = storageTime.length;
        if (timeListLength % 2 !== 0) {
          stayTime =
            stayTime + dayjs().diff(dayjs(storageTime[timeListLength - 1].detailTime), 'day');
        }
        it.stayTime = stayTime;
      } else {
        it.stayTime = '-';
      }
    });
    if (dateRange) {
      let startDate = dayjs(dateRange[0]).startOf('day').valueOf() ?? valueOfToday[0];
      let endDate = dayjs(dateRange[1]).endOf('day').valueOf() ?? valueOfToday[1];
      allList = allList.filter(
        (it) => it.createTimestamp > startDate && it.createTimestamp < endDate
      );
    }
    return allList;
  };

  async function downloadData() {
    let selectedList = [];
    selectedList = await loadDataTable();
    let headerTitle = columns.filter((it) => it.title).map((it) => it.title);
    let data = [];
    data.unshift(headerTitle);
    selectedList.forEach((it) => {
      const res = [
        it.customer?.customerName ?? '', //客户
        it.containerId ?? '', //柜号
        it.ticketId ?? '', //票号
        it.country ?? '', //国家
        it.number ?? '', //预报件数
        it.arrivedContainerNum ?? '', // 实际件数
        it.weight ?? '', //总实重
        it.volume ?? '', //总体积
        it.size ?? '', //尺寸
        it.inStatus ?? '', //状态
        it.inventory?.name ?? '', //仓库
        it.stayTime ?? '', //留仓时间
        it.deliveryIdIn ?? '', //运单号
        it.normalNote ?? '', //客户备注
        it.FBADeliveryCode ?? '', //FBA单号
        it.outboundMethod ?? '', //出库方式
        it.deliveryMethod ?? '', //物流渠道
        it.operationRequire ?? '', //操作要求
        it.operationNote ?? '', //操作备注
        it.finalStatus ?? '', //结算状态
        it.PO ?? '', //PO
        it.FCAddress ?? '', //FC/送货地址
        it.postcode ?? '', //邮编
        it.inBoundDetailStatus ?? '', //审核状态
        it.changeOrderFiles ?? '', //换单文件
        it.transportationNote ?? '', //送货备注
        it.trayNum ?? '', //预报托数
        it.trayDisplay ?? '', //托盘规格
        it.arrivedTrayNum ?? '', //实际托数
        it.planArriveDateTime ? dayjs(it.planArriveDateTime).format('YYYY-MM-DD') : '', //预期到仓日期
        it.currentDate ? dayjs(it.currentDate[0]).format('YYYY-MM-DD') : '', //实际到仓日期
        it.deliveryTime ? dayjs(it.deliveryTime).format('YYYY-MM-DD') : '', //发货时间
        it.outBoundTime ? dayjs(it.outBoundTime).format('YYYY-MM-DD HH:ss:mm') : '', //预计取货时间
        it.Ref ?? '', //REF
        it.note ?? '', //仓库备注
        it.warehouseLocation ?? '', //库位
        it.sign ?? '', //分拣标识
        it.package ?? '', //包装
        it.industrialTrayNum ?? '', //托数
        it.productName ?? '', //品名
        it.UNNumber ?? '', //UN号
        it.recipient ?? '', //收件人
        it.phone ?? '', //电话
        it.email ?? '', //邮箱
        it.needReserve ?? '', //是否需要预约
        it.industrialNote ?? '', //工业品备注
      ];
      data.push(res);
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
    FileSaver.saveAs(blob, '库内操作看板.xlsx');
  }

  function updateFilter(value) {
    if (value !== null) {
      // Apply additional filters from the filter inputs
      if (optionOne && valueOne) {
        const keyOne = columns.find((it) => it.title === optionOne)?.key;
        if (keyOne) {
          value[keyOne] = valueOne;
        }
      }

      if (optionTwo && valueTwo) {
        const keyTwo = columns.find((it) => it.title === optionTwo)?.key;
        if (keyTwo) {
          value[keyTwo] = valueTwo;
        }
      }

      filterObj = value;
    } else {
      // Reset all filters
      filterObj = null;
      optionOne = '';
      valueOne = '';
      optionTwo = '';
      valueTwo = '';
      dateRange = null;
      filterItems = [];
    }

    // Reload the table with the new filters
    reloadTable();
  }

  function updateFilterWithItems(value) {
    filterObj = value;
    reloadTable();
  }

  function checkCashStatus(id) {
    currentData = allList.find((it) => it.id === id);
    addNewFeeDialog = true;
  }

  async function reloadHeader() {
    currentColumns = [];
    currentHeader = (await getTableHeaderGroupItemList('taskList'))
      ? JSON.parse((await getTableHeaderGroupItemList('taskList'))?.headerItemJson)
      : [];
    currentHeader.forEach((item) => {
      const res = columns.find((it) => it.key === item.itemKey);
      currentColumns.push(res);
    });
    currentColumns = currentColumns.length > 0 ? currentColumns : columns;
    currentColumns = [inStorageObj, ...currentColumns];
    currentColumns.forEach((item) => {
      item.resizable = true;
    });
    showCurrentHeaderDataTable = false;
  }

  async function reloadTable() {
    showModal.value = false;
    editDetailModel.value = false;
    addNewFeeDialog = false;
    addNewTrayDialog = false;
    showCurrentHeaderDataTable = false;
    showConfirmDialog = false;
    await actionRef.value.reload();
  }

  function getQueryString(name) {
    return (
      decodeURIComponent(
        (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [
          '',
          '',
        ])[1].replace(/\+/g, '%20')
      ) || null
    );
  }

  function finishedCancel() {
    cancelIds = checkedRows;
    showConfirmDialog = true;
  }

  async function confirmFinish() {
    const userInfo = useUserStore().info;
    const currentList = await getTaskListByIds(cancelIds);
    for (const currentItem of currentList) {
      currentItem.operateInStorage = '否';
      if (currentItem.outboundMethod !== '存仓') {
        currentItem.inStatus = InBoundStatus.All;
      } else {
        currentItem.inStatus = '存仓';
      }
      currentItem.customerId = currentItem.customer.id;
      currentItem.inventoryId = currentItem.inventory.id;
      await addOrUpdateTaskTimeLine({
        useType: 'normal',
        bolitaTaskId: currentItem.id,
        operator: userInfo?.realName,
        detailTime: dayjs().valueOf(),
        note: '完成库内操作',
      });
      await addOrUpdateTask(currentItem);
    }
    await reloadTable();
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

  onMounted(async () => {
    await reloadHeader();
    const res = getQueryString('containerId');
    if (res) {
      updateFilter({ containerId: res });
    } else {
      await reloadTable();
    }
  });

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 200,
    render(record: any) {
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
                await addOrUpdateTask(record);
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
            icon: renderIconWithTooltip(Box20Filled, '操作已完成'),
            highlight: () => {
              return 'info';
            },
            async onClick() {
              cancelIds = [];
              cancelIds.push(record.id);
              showConfirmDialog = true;
            },
            ifShow: () => {
              return record.operateInStorage === '是' && hasAuthPower('inStorageTurnToOut');
            },
          },
          {
            icon: renderIconWithTooltip(Document20Regular, '换单文件'),
            highlight: () => {
              return record?.['changeOrder']?.length > 0 ? 'success' : 'error';
            },
            ifShow: () => {
              return record?.changeOrderFiles === '是' && hasAuthPower('missionChangeFile');
            },
            async onClick() {
              const upload = useUploadDialog();
              const files = await upload.upload(record['changeOrder']);
              const userInfo = useUserStore().info;
              if (files.checkPassed) {
                record['changeOrder'] = files.files;
                if (!record.arriveTime) {
                  record['inStatus'] = InBoundDetailStatus.WaitCheck;
                }
                await addOrUpdateTaskTimeLine({
                  useType: 'normal',
                  bolitaTaskId: record.id,
                  operator: userInfo?.realName,
                  detailTime: dayjs().valueOf(),
                  note: '提交了换单文件',
                });
                record.customerId = record.customer.id;
                record.inventoryId = record.inventory.id;
                await addOrUpdateTask(record);
              }
              actionRef.value.reload();
            },
          },
          iconFileAction('POD', 'POD', Document20Regular, 'missionPOD'),
          iconFileAction('操作文件', 'operationFiles', DocumentEdit20Regular, 'missionOperationFile'),
          iconFileAction('问题图片', 'problemFiles', Image20Regular, 'missionProblemPic'),
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
    max-width: 1200px;
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
