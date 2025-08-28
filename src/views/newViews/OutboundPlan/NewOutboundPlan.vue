<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <template v-if="step === 0">
        <single-filter-bar
          :form-fields="filters"
          @clear="updateFilter(null)"
          @submit="updateFilter"
        />
        <BasicTable
          ref="actionRef"
          v-model:checked-row-keys="checkedRowKeys"
          :columns="columns"
          :pagination="paginationReactive"
          :request="loadDataTable"
          @update:checked-row-keys="handleCheck"
          :row-key="(row) => row.id"
        />
        <n-space
          v-if="checkedRowKeys.length > 0"
          align="center"
          class="mt-4"
          justify="space-between"
        >
          <div>已经选择{{ checkedRowKeys.length }}条记录</div>
          <div>总数量: {{ totalNumber }}件 {{ totalTray }}托</div>
          <div :style="{ color: parseFloat(totalWeight) > 20000 ? 'red' : '' }"
            >总重量: {{ totalWeight }}</div
          >
          <div :style="{ color: parseFloat(totalVolume) > 70 ? 'red' : '' }"
            >总体积: {{ totalVolume }}</div
          >
          <n-button :disabled="checkedRowKeys.length == 0" type="primary" @click="confirmSelection"
            >确定
          </n-button>
        </n-space>
      </template>
      <template v-else>
        <n-button @click="backStep">返回上一步</n-button>
        <n-data-table
          v-if="allNotifyDetail.length > 0"
          v-model:checked-row-keys="checkedRowKeys"
          :columns="displayColumns"
          :data="allNotifyDetail"
          class="mt-4"
          max-height="450"
          virtual-scroll
        />
        <normal-form :form-fields="addressFormFields" class="mt-8" @submit="saveOutboundPlan" />
      </template>
    </loading-frame>
    <n-modal
      v-model:show="showDetailInfo"
      :show-icon="false"
      preset="dialog"
      style="width: 90%; min-width: 600px; max-width: 1000px"
      title="详情"
    >
      <detail-info :current-date="currentDate" @save="reloadTable" />
    </n-modal>
  </n-card>
</template>
<script lang="ts" setup>
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { h, reactive, ref, watch } from 'vue';
  import { DataTableColumns, NButton } from 'naive-ui';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import {
    asyncCustomer,
    generateOptionFromArray,
    safeParseInt,
    safeSumBy,
    toastError,
  } from '@/store/utils/utils';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { CarStatus } from '@/views/newViews/OutboundPlan/columns';
  import DetailInfo from '@/views/newViews/Missions/AlreadyWarehousing/DetailInfo.vue';
  import { $ref } from 'vue/macros';
  import { afterPlanDetailAdded } from '@/api/dataLayer/modules/OutBoundPlan/outAddHook';
  import {
    getTaskListByFilterWithPagination,
    getTaskListByIds,
  } from '@/api/newDataLayer/TaskList/TaskList';
  import {
    addOrUpdateWithRefOutboundForecast,
    defaultOutboundList,
  } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';
  import dayjs from 'dayjs';
  import { BasicTable } from '@/components/Table';
  import { getUserCustomerList } from '@/api/dataLayer/common/power';
  import router from '@/router';
  import { createPaginationPlaceholders } from '@/api/newDataLayer/Common/Common';
  import SingleFilterBar from '@/views/bolita-views/composable/SingleFilterBar.vue';
  import {
    deliveryMethodList,
    outboundMethodList,
  } from '@/api/dataLayer/modules/deliveryMethod/detail';

  interface Props {
    model?: any;
    initialKey?: any[];
  }

  const prop = defineProps<Props>();
  const emit = defineEmits(['saved']);
  const checkedRowKeys = ref<any[]>([]);
  let showDetailInfo = $ref(false);
  let currentDate = ref([]);
  const outboundMethod = ref<any[]>([]);
  const totalNumber = ref(null);
  const totalVolume = ref(null);
  const totalWeight = ref(null);
  const totalTray = ref(null);
  let selectedPostcode = $ref('');
  let selectedDeliveryMethod = $ref('');
  let selectedfcAddress = $ref('');
  let allNotifyDetail: any[] = $ref([]);
  let loading: boolean = $ref(false);
  let tableLoading = $ref(false);
  let selectedTaskList = $ref([]);
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
    {
      label: '物流方式',
      field: 'deliveryMethod',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(deliveryMethodList),
      },
    },
    {
      label: '出库方式',
      field: 'outboundMethod',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(outboundMethodList),
      },
    },
    {
      label: '邮编',
      field: 'postcode',
    },
  ];

  watch(checkedRowKeys, async (val, oldValue) => {
    if (val.length > 0) {
      selectedDeliveryMethod = selectedTaskList.find((it) => it.id === val[0]).deliveryMethod;
      selectedPostcode = selectedTaskList.find((x) => x.id === val[0]).postcode;
      selectedfcAddress = selectedTaskList.find((x) => x.id === val[0]).fcAddress;
      filterObj['deliveryMethod'] = selectedDeliveryMethod;
      filterObj['fcAddress'] = selectedfcAddress;
      filterObj['postcode'] = selectedPostcode;
      console.log(filterObj, 'items');
      if (val.length === 1 && oldValue.length < 2) {
        await updateFilter(filterObj);
      }
    } else {
      tableLoading = true;
      filterObj = null;
      selectedPostcode = '';
      selectedDeliveryMethod = '';
      selectedfcAddress = '';
      await updateFilter(null);
      tableLoading = false;
    }
    totalNumber.value = safeSumBy(selectedTaskList, 'arrivedContainerNum').toFixed(3);
    totalVolume.value = safeSumBy(selectedTaskList, 'volume').toFixed(3);
    totalWeight.value = safeSumBy(selectedTaskList, 'weight').toFixed(3);
  });

  let step = $ref(0);

  async function handleCheck(rowKeys) {
    checkedRowKeys.value = rowKeys;
    const currentPageSelected = allNotifyDetail.filter((item) => rowKeys.includes(item.id));
    // 合并到全局选中集合
    selectedTaskList = [
      ...selectedTaskList.filter(
        (item) => !allNotifyDetail.some((pageItem) => pageItem.id === item.id)
      ),
      ...currentPageSelected,
    ];
  }

  const actionRef = ref();

  async function clearFilter() {
    filterObj = null;
    checkedRowKeys.value = [];
  }

  async function updateFilter(value) {
    filterObj = value;
    await reloadTable();
  }
  let filterObj = $ref({});

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

  async function reloadTable() {
    await actionRef.value.reload();
  }

  let currentFilter = $ref([]);

  async function getCurrentFilter() {
    currentFilter = [];
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
        currentFilter['ticketIdLike'] = currentFilter['ticketIdId'];
      }
    }
    currentFilter['inStatusIn'] = ['入库待出库'];
  }

  let allList: any[] = $ref([]);

  const loadDataTable = async () => {
    await getCurrentFilter();
    const res = await getTaskListByFilterWithPagination(currentFilter, paginationReactive);
    allList = res.rows.map((it) => {
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
    allNotifyDetail = fakeListStart.concat(allList.concat(fakeListEnd));
    return allNotifyDetail;
  };

  async function backStep() {
    step = 0;
    await clearFilter();
  }

  async function confirmSelection() {
    allNotifyDetail = await getTaskListByIds(checkedRowKeys.value);
    const notEnough = allNotifyDetail.find((it) => {
      return (
        safeParseInt(it.outBoundTrayNum) > safeParseInt(it.instorageTrayNum) ||
        safeParseInt(it.outBoundContainerNum) > safeParseInt(it.instorageContainerNum)
      );
    });
    if (notEnough) {
      toastError('票号' + notEnough.ticketId + '剩余数量不足');
      return;
    }
    step = 1;
  }

  async function saveOutboundPlan(value) {
    loading = true;
    const res = {
      fcAddress: selectedfcAddress ?? '',
      deliveryMethod: selectedDeliveryMethod,
      postcode: selectedPostcode ?? '',
      ...value,
      inStatus: value.needCar === '1' ? '待订车' : '无需订车',
      carStatus: value.needCar === '1' ? '待订车' : '无需订车',
      outboundDetailInfo: allNotifyDetail.map((it) => it.id).join(','),
      totalVolume: safeSumBy(allNotifyDetail, 'volume'),
      totalWeight: safeSumBy(allNotifyDetail, 'weight'),
      totalNumber: safeSumBy(allNotifyDetail, 'number'),
      customerId: allNotifyDetail[0].customer.id,
      inventoryId: allNotifyDetail[0].inventory.id,
    };
    const currentInfo = Object.assign(defaultOutboundList, res);
    const outboundId = (await addOrUpdateWithRefOutboundForecast(currentInfo)).data.id;
    allNotifyDetail.forEach((it) => {
      it.customerId = it.customer.id;
      it.inventoryId = it.inventory.id;
      it.needCar = value.needCar;
      if (it.needCar === '1') {
        it.carStatus = CarStatus.UnAble;
      } else {
        it.carStatus = CarStatus.NoNeed;
      }
      it.outboundId = outboundId;
      it.needOfferPrice = value.needOfferPrice;
      it.usefulTimeRange = dayjs().diff(dayjs(it.arriveTime), 'day') ?? '-';
    });
    await afterPlanDetailAdded(allNotifyDetail);
    await safeScope(() => {
      emit('saved');
    });
    if (value.needCar === '1') {
      await router.push('/car/carBooking?id=' + outboundId);
    } else {
      await router.push('/operationDetail/Operation?id=' + outboundId);
    }

    loading = false;
  }

  const columns: DataTableColumns<any> = $computed(() =>
    [
      {
        type: 'selection',
        key: 'selection',
      },
      { title: '客户', key: 'customer.customerName' },
      { title: '票号', key: 'ticketId' },
      { title: '柜号', key: 'containerId' },
      { title: '仓库', key: 'inventory.name' },
      { title: '托数', key: 'arrivedTrayNum', width: 60 },
      { title: '箱数', key: 'arrivedContainerNum', width: 60 },
      { title: '重量', key: 'weight', width: 80 },
      { title: '体积', key: 'volume', width: 80 },
      { title: 'FC', key: 'fcAddress', width: 80 },
      { title: '地址', key: 'address', width: 120 },
      { title: '邮编', key: 'postcode' },
      { title: '出库方式', key: 'outboundMethod', width: 100 },
      { title: '物流方式', key: 'deliveryMethod', width: 120 },
      { title: 'FBA单号', key: 'fbaDeliveryCode', width: 120 },
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
                currentDate.value = row;
                showDetailInfo = true;
              },
            },
            { default: () => '查看' }
          );
        },
      },
    ].map((it) => {
      it.ellipsis = {
        tooltip: true,
      };
      return it;
    })
  );
  const displayColumns: DataTableColumns<any> = $computed(() => [
    { title: '票号', key: 'ticketId' },
    { title: '柜号', key: 'containerId' },
    { title: '托数', key: 'arrivedTrayNum' },
    { title: '箱数', key: 'arrivedContainerNum' },
    { title: '重量', key: 'weight' },
    { title: '体积', key: 'volume' },
    { title: '邮编', key: 'postcode' },
    { title: '预计出库方式', key: 'outboundMethod' },
    { title: '物流方式', key: 'deliveryMethod' },
    { title: 'FBA单号', key: 'fbaDeliveryCode' },
    { title: '仓库', key: 'inventory.name' },
  ]);

  const addressFormFields: FormField[] = [
    {
      field: 'needCar',
      component: 'NSelect',
      label: '是否需要订车',
      componentProps: {
        options: [
          { value: '1', label: '是' },
          { value: '0', label: '否' },
        ],
      },
    },
    {
      field: 'needOfferPrice',
      component: 'NSelect',
      label: '是否需要报价',
      componentProps: {
        options: [
          { value: '1', label: '是' },
          { value: '0', label: '否' },
        ],
      },
    },
  ];
</script>

<style lang="less" scoped></style>
