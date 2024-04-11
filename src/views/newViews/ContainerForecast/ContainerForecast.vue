<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter">
      <n-button size="small" type="info" @click="addTable(NotifyType.Container)">
        <template #icon>
          <n-icon>
            <Box20Filled />
          </n-icon>
        </template>
        新建货柜预报
      </n-button>
      <n-button size="small" type="info" @click="downloadFiles">
        <template #icon>
          <n-icon>
            <Box20Filled />
          </n-icon>
        </template>
        卸柜业务流程
      </n-button>
      <n-button size="small" type="info" @click="downloadFiles">
        <template #icon>
          <n-icon>
            <Box20Filled />
          </n-icon>
        </template>
        货柜预报填写注意事项
      </n-button>
      <n-button size="small" type="info" @click="selectedHeader">
        <template #icon>
          <n-icon>
            <Box20Filled />
          </n-icon>
        </template>
        选择表头显示
      </n-button>
      <n-button size="small" @click="clearAllData()">
        <template #icon>
          <n-icon>
            <TruckDelivery />
          </n-icon>
        </template>
        清除数据
      </n-button>
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
          :columns="currentColumns"
          :request="loadDataTable"
          :row-key="(row) => row.id"
        />
      </n-tab-pane>
    </n-tabs>
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
      title="卸柜表"
      style="width: 90%; min-width: 600px; max-width: 800px"
    >
      <notify-unload-form @save="reloadTable" :notify-id="currentNotifyId!" />
    </n-modal>
    <n-modal
      v-model:show="showFeeDialog"
      :show-icon="false"
      preset="dialog"
      title="费用表"
      style="width: 90%; min-width: 600px; max-width: 800px"
    >
      <notify-fee-dialog :notify-id="currentNotifyId!" @save="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="showWarehouseDialog"
      :show-icon="false"
      preset="dialog"
      title="仓库信息"
      style="width: 90%; min-width: 600px; max-width: 800px"
    >
      <warehouse-info-dialog :notify-id="currentNotifyId!" />
    </n-modal>
    <n-modal
      v-model:show="showUnloadingList"
      :show-icon="false"
      preset="dialog"
      title="卸柜单"
      style="width: 90%; min-width: 600px; max-width: 1000px"
    >
      <unloading-list @save="reloadTable" :notify-id="currentNotifyId!" />
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
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import { Box20Filled } from '@vicons/fluent';
  import {
    CashStatus,
    InBoundStatus,
    NotifyManager,
    NotifyType,
  } from '@/api/dataLayer/modules/notify/notify-api';
  import { $ref } from 'vue/macros';
  import { TruckDelivery } from '@vicons/tabler';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { clearAllData } from '@/api/dataLayer/clearAllData';
  import { handleRequest, toastSuccess } from '@/store/utils/utils';
  import NotifyUnloadForm from '@/views/newViews/ContainerForecast/form/NotifyUnloadForm.vue';
  import NotifyFeeDialog from '@/views/newViews/ContainerForecast/form/NotifyFeeDialog.vue';
  import WarehouseInfoDialog from '@/views/newViews/ContainerForecast/form/WarehouseInfoDialog.vue';
  import ContainerForecastIndex from '@/views/newViews/ContainerForecast/form/ContainerForecastIndex.vue';
  import { dateCompare, OneYearMonthTab } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';
  import UnloadingList from '@/views/newViews/ContainerForecast/form/UnloadingList.vue';
  import SelectedHeaderTable from '@/views/newViews/Missions/AlreadyWarehousing/SelectedHeaderTable.vue';
  import { getTableHeader } from '@/api/dataLayer/common/TableHeader';

  let notifyType: NotifyType = $ref(NotifyType.Container);
  let currentModel: any | null = $ref(null);
  let showCurrentHeaderDataTable = $ref(false);
  const showModal = ref(false);
  let selectedMonth: any | null = $ref('');
  let monthTab: any | null = $ref(null);
  let showOperationTable = $ref(false);
  let currentNotifyId: string | null = $ref(null);
  let showWarehouseDialog = $ref(false);
  let showFeeDialog = $ref(false);
  let filterObj: any | null = $ref(null);
  let showUnloadingList = $ref(false);
  let currentHeader = $ref([]);
  let currentColumns = $ref([]);

  function addTable(type: NotifyType) {
    notifyType = type;
    currentModel = null;
    showModal.value = true;
  }

  onMounted(async () => {
    await reloadHeader();
    monthTab = OneYearMonthTab();
    selectedMonth = monthTab[0];
  });

  const loadDataTable = async () => {
    const res = (await NotifyManager.load(filterObj)).filter(
      (x) => dayjs(x.createTimestamp).format('YYYY-MM') === selectedMonth
    );
    console.log(res, 'res');
    return res.sort(dateCompare('planArriveDateTime'));
  };

  const actionRef = ref();

  function updateFilter(value) {
    if (value !== null) {
      let { filterTitle, filterKey, ...NewObj } = value;
      if (value['filterTitle'] && value['filterKey']) {
        const res = columns.find((it) => it.title === value['filterTitle']).key;
        NewObj[res] = value['filterKey'];
      }
      filterObj = NewObj;
    } else {
      filterObj = null;
    }
    reloadTable();
  }

  async function reloadHeader() {
    currentColumns = [];
    currentHeader = await getTableHeader('containerForecast');
    currentHeader.forEach((item) => {
      const res = columns.find((it) => it.key === item.key);
      currentColumns.push(res);
    });
    const selectionType = columns.find((x) => x.type === 'selection');
    if (selectionType) {
      currentColumns.unshift(selectionType);
    }
    currentColumns = currentColumns.length > 0 ? currentColumns : columns;
    showCurrentHeaderDataTable = false;
  }

  async function startEdit(id) {
    currentModel = await NotifyManager.getById(id);
    showModal.value = true;
  }

  async function selectedHeader() {
    showCurrentHeaderDataTable = true;
    console.log(columns, 'columns');
  }

  function reloadTable() {
    actionRef.value[0].reload();
    showOperationTable = false;
    showFeeDialog = false;
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
      const fileAction = (label, key, icon?: Component) => {
        return getFileActionButton(label, key, NotifyManager, reloadTable, record, icon);
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
          fileAction('上传卸柜单', 'unloadingFile'),
          {
            label: '生成卸柜单',
            onClick() {
              currentNotifyId = record.id!;
              showUnloadingList = true;
            },
            ifShow: () => {
              return !record?.unloadingFile;
            },
          },
          {
            label: '卸柜',
            onClick() {
              currentNotifyId = record.id!;
              showOperationTable = true;
            },
          },
          {
            label: '预报文件',
            onClick() {
              window.open(record.files[0]);
            },
          },
          {
            label: '取消',
            async onClick() {
              const res = await NotifyManager.edit(
                {
                  inStatus: '已取消',
                },
                record.id
              );
              await handleRequest(res, () => {
                toastSuccess('success');
                reloadTable();
              });
            },
          },
          {
            label: '结算',
            highlight: () => {
              if (record?.editValue?.cashStatus == CashStatus.Done) {
                return 'success';
              }
            },
            onClick() {
              currentNotifyId = record.id!;
              showFeeDialog = true;
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
