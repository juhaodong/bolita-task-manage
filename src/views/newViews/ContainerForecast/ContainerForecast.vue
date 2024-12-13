<template>
  <div>
    <n-card v-if="hasAuthPower('forecastView')" :bordered="false" class="proCard">
      <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter">
        <n-button
          v-if="hasAuthPower('forecastAdd')"
          size="small"
          type="info"
          @click="addTable(NotifyType.Container)"
        >
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          新建货柜预报
        </n-button>
        <n-button size="small" type="info" @click="selectedHeader">
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          选择表头显示
        </n-button>
        <n-button size="small" type="info" @click="downloadData">
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          下载
        </n-button>
        <n-button size="small" type="info" @click="downloadFbaCode">
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          下载FBACode
        </n-button>
      </filter-bar>
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
        <n-checkbox v-model:checked="showAll" class="ml-2" label="全部" size="large" />
      </div>
      <div class="my-2"></div>
      <BasicTable
        ref="actionRef"
        :actionColumn="actionColumn"
        :columns="currentColumns"
        :request="loadDataTable"
        :row-key="(row) => row.id"
      />
      <n-modal
        v-model:show="showModal"
        :show-icon="false"
        :style="{ maxWidth: notifyType === NotifyType.TrayOrBox ? '1600px' : '800px' }"
        preset="card"
        style="width: 90%; min-width: 600px"
        title="新建货柜预报"
      >
        <container-forecast-index
          :current-model="currentModel"
          :type="notifyType"
          @saved="closeAddDialog"
        />
      </n-modal>
      <n-modal
        v-model:show="showOperationTable"
        :show-icon="false"
        preset="dialog"
        style="width: 90%; min-width: 600px; max-width: 800px"
        title="卸柜表"
      >
        <notify-unload-form :notify-id="currentNotifyId!" @save="reloadTable" />
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
      <n-modal
        v-model:show="showWarehouseDialog"
        :show-icon="false"
        preset="dialog"
        style="width: 90%; min-width: 600px; max-width: 800px"
        title="仓库信息"
      >
        <warehouse-info-dialog :notify-id="currentNotifyId!" />
      </n-modal>
      <n-modal
        v-model:show="showUnloadingList"
        :show-icon="false"
        preset="dialog"
        style="width: 90%; min-width: 600px; max-width: 1000px"
        title="卸柜单"
      >
        <unloading-list :notify-id="currentNotifyId!" @save="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="showCurrentHeaderDataTable"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 800px; max-width: 800px"
        title="添加表头"
      >
        <selected-header-table
          :all-columns="columns"
          :type="'containerForecast'"
          @saved="reloadHeader"
        />
      </n-modal>
      <n-modal
        v-model:show="showConfirmDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 400px; max-width: 400px"
        title="请确认"
      >
        <confirm-dialog :title="'您确定要取消吗？'" @saved="confirmCancel" />
      </n-modal>
      <n-modal
        v-model:show="showConfirmUnloading"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 400px; max-width: 400px"
        title="请确认"
      >
        <confirm-dialog :title="'确认货柜到库？'" @saved="confirmUnloading" />
      </n-modal>
      <n-modal
        v-model:show="showNeedCheckDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 400px; max-width: 400px"
        title="请确认"
      >
        <confirm-dialog :title="'请先审核完所有任务！'" @saved="showNeedCheckDialog = false" />
      </n-modal>
    </n-card>
    <no-power-page v-else />
  </div>
</template>

<script lang="ts" setup>
  import { Component, computed, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import { Box20Filled } from '@vicons/fluent';
  import { CashStatus, InBoundStatus, NotifyType } from '@/api/dataLayer/modules/notify/notify-api';
  import { $ref } from 'vue/macros';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { generateOptionFromArray, handleRequest, toastSuccess } from '@/store/utils/utils';
  import NotifyUnloadForm from '@/views/newViews/ContainerForecast/form/NotifyUnloadForm.vue';
  import NotifyFeeDialog from '@/views/newViews/ContainerForecast/form/NotifyFeeDialog.vue';
  import WarehouseInfoDialog from '@/views/newViews/ContainerForecast/form/WarehouseInfoDialog.vue';
  import ContainerForecastIndex from '@/views/newViews/ContainerForecast/form/ContainerForecastIndex.vue';
  import { dateCompare } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';
  import UnloadingList from '@/views/newViews/ContainerForecast/form/UnloadingList.vue';
  import SelectedHeaderTable from '@/views/newViews/Missions/AlreadyWarehousing/SelectedHeaderTable.vue';
  import { getUserCustomerList, hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import { valueOfToday } from '@/api/dataLayer/common/Date';
  import ConfirmDialog from '@/views/newViews/Common/ConfirmDialog.vue';
  import FileSaver from 'file-saver';
  import { addOrUpdateNotify, getNotifyListByFilter } from '@/api/newDataLayer/Notify/Notify';
  import { getTableHeaderGroupItemList } from '@/api/newDataLayer/Header/HeaderGroup';
  import { addOrUpdateTask, getTaskListByNotifyId } from '@/api/newDataLayer/TaskList/TaskList';
  import { addOrUpdateTaskTimeLine } from '@/api/newDataLayer/TimeLine/TimeLine';
  import { useUserStore } from '@/store/modules/user';
  import { currentBaseImageUrl } from '@/api/dataLayer/fieldDefination/common';

  let notifyType: NotifyType = $ref(NotifyType.Container);
  let currentModel: any | null = $ref(null);
  let showCurrentHeaderDataTable = $ref(false);
  const showModal = ref(false);
  let showOperationTable = $ref(false);
  let currentNotifyId: string | null = $ref(null);
  let showWarehouseDialog = $ref(false);
  let showFeeDialog = $ref(false);
  let filterObj: any | null = $ref(null);
  let showUnloadingList = $ref(false);
  let currentHeader = $ref([]);
  let currentColumns = $ref([]);
  let optionOne = $ref('');
  let optionTwo = $ref('');
  let valueOne = $ref('');
  let valueTwo = $ref('');
  let dateRange = $ref(null);
  let showConfirmDialog = $ref(false);
  let cancelRecord = $ref('');
  let currentRecord = $ref({});
  let showAll = $ref(false);
  let showConfirmUnloading = $ref(false);
  let showNeedCheckDialog = $ref(false);

  function addTable(type: NotifyType) {
    notifyType = type;
    currentModel = null;
    showModal.value = true;
  }

  onMounted(async () => {
    await reloadHeader();
  });

  const realOptions = computed(() => {
    return generateOptionFromArray(columns.filter((it) => it.key).map((it) => it.title));
  });

  async function confirmUnloading() {
    const userInfo = useUserStore().info;
    currentRecord.inStatus = '等待卸柜';
    currentRecord.arrivedInventoryTime = dayjs().valueOf();
    const res = await addOrUpdateNotify(currentRecord);
    const list = await getTaskListByNotifyId(currentRecord.id);
    for (const item of list) {
      item.inStatus = '等待卸柜';
      await addOrUpdateTask(item);
      await addOrUpdateTaskTimeLine({
        useType: 'normal',
        bolitaTaskId: item.id,
        operator: userInfo?.realName,
        detailTime: dayjs().valueOf(),
        note: '仓库接收,等待卸柜',
      });
    }
    await handleRequest(res, () => {
      toastSuccess('success');
      reloadTable();
    });
  }
  const loadDataTable = async () => {
    let currentFilter = [];
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
    let res =
      (await getNotifyListByFilter(currentFilter))
        .filter((it) => it.customer)
        .filter((x) => customerId.includes(x.customer.id)) ?? [];

    if (!showAll) {
      res = res.filter((a) => a.inStatus !== '已取消');
    }
    if (dateRange) {
      let startDate = dayjs(dateRange[0]).startOf('day').valueOf() ?? valueOfToday[0];
      let endDate = dayjs(dateRange[1]).endOf('day').valueOf() ?? valueOfToday[1];
      res = res.filter((it) => it.createTimestamp > startDate && it.createTimestamp < endDate);
    }
    return res.sort(dateCompare('planArriveDateTime'));
  };

  const actionRef = ref();

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

  async function confirmCancel() {
    const userInfo = useUserStore().info;
    cancelRecord.inStatus = '已取消';
    const res = await addOrUpdateNotify(cancelRecord);
    const list = await getTaskListByNotifyId(cancelRecord.id);
    for (const item of list) {
      item.inStatus = '已取消';
      await addOrUpdateTask(item);
      await addOrUpdateTaskTimeLine({
        useType: 'normal',
        bolitaTaskId: item.id,
        operator: userInfo?.realName,
        detailTime: dayjs().valueOf(),
        note: '取消',
      });
    }
    await handleRequest(res, () => {
      toastSuccess('success');
      reloadTable();
    });
  }

  async function downloadFbaCode() {
    window.open(
      currentBaseImageUrl + 'https://aaden-storage.s3.eu-central-1.amazonaws.com/FbaCode.xlsx'
    );
  }

  async function downloadData() {
    const selectedList = await loadDataTable();
    let headerTitle = columns.map((it) => it.title).join();
    let dataStrings = [];
    dataStrings.unshift(headerTitle);
    selectedList.forEach((it) => {
      const res = [
        dayjs(it.planArriveDateTime).format('YYYY-MM-DD') ?? '',
        it.inHouseTime ?? '',
        it.containerNo ?? '',
        it.customerName ?? '',
        it.warehouseId ?? '',
        it.arrivedCount ?? '',
        it.inStatus ?? '',
        it.unloadPerson ?? '',
        it.salesName ?? '',
        it.note ?? '',
        it.containerFinalStatus ?? '',
      ];
      dataStrings.push(res.join());
    });
    dataStrings = dataStrings.join('\n');
    const blob = new Blob([dataStrings], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, '到货预报' + '.csv');
  }

  async function reloadHeader() {
    currentColumns = [];
    currentHeader = (await getTableHeaderGroupItemList('containerForecast'))
      ? JSON.parse((await getTableHeaderGroupItemList('containerForecast'))?.headerItemJson)
      : [];
    currentHeader.forEach((item) => {
      const res = columns.find((it) => it.key === item.itemKey);
      currentColumns.push(res);
    });
    const selectionType = columns.find((x) => x.type === 'selection');
    if (selectionType) {
      currentColumns.unshift(selectionType);
    }
    currentColumns = currentColumns.length > 0 ? currentColumns : columns;
    currentColumns.forEach((item) => {
      item.resizable = true;
    });
    showCurrentHeaderDataTable = false;
  }

  async function startEdit(record) {
    currentModel = record;
    showModal.value = true;
  }

  async function checkContainerStatus(record) {
    if (record?.inStatus === InBoundStatus.Wait) {
      currentRecord = record;
      showConfirmUnloading = true;
    } else if (record?.inStatus === InBoundStatus.WaitUnloading) {
      currentNotifyId = record.id!;
      showOperationTable = true;
    } else if (record?.inStatus === InBoundStatus.WaitCheck) {
      showNeedCheckDialog = true;
    }
  }

  async function selectedHeader() {
    showCurrentHeaderDataTable = true;
  }

  function reloadTable() {
    actionRef.value.reload();
    showOperationTable = false;
    showFeeDialog = false;
    showConfirmDialog = false;
    showConfirmUnloading = false;
  }

  async function downloadFiles() {
    window.open(
      'https://firebasestorage.googleapis.com/v0/b/bolita-task-manage.appspot.com/o/bolita%2F1704376613996-%E6%AD%A3%E6%96%B9%E5%BD%A2%E8%BF%AA%E8%BF%A6.png?alt=media&token=9ad0dc83-b898-4309-9d7f-c600fa4123de',
      '_blank'
    );
  }

  async function closeAddDialog() {
    reloadTable();
    showModal.value = false;
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record: any) {
      const fileAction = (label, key, icon?: Component, power) => {
        return getFileActionButton(label, key, addOrUpdateNotify, reloadTable, record, icon, power);
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '修改',
            onClick() {
              startEdit(record);
            },
            ifShow: () => {
              return hasAuthPower('forecastEdit');
            },
          },
          fileAction('上传卸柜单', 'unloadingFile', '', 'forecastUpload'),
          {
            label: '生成卸柜单',
            onClick() {
              currentNotifyId = record.id!;
              showUnloadingList = true;
            },
            ifShow: () => {
              return hasAuthPower('forecastCreatFile') && !record?.unloadingFile;
            },
          },
          {
            label: '卸柜',
            onClick() {
              checkContainerStatus(record);
            },
            highlight: () => {
              if (
                record?.inStatus === InBoundStatus.WaitCheck ||
                record?.inStatus === InBoundStatus.Wait
              ) {
                return 'error';
              } else if (record?.inStatus === InBoundStatus.WaitUnloading) {
                return 'info';
              } else {
                return 'success';
              }
            },
            ifShow: () => {
              return hasAuthPower('forecastDownload');
            },
          },
          {
            label: '预报文件',
            onClick() {
              const files = record.files.split(',');
              window.open(files[0]);
            },
          },
          {
            label: '取消',
            async onClick() {
              cancelRecord = record;
              showConfirmDialog = true;
            },
            ifShow: () => {
              return hasAuthPower('forecastCancel');
            },
          },
          {
            label: '结算',
            highlight: () => {
              if (record?.editValue?.cashStatus == CashStatus.Done) {
                return 'success';
              }
            },
            ifShow: () => {
              return hasAuthPower('forecastSettle');
            },
            onClick() {
              currentNotifyId = record.id!;
              console.log(currentNotifyId, 'id');
              showFeeDialog = true;
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
