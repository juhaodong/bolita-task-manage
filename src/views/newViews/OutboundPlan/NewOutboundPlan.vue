<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <template v-if="step === 0">
        <filter-bar :form-fields="filters" @clear="updateFilter" @submit="updateFilter" />
        <n-data-table
          v-model:checked-row-keys="checkedRowKeys"
          :columns="columns"
          :data="allNotifyDetail"
          :row-key="(row) => row.id"
          class="mt-4"
          max-height="450"
          virtual-scroll
        />
        <n-space
          v-if="checkedRowKeys.length > 0"
          align="center"
          class="mt-4"
          justify="space-between"
        >
          <div>已经选择{{ checkedRowKeys.length }}条记录</div>
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
  import { h, onMounted, ref, watch } from 'vue';
  import { DataTableColumns, NButton } from 'naive-ui';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import {
    asyncCustomer,
    asyncFCAddress,
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
  import { InBoundStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import {
    getTaskListByFilter,
    getTaskListByIdsAndFilter,
  } from '@/api/newDataLayer/TaskList/TaskList';
  import { addOrUpdateOutboundForecast } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';

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
  onMounted(async () => {
    await init();
  });
  let allNotifyDetail: any[] = $ref([]);
  let loading: boolean = $ref(false);

  watch(checkedRowKeys, async (val) => {
    let realList = [];
    if (val.length > 0) {
      selectedDeliveryMethod = allNotifyDetail.find((it) => it.id === val[0]).deliveryMethod;
      selectedPostcode = allNotifyDetail.find((x) => x.id === val[0]).postcode;
      selectedFCAddress = allNotifyDetail.find((x) => x.id === val[0]).FCAddress;
      allNotifyDetail = allNotifyDetail.filter(
        (b) =>
          b.postcode === selectedPostcode &&
          b.deliveryMethod === selectedDeliveryMethod &&
          b.FCAddress === selectedFCAddress
      );
    } else {
      await updateFilter(null);
      selectedPostcode = '';
      selectedDeliveryMethod = '';
      selectedFCAddress = '';
    }
    for (const item of val) {
      realList.push(allNotifyDetail.find((it) => it.id === item));
    }
    totalNumber.value = safeSumBy(realList, 'number').toFixed(3);
    totalVolume.value = safeSumBy(realList, 'volume').toFixed(3);
    totalWeight.value = safeSumBy(realList, 'weight').toFixed(3);
  });

  let step = $ref(0);

  async function updateFilter(filterObj) {
    let currentFilter = [];
    if (filterObj) {
      const res = Object.keys(filterObj);
      for (const filterItem of res) {
        currentFilter.push({
          field: filterItem,
          op: filterObj[filterItem]
            ? filterItem === 'customer' || filterItem === 'inventory'
              ? 'belongs to'
              : '=='
            : '!=',
          value: filterObj[filterItem] ?? '',
        });
      }
    }
    if (prop.model.length > 0) {
      allNotifyDetail = await getTaskListByIdsAndFilter(prop.model, currentFilter);
    } else {
      allNotifyDetail = (await getTaskListByFilter(currentFilter))
        .filter((a) => a.inStatus === InBoundStatus.WaitOperate)
        .filter((x) => {
          return x.outboundMethod !== '标准托盘' && x.outboundMethod !== '大件托盘'
            ? true
            : !!x.detailTray;
        });
      console.log(allNotifyDetail, 'detail');
    }
  }

  async function init() {
    // addressFormFields.unshift(await asyncCustomerFormField());
    await updateFilter(null);
  }

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
      waitPrice: '',
      waitCar: '',
      totalOutOffer: '',
    };
    const outboundId = (await addOrUpdateOutboundForecast(res)).data.id;
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
    { title: '票号', key: 'ticketId' },
    { title: '柜号', key: 'containerId' },
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
    { title: '仓库', key: 'warehouseId' },
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
    {
      field: 'pickUpDateTime',
      component: 'NDatePicker',
      label: '提货日期',
      componentProps: {
        type: 'date',
        clearable: true,
      },
      displayCondition(model) {
        return model.needCar === '0';
      },
    },
    {
      field: 'pickUpPerson',
      label: '提货方',
      displayCondition(model) {
        return model.needCar === '0';
      },
    },
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
    asyncFCAddress(),
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
