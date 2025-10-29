<script lang="ts" setup>
  import { $ref } from 'vue/macros';
  import { onMounted, reactive, ref } from 'vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { DataTableColumns, NButton } from 'naive-ui';
  import { getTaskListByFilterWithPagination } from '@/api/newDataLayer/TaskList/TaskList';
  import { createPaginationPlaceholders } from '@/api/newDataLayer/Common/Common';
  import SingleFilterBar from '@/views/bolita-views/composable/SingleFilterBar.vue';
  import { BasicTable } from '@/components/Table';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { addOrUpdateOutboundForecast } from '@/api/newDataLayer/CarManage/CarManage';

  interface Props {
    info?: any;
  }

  const props = defineProps<Props>();
  const emit = defineEmits(['saved']);
  let loading = $ref(false);
  const displayColumns: DataTableColumns<any> = $computed(() => [
    { title: '票号', key: 'ticketId' },
    { title: '柜号', key: 'containerId' },
    { title: '托数', key: 'arrivedTrayNum' },
    { title: '箱数', key: 'arrivedContainerNum' },
    { title: '重量', key: 'weight' },
    { title: '体积', key: 'volume' },
    { title: '邮编', key: 'postcode' },
    { title: '仓库', key: 'inventory.name' },
    { title: '价格', key: 'suggestedPrice' },
  ]);
  const filters: FormField[] = [
    {
      label: '柜号',
      field: 'containerId',
    },
    {
      label: '票号',
      field: 'ticketId',
    },
  ];

  let filterObj = $ref(null);
  let checkedRows = $ref([]);
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
  let selectedTaskList = $ref([]);
  let allTaskList = $ref([]);
  let currentFilter = $ref([]);

  onMounted(async () => {
    console.log(props.info, 'info');
  });
  const actionRef = ref();
  async function reloadTable() {
    await actionRef.value.reload();
  }

  async function getCurrentFilter() {
    currentFilter = [];
    currentFilter['inStatusNotIn'] = ['已拆分', '已取消'];
    currentFilter['outBoundForecastNull'] = true;
    if (filterObj) {
      currentFilter = filterObj;
      if (currentFilter['containerId']) {
        currentFilter['containerIdLike'] = currentFilter['containerId'];
        delete currentFilter.containerId;
      }
      if (currentFilter['ticketId']) {
        const ticketIds = currentFilter['ticketId'].split(',');
        if (ticketIds.length > 1) {
          currentFilter['ticketIdIn'] = ticketIds;
        } else {
          currentFilter['ticketIdLike'] = currentFilter['ticketId'];
        }
        delete currentFilter.ticketId;
      }
    }
  }

  const loadDataTable = async () => {
    await getCurrentFilter();
    const res = await getTaskListByFilterWithPagination(currentFilter, paginationReactive);
    const allList = res.rows.map((it) => {
      it.numberDisplay = it.number + '/' + it.arrivedContainerNum;
      it.trayDisplay = it.trayNum + '/' + it.arrivedTrayNum;
      return it;
    });
    const totalCount = res.totalRowCount;
    const { fakeListStart, fakeListEnd } = createPaginationPlaceholders(
      paginationReactive.pageNumber,
      paginationReactive.pageSize,
      totalCount
    );
    allTaskList = [...fakeListStart, ...allList, ...fakeListEnd];
    return allTaskList;
  };

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

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

  // async function saveInfo() {
  //   let currentTask = Object.assign({}, props.row);
  //   currentTask.size = size;
  //   currentTask.outContainerNum = normalNumber;
  //   currentTask.outTrayNum = trayNumber;
  //   await updateTask(currentTask);
  //   emit('saved');
  // }

  async function saveTask() {
    const currentOutboundForecast = Object.assign({}, props.info);
    const needAddTaskIds = selectedTaskList.map((item) => item.id);
    currentOutboundForecast.bolitaTaskIds =
      currentOutboundForecast.bolitaTaskIds.concat(needAddTaskIds);
    await addOrUpdateOutboundForecast(currentOutboundForecast);
    emit('saved');
  }
</script>

<template>
  <loading-frame :loading="loading">
    <div class="mt-2">
      <single-filter-bar
        :form-fields="filters"
        @clear="updateFilter(null)"
        @submit="updateFilter"
      />
      <div class="mt-2">
        <n-button class="action-button" size="small" type="info" @click="saveTask"> 保存 </n-button>
      </div>
      <BasicTable
        ref="actionRef"
        v-model:checked-row-keys="checkedRows"
        @update:checked-row-keys="handleCheck"
        :columns="displayColumns"
        :pagination="paginationReactive"
        :request="loadDataTable"
        :row-key="(row) => row.id"
      />
    </div>
  </loading-frame>
</template>

<style lang="less" scoped></style>
