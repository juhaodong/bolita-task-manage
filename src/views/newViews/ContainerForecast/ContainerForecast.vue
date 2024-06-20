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
        <!--        <n-button size="small" type="info" @click="downloadFiles">-->
        <!--          <template #icon>-->
        <!--            <n-icon>-->
        <!--              <Box20Filled />-->
        <!--            </n-icon>-->
        <!--          </template>-->
        <!--          卸柜业务流程-->
        <!--        </n-button>-->
        <!--        <n-button size="small" type="info" @click="downloadFiles">-->
        <!--          <template #icon>-->
        <!--            <n-icon>-->
        <!--              <Box20Filled />-->
        <!--            </n-icon>-->
        <!--          </template>-->
        <!--          货柜预报填写注意事项-->
        <!--        </n-button>-->
        <n-button size="small" type="info" @click="selectedHeader">
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          选择表头显示
        </n-button>
        <!--        <n-button size="small" @click="clearAllData()">-->
        <!--          <template #icon>-->
        <!--            <n-icon>-->
        <!--              <TruckDelivery />-->
        <!--            </n-icon>-->
        <!--          </template>-->
        <!--          清除数据-->
        <!--        </n-button>-->
        <n-button size="small" type="info" @click="downloadData">
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          下载
        </n-button>
      </filter-bar>
      <div class="mt-2" style="display: flex; align-items: center; justify-items: center">
        <n-card embedded size="small" style="max-width: 300px">
          <div style="display: flex">
            <n-select
              placeholder="过滤项1"
              style="width: 130px"
              v-model:value="optionOne"
              :options="realOptions"
            />
            <n-input
              class="ml-2"
              style="width: 130px"
              v-model:value="valueOne"
              type="text"
              placeholder="过滤值1"
            />
          </div>
        </n-card>
        <n-card class="ml-2" embedded size="small" style="max-width: 300px">
          <div style="display: flex">
            <n-select
              placeholder="过滤项2"
              style="width: 130px"
              v-model:value="optionTwo"
              :options="realOptions"
            />
            <n-input
              class="ml-2"
              style="width: 130px"
              v-model:value="valueTwo"
              type="text"
              placeholder="过滤值2"
            />
          </div>
        </n-card>
        <n-date-picker
          :default-value="[dayjs().valueOf(), dayjs().valueOf()]"
          class="ml-2"
          v-model:value="dateRange"
          type="daterange"
          clearable
        />
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
      <n-modal
        v-model:show="showConfirmDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 400px; max-width: 400px"
        title="请确认"
      >
        <confirm-dialog :title="'您确定要取消吗？'" @saved="confirmCancel" />
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
  import { generateOptionFromArray, handleRequest, toastSuccess } from '@/store/utils/utils';
  import NotifyUnloadForm from '@/views/newViews/ContainerForecast/form/NotifyUnloadForm.vue';
  import NotifyFeeDialog from '@/views/newViews/ContainerForecast/form/NotifyFeeDialog.vue';
  import WarehouseInfoDialog from '@/views/newViews/ContainerForecast/form/WarehouseInfoDialog.vue';
  import ContainerForecastIndex from '@/views/newViews/ContainerForecast/form/ContainerForecastIndex.vue';
  import { dateCompare } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';
  import UnloadingList from '@/views/newViews/ContainerForecast/form/UnloadingList.vue';
  import SelectedHeaderTable from '@/views/newViews/Missions/AlreadyWarehousing/SelectedHeaderTable.vue';
  import { getTableHeader } from '@/api/dataLayer/common/TableHeader';
  import { getUserCustomerList, hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import { defaultToday, valueOfToday } from '@/api/dataLayer/common/Date';
  import ConfirmDialog from '@/views/newViews/Common/ConfirmDialog.vue';
  import FileSaver from 'file-saver';
  import {
    getNotifyDetailListByNotify,
    NotifyDetailManager,
  } from '@/api/dataLayer/modules/notify/notify-detail';

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
  let dateRange = $ref(valueOfToday);
  let showConfirmDialog = $ref(false);
  let cancelId = $ref('');

  function addTable(type: NotifyType) {
    notifyType = type;
    currentModel = null;
    showModal.value = true;
  }

  onMounted(async () => {
    await getUserCustomerList();
    await reloadHeader();
  });

  const realOptions = computed(() => {
    return generateOptionFromArray(columns.filter((it) => it.key).map((it) => it.title));
  });

  const loadDataTable = async () => {
    let startDate = dayjs(dateRange[0]).startOf('day').valueOf() ?? valueOfToday[0];
    let endDate = dayjs(dateRange[1]).endOf('day').valueOf() ?? valueOfToday[1];
    const customerId = await getUserCustomerList();
    const res = (await NotifyManager.load(filterObj))
      .filter((it) => it.createTimestamp > startDate && it.createTimestamp < endDate)
      .filter((x) => customerId.includes(x.customerId));
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
      dateRange = valueOfToday;
    }
    reloadTable();
  }

  async function confirmCancel() {
    const res = await NotifyManager.edit(
      {
        inStatus: '已取消',
      },
      cancelId
    );
    const list = await getNotifyDetailListByNotify(cancelId);
    for (const item of list) {
      item.inStatus = '已取消';
      await NotifyDetailManager.edit(item, item.id);
    }
    await handleRequest(res, () => {
      toastSuccess('success');
      reloadTable();
    });
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
    FileSaver.saveAs(
      blob,
      dayjs(dateRange[0]).startOf('day').format('YYYY-MM-DD') +
        '~' +
        dayjs(dateRange[1]).endOf('day').format('YYYY-MM-DD') +
        '到货预报' +
        '.csv'
    );
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
  }

  function reloadTable() {
    actionRef.value.reload();
    showOperationTable = false;
    showFeeDialog = false;
    showConfirmDialog = false;
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
        return getFileActionButton(label, key, NotifyManager, reloadTable, record, icon, power);
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
              currentNotifyId = record.id!;
              showOperationTable = true;
            },
            ifShow: () => {
              return hasAuthPower('forecastDownload');
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
              cancelId = record.id;
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
              showFeeDialog = true;
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
