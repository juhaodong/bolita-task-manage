<template>
  <n-card v-if="hasAuthPower('carDetailView')" :bordered="false" class="proCard">
    <div>
      <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter">
        <n-button type="primary" @click="selectedHeader">
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          选择表头显示
        </n-button>
        <n-button type="info" @click="downloadData">
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
        <n-date-picker
          v-model:value="dateRange"
          :default-value="[dayjs().valueOf(), dayjs().valueOf()]"
          class="ml-2"
          clearable
          type="daterange"
        />
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
        v-model:show="showCurrentHeaderDataTable"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 800px; max-width: 800px"
        title="添加表头"
      >
        <selected-header-table :all-columns="columns" :type="'carDetail'" @saved="reloadHeader" />
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
    </div>
  </n-card>
  <no-power-page v-else />
</template>

<script lang="ts" setup>
  import { Component, computed, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from '@/views/newViews/Missions/AlreadyWarehousing/columns';
  import { $ref } from 'vue/macros';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import {
    getDetailListById,
    NotifyDetailManager,
  } from '@/api/dataLayer/modules/notify/notify-detail';
  import { Box20Filled } from '@vicons/fluent';
  import { dateCompare, OneYearMonthTab } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';
  import EditMissionDetail from '@/views/newViews/Missions/AlreadyWarehousing/EditMissionDetail.vue';
  import { getTableHeader } from '@/api/dataLayer/common/TableHeader';
  import SelectedHeaderTable from '@/views/newViews/Missions/AlreadyWarehousing/SelectedHeaderTable.vue';
  import {
    getOutboundForecastById,
    updateOutboundForecast,
  } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import { generateOptionFromArray, safeSumBy } from '@/store/utils/utils';
  import { hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import { valueOfToday } from '@/api/dataLayer/common/Date';
  import FileSaver from 'file-saver';

  const showModal = ref(false);
  let editDetailModel = ref(false);

  let filterObj: any | null = $ref(null);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);
  let monthTab: any | null = $ref(null);
  let selectedMonth: any | null = $ref('');
  let allList: any | null = $ref([]);
  let currentHeader = $ref([]);
  let currentColumns = $ref([]);
  let showCurrentHeaderDataTable = $ref(false);
  let optionOne = $ref('');
  let optionTwo = $ref('');
  let valueOne = $ref('');
  let valueTwo = $ref('');
  let dateRange = $ref(valueOfToday);
  const actionRef = ref();
  const props = defineProps<Prop>();
  interface Prop {
    belongsToId?: string;
  }

  async function selectedHeader() {
    showCurrentHeaderDataTable = true;
  }

  async function downloadData() {
    let selectedList = [];
    if (checkedRows.length > 0) {
      selectedList = await getDetailListById(checkedRows);
    } else {
      selectedList = await loadDataTable();
    }
    let headerTitle = columns
      .filter((it) => it.title)
      .map((it) => it.title)
      .join();
    let dataStrings = [];
    dataStrings.unshift(headerTitle);
    selectedList.forEach((it) => {
      const res = [
        it.customerName ?? '',
        it.containerId ?? '',
        it.ticketId ?? '',
        it.country ?? '',
        it.number ?? '',
        it.arrivedContainerNum ?? '',
        it.weight ?? '',
        it.volume ?? '',
        it.size ?? '',
        it.inStatus ?? '',
        it.warehouseId ?? '',
        it.stayTime ?? '',
        it.deliveryIdIn ?? '',
        it.normalNote ?? '',
        it.FBADeliveryCode ?? '',
        it.outboundMethod ?? '',
        it.deliveryMethod ?? '',
        it.operationRequire ?? '',
        it.operationNote ?? '',
        it.finalStatus ?? '',
        it.PO ?? '',
        it.FCAddress ?? '',
        it.postcode ?? '',
        it.inBoundDetailStatus ?? '',
        it.changeOrderFiles ?? '',
        it.transportationNote ?? '',
        it.trayNum ?? '',
        it.arrivedTrayNum ?? '',
        dayjs(it.planArriveDateTime).format('YYYY-MM-DD') ?? '',
        dayjs(it.currentDate[0]).format('YYYY-MM-DD') ?? '',
        it.deliveryTime ? dayjs(it.deliveryTime).format('YYYY-MM-DD') : '',
        it.Ref ?? '',
        it.note ?? '',
        it.sign ?? '',
        it.package ?? '',
        it.industrialTrayNum ?? '',
        it.productName ?? '',
        it.UNNumber ?? '',
        it.recipient ?? '',
        it.phone ?? '',
        it.email ?? '',
        it.needReserve ?? '',
        it.industrialNote ?? '',
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
        '任务明细' +
        '.csv'
    );
  }

  async function startEdit(id) {
    currentModel = await NotifyDetailManager.getById(id);
    editDetailModel.value = true;
  }
  const realOptions = computed(() => {
    return generateOptionFromArray(columns.filter((it) => it.key).map((it) => it.title));
  });

  const loadDataTable = async () => {
    let startDate = dayjs(dateRange[0]).startOf('day').valueOf() ?? valueOfToday[0];
    let endDate = dayjs(dateRange[1]).endOf('day').valueOf() ?? valueOfToday[1];
    allList = (await NotifyDetailManager.load(filterObj))
      .filter((a) => a.outboundId)
      .filter((it) => it.createTimestamp > startDate && it.createTimestamp < endDate);
    return allList.sort(dateCompare('createTimestamp'));
  };

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

  async function reloadHeader() {
    currentColumns = [];
    currentHeader = await getTableHeader('carDetail');
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

  async function reloadTable() {
    showModal.value = false;
    editDetailModel.value = false;
    showCurrentHeaderDataTable = false;
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

  onMounted(async () => {
    await reloadHeader();
    monthTab = OneYearMonthTab();
    selectedMonth = monthTab[0];
    const res = getQueryString('id');
    if (res) {
      updateFilter({ outboundId: res });
    } else {
      await reloadTable();
    }
    if (props.belongsToId) {
      filterObj = { belongsToId: props.belongsToId };
    }
  });

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record: any) {
      const fileAction = (label, key, icon?: Component) => {
        return getFileActionButton(label, key, NotifyDetailManager, reloadTable, record, icon);
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '审核',
            async onClick() {
              let outboundInfo = await getOutboundForecastById(record.outboundId);
              outboundInfo.outboundDetailInfo = outboundInfo.outboundDetailInfo.filter(
                (it) => it !== record.id
              );
              if (!outboundInfo.waitPrice) {
                outboundInfo.inStatus = '待订车';
              }
              if (outboundInfo.waitPrice && !outboundInfo.waitCar) {
                outboundInfo.inStatus = '待订车';
              }
              if (outboundInfo.waitCar) {
                outboundInfo.inStatus = '已订车';
              }
              if (outboundInfo.outboundDetailInfo.length === 0) {
                outboundInfo.inStatus = '已取消';
              }
              record.outboundId = '';
              await NotifyDetailManager.editInternal(record, record.id);
              const currentList = await getDetailListById(outboundInfo.outboundDetailInfo);
              outboundInfo.totalOutOffer = safeSumBy(currentList, 'outPrice') ?? 0;
              outboundInfo.totalVolume = safeSumBy(currentList, 'volume') ?? 0;
              outboundInfo.totalWeight = safeSumBy(currentList, 'weight') ?? 0;
              outboundInfo.containerNum = safeSumBy(currentList, 'arrivedContainerNum') ?? 0;
              await updateOutboundForecast(outboundInfo.id, outboundInfo);
              await reloadTable();
            },
            ifShow: () => {
              return (
                (record.inStatus === '存仓' || record.inStatus === '库内操作') &&
                hasAuthPower('carDetailCheck')
              );
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
