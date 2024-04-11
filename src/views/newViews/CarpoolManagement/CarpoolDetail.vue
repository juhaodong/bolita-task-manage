<template>
  <n-card :bordered="false" class="proCard">
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
            v-model:checked-row-keys="checkedRows"
            :actionColumn="actionColumn"
            :columns="currentColumns"
            :request="loadDataTable"
            :row-key="(row) => row.id"
          />
        </n-tab-pane>
      </n-tabs>
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
</template>

<script lang="ts" setup>
  import { Component, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from '@/views/newViews/Missions/AlreadyWarehousing/columns';
  import { $ref } from 'vue/macros';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
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
  const actionRef = ref();
  const props = defineProps<Prop>();
  interface Prop {
    belongsToId?: string;
  }

  async function selectedHeader() {
    showCurrentHeaderDataTable = true;
  }

  async function startEdit(id) {
    currentModel = await NotifyDetailManager.getById(id);
    editDetailModel.value = true;
  }

  const loadDataTable = async () => {
    allList = (await NotifyDetailManager.load(filterObj))
      .filter((a) => a.outboundId)
      .filter((x) => dayjs(x.createTimestamp).format('YYYY-MM') === selectedMonth);
    return allList.sort(dateCompare('createTimestamp'));
  };

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
    await actionRef.value[0].reload();
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
              if (outboundInfo.waitCar) {
                outboundInfo.inStatus = '已订车';
              }
              if (outboundInfo.outboundDetailInfo.length === 0) {
                outboundInfo.inStatus = '已取消';
              }
              record.outboundId = '';
              await NotifyDetailManager.editInternal(record, record.id);
              await updateOutboundForecast(record.outboundId, outboundInfo);
              await reloadTable();
            },
            ifShow: () => {
              return record.inStatus === '存仓' || record.inStatus === '库内操作';
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
