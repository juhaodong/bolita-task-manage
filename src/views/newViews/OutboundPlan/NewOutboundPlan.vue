<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <template v-if="step === 0">
        <filter-bar
          v-model="filterItems"
          :columns="columns"
          @clear="updateFilter(null)"
          @submit="updateFilter"
          @filter-change="updateFilterWithItems"
        />
        <BasicTable
          ref="actionRef"
          v-model:checked-row-keys="checkedRowKeys"
          :columns="columns"
          :pagination="paginationReactive"
          :request="loadDataTable"
          :row-key="(row) => row.id"
          @update:page="handlePageChange"
        />
        <n-space
          v-if="checkedRowKeys.length > 0"
          align="center"
          class="mt-4"
          justify="space-between"
        >
          <div>已经选择{{ checkedRowKeys.length }}条记录</div>
          <div>当前过滤项:{{ warnMessage }}</div>
          <div>总数量: {{ totalNumber }}</div>
          <div>总重量: {{ totalWeight }}</div>
          <div>总体积: {{ totalVolume }}</div>
          <n-button :disabled="checkedRowKeys.length == 0" type="primary" @click="confirmSelection"
            >确定
          </n-button>
        </n-space>
      </template>
      <template v-else>
        <n-button @click="step = 0">返回上一步</n-button>
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
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { h, reactive, ref, watch } from 'vue';
  import { DataTableColumns, NButton } from 'naive-ui';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import {
    asyncCustomer,
    asyncFCAddressByFilter,
    asyncStorage,
    generateOptionFromArray,
    safeParseInt,
    safeSumBy,
    toastError,
  } from '@/store/utils/utils';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { CarStatus } from '@/views/newViews/OutboundPlan/columns';
  import {
    deliveryMethodList,
    outboundMethodList,
  } from '@/api/dataLayer/modules/deliveryMethod/detail';
  import DetailInfo from '@/views/newViews/Missions/AlreadyWarehousing/DetailInfo.vue';
  import { $ref } from 'vue/macros';
  import { afterPlanDetailAdded } from '@/api/dataLayer/modules/OutBoundPlan/outAddHook';
  import { getTaskListByFilterWithPagination } from '@/api/newDataLayer/TaskList/TaskList';
  import {
    addOrUpdateWithRefOutboundForecast,
    defaultOutboundList,
  } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';
  import dayjs from 'dayjs';
  import { BasicTable } from '@/components/Table';
  import { getUserCustomerList } from '@/api/dataLayer/common/power';
  import { InBoundStatus } from '@/api/dataLayer/modules/notify/notify-api';

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
  let selectedPostcode = $ref('');
  let selectedDeliveryMethod = $ref('');
  let selectedFCAddress = $ref('');
  let allNotifyDetail: any[] = $ref([]);
  let loading: boolean = $ref(false);
  let warnMessage = $ref('');
  let tableLoading = $ref(false);

  watch(checkedRowKeys, async (val) => {
    let realList = [];
    if (val.length > 0) {
      selectedDeliveryMethod = allNotifyDetail.find((it) => it.id === val[0]).deliveryMethod;
      selectedPostcode = allNotifyDetail.find((x) => x.id === val[0]).postcode;
      selectedFCAddress = allNotifyDetail.find((x) => x.id === val[0]).FCAddress;

      // Update filterItems for display in FilterBar
      filterItems = filterItems.filter((it) => it.key !== 'deliveryMethod');
      filterItems = filterItems.filter((it) => it.key !== 'FCAddress');
      filterItems = filterItems.filter((it) => it.key !== 'postcode');
      filterItems = filterItems.concat([
        {
          option: '物流方式',
          key: 'deliveryMethod',
          value: selectedDeliveryMethod,
          display: selectedDeliveryMethod,
        },
        {
          option: 'FC/送货地址',
          key: 'FCAddress',
          value: selectedFCAddress,
          display: selectedFCAddress,
        },
        {
          option: '邮编',
          key: 'postcode',
          value: selectedPostcode,
          display: selectedPostcode,
        },
      ]);
      if (val.length === 1) {
        await updateFilter(filterItems);
      }
    } else {
      tableLoading = true;
      if (autoOperation) {
        await updateFilter(null);
        filterItems = null;
      }
      selectedPostcode = '';
      selectedDeliveryMethod = '';
      selectedFCAddress = '';
      tableLoading = false;
    }
    for (const item of val) {
      realList.push(allNotifyDetail.find((it) => it.id === item));
    }
    totalNumber.value = safeSumBy(realList, 'arrivedContainerNum').toFixed(3);
    totalVolume.value = safeSumBy(realList, 'volume').toFixed(3);
    totalWeight.value = safeSumBy(realList, 'weight').toFixed(3);
  });

  let step = $ref(0);
  let autoOperation = $ref(true);

  async function submitSearch(filterObj) {
    autoOperation = false;
    await clearCheckRow();
    await updateFilter(filterObj);
    autoOperation = true;
  }

  async function clearCheckRow() {
    checkedRowKeys.value = [];
  }

  const actionRef = ref();

  async function updateFilter(value) {
    filterObj = value;
    await actionRef.value.reload();
    // let currentFilter = [];
    // if (filterObj) {
    //   const res = Object.keys(filterObj);
    //   for (let filterItem of res) {
    //     currentFilter.push({
    //       field: filterItem === 'fcaddress' ? 'FCAddress' : filterItem,
    //       op: filterObj[filterItem] ? 'like' : '!=',
    //       value: '%' + filterObj[filterItem] + '%' ?? '',
    //     });
    //   }
    // }
    // if (prop.model.length > 0) {
    //   allNotifyDetail = await getTaskListByIdsAndFilter(prop.model, currentFilter);
    // } else {
    //   currentFilter.push({
    //     field: 'inStatus',
    //     op: 'in',
    //     value: [InBoundStatus.WaitOperate, InBoundStatus.All],
    //   });
    //   allNotifyDetail = (await getTaskListByFilter(currentFilter)).filter((x) => {
    //     return x.outboundMethod !== '标准托盘' && x.outboundMethod !== '大件托盘'
    //       ? true
    //       : !!x.trayItems;
    //   });
    // }
  }
  let filterObj: any | null = $ref(null);
  let filterItems: any | null = $ref(null);

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

  function updateFilterWithItems(value) {
    filterObj = value;
    reloadTable();
  }

  async function reloadTable() {
    await actionRef.value.reload();
  }

  const loadDataTable = async () => {
    let currentFilter = [];
    if (filterObj) {
      const otherFilter = filterObj.filter((it) => it?.key !== 'usefulTimeRange');
      const filterOne = otherFilter.filter((it) => it?.component?.name !== 'DatePicker');
      const filterTwo = otherFilter.filter((it) => it?.component?.name === 'DatePicker');
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
      const usefulTimeFilter = filterObj.find((it) => it?.key === 'usefulTimeRange');
      if (usefulTimeFilter) {
        if (usefulTimeFilter.value === '红色') {
          currentFilter.push({
            field: 'usefulTimeRange',
            op: '>=',
            value: 15,
          });
        } else if (usefulTimeFilter.value === '黄色') {
          currentFilter.push({
            field: 'usefulTimeRange',
            op: '>=',
            value: 7,
          });
          currentFilter.push({
            field: 'usefulTimeRange',
            op: '<',
            value: 15,
          });
        } else {
          currentFilter.push({
            field: 'usefulTimeRange',
            op: '<',
            value: 7,
          });
        }
      }
    }
    const ownedCustomerIds = await getUserCustomerList();
    currentFilter.push({ field: 'customer.id', op: 'in', value: ownedCustomerIds });
    currentFilter.push({
      field: 'inStatus',
      op: 'in',
      value: [InBoundStatus.WaitOperate, InBoundStatus.All],
    });
    const res = await getTaskListByFilterWithPagination(currentFilter, paginationReactive);
    const allList = res.content;
    const totalCount = res.page.totalElements;
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
    allList.forEach((it) => {
      if (it.trayItems.length > 0) {
        it.trayDisplay = it.trayItems.map(
          (a) => a.trayType + '(' + a.size + ')' + '*' + a.amount + ' / '
        );
      }
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
    allNotifyDetail = fakeListStart.concat(allList.concat(fakeListEnd));
    return allNotifyDetail;
  };

  function confirmSelection() {
    allNotifyDetail = allNotifyDetail.filter((it: any) => checkedRowKeys.value.includes(it.id));
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

  const defaultOutboundForecast = {
    outboundDetailInfo: '',
    FCAddress: '',
    containerNum: 0,
    deliveryMethod: '',
    inStatus: '',
    needCar: '',
    needOfferPrice: '',
    postcode: '',
    totalVolume: '',
    totalWeight: '',
    trayNum: '',
  };

  async function saveOutboundPlan(value) {
    loading = true;
    const res = {
      FCAddress: selectedFCAddress ?? '',
      deliveryMethod: selectedDeliveryMethod,
      postcode: selectedPostcode ?? '',
      ...value,
      inStatus: value.needCar === '1' ? CarStatus.UnAble : CarStatus.NoNeed,
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
    loading = false;
  }

  const columns: DataTableColumns<any> = $computed(() => [
    {
      type: 'selection',
      key: 'selection',
    },
    { title: '客户', key: 'customer.customerName' },
    { title: '票号', key: 'ticketId' },
    { title: '柜号', key: 'containerId' },
    { title: '仓库', key: 'inventory.name' },
    { title: '托数', key: 'arrivedTrayNum' },
    { title: '箱数', key: 'arrivedContainerNum' },
    { title: '重量', key: 'weight' },
    { title: '体积', key: 'volume' },
    { title: 'FC/送货地址', key: 'FCAddress' },
    { title: '邮编', key: 'postcode' },
    { title: '出库方式', key: 'outboundMethod' },
    { title: '物流方式', key: 'deliveryMethod' },
    { title: 'FBA单号', key: 'FBADeliveryCode' },
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
  ]);
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
    { title: 'FBA单号', key: 'FBADeliveryCode' },
    { title: '仓库', key: 'inventory.name' },
  ]);
  const searchSchema: FormField[] = [
    { label: '入库ID', field: 'notifyId' },
    { label: '票号', field: 'ticketId' },
    { label: '货柜号', field: 'containerNo' },
  ];

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
    // {
    //   field: 'pickUpDateTime',
    //   component: 'NDatePicker',
    //   label: '提货日期',
    //   componentProps: {
    //     type: 'date',
    //     clearable: true,
    //   },
    //   displayCondition(model) {
    //     return model.needCar === '0';
    //   },
    // },
    // {
    //   field: 'pickUpPerson',
    //   label: '提货方',
    //   displayCondition(model) {
    //     return model.needCar === '0';
    //   },
    // },
  ];

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
    asyncFCAddressByFilter(),
    asyncStorage(),
    {
      label: '物流方式',
      field: 'deliveryMethod',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(deliveryMethodList),
        multiple: true,
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
</script>

<style lang="less" scoped></style>
