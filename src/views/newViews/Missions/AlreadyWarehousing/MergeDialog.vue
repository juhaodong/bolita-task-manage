<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <template v-if="step == 0">
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
  import { asyncFCAddress, safeSumBy } from '@/store/utils/utils';
  import DetailInfo from '@/views/newViews/Missions/AlreadyWarehousing/DetailInfo.vue';
  import { $ref } from 'vue/macros';
  import { InBoundStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import {
    addOrUpdateTask,
    defaultTask,
    getTaskListByFilter,
    getTaskListByIds,
  } from '@/api/newDataLayer/TaskList/TaskList';

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
  let selectedContainer = $ref('');
  let selectedCountry = $ref('');
  let selectedFCAddress = $ref('');
  onMounted(async () => {
    await init();
  });
  let allNotifyDetail: any[] = $ref([]);
  let loading: boolean = $ref(false);

  watch(checkedRowKeys, async (val) => {
    let realList = [];
    if (val.length > 0) {
      selectedCountry = allNotifyDetail.find((it) => it.id === val[0]).country;
      selectedContainer = allNotifyDetail.find((x) => x.id === val[0]).containerId;
      selectedFCAddress = allNotifyDetail.find((x) => x.id === val[0]).FCAddress;
      allNotifyDetail = allNotifyDetail.filter(
        (b) =>
          b.containerId === selectedContainer &&
          b.country === selectedCountry &&
          b.FCAddress === selectedFCAddress
      );
    } else {
      await updateFilter(null);
      selectedContainer = '';
      selectedCountry = '';
      selectedFCAddress = '';
    }
    for (const item of val) {
      realList.push(allNotifyDetail.find((it) => it.id === item));
    }
    totalNumber.value = safeSumBy(realList, 'number');
    totalVolume.value = safeSumBy(realList, 'volume');
    totalWeight.value = safeSumBy(realList, 'weight');
  });

  let step = $ref(0);

  async function updateFilter(filterObj) {
    let currentFilter = [];
    if (filterObj) {
      const res = Object.keys(filterObj);
      for (const filterItem of res) {
        currentFilter.push({
          field: filterItem,
          op: filterObj[filterItem] ? '==' : '!=',
          value: filterObj[filterItem] ?? '',
        });
      }
    }
    allNotifyDetail = (await getTaskListByFilter(currentFilter)).filter(
      (a) => a.inStatus === InBoundStatus.WaitOperate
    );
    console.log(allNotifyDetail, 'all');
  }

  async function confirmSelection() {
    const currentList = await getTaskListByIds(checkedRowKeys.value);
    const mergeItem = Object.assign({}, currentList[0]);
    mergeItem.number = totalNumber.value;
    mergeItem.volume = totalVolume.value;
    mergeItem.weight = totalWeight.value;
    mergeItem.ticketId = currentList.map((it) => it.ticketId).join('#');
    mergeItem.FBADeliveryCode = currentList.map((it) => it.FBADeliveryCode).join('#');
    mergeItem.PO = currentList.map((it) => it.PO).join('#');
    mergeItem.mergedId = currentList.map((it) => it.id).join(',');
    const currentObj = Object.assign(defaultTask, mergeItem);
    currentObj.customerId = currentObj.customer.id;
    currentObj.inventoryId = currentObj.inventory.id;
    delete currentObj.id;
    await addOrUpdateTask(currentObj);
    // const userInfo = useUserStore().info;
    for (const item of currentList) {
      item.inStatus = '已合并';
      item.customerId = item.customer.id;
      item.inventoryId = item.inventory.id;
      // await addOrUpdateTaskTimeLine({
      //   useType: 'normal',
      //   bolitaTaskId: item.id,
      //   operator: userInfo?.realName,
      //   detailTime: dayjs().valueOf(),
      //   note: '被合并',
      // });
      await addOrUpdateTask(item);
    }
    emit('saved');
  }

  async function init() {
    // addressFormFields.unshift(await asyncCustomerFormField());
    loading = true;
    await updateFilter(null);
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
    { title: '国家', key: 'country' },
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

  const filters: FormField[] = [
    {
      label: '柜号',
      field: 'containerId',
    },
    {
      label: '票号',
      field: 'ticketId',
    },
    asyncFCAddress(),
  ];
</script>

<style lang="less" scoped></style>
