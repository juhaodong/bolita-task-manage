<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <template v-if="step == 0">
        <filter-bar :form-fields="filters" @clear="updateFilter" @submit="updateFilter" />
        <n-data-table
          v-if="allNotifyDetail.length > 0"
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
  </n-card>
</template>
<script lang="ts" setup>
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { onMounted, ref, watch } from 'vue';
  import { DataTableColumns } from 'naive-ui';
  import { getReserveItems } from '@/api/dataLayer/modules/notify/notify-detail';
  import { editableColumn } from '@/views/bolita-views/composable/useableColumns';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { asyncCustomerFormField } from '@/api/dataLayer/fieldDefination/common';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { safeParseInt, toastError } from '@/store/utils/utils';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { OutBoundPlanManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';
  import { afterPlanDetailAdded } from '@/api/dataLayer/modules/OutBoundPlan/outAddHook';
  import { CarStatus } from '@/views/newViews/OutboundPlan/columns';
  import { deliveryDetailMethods } from '@/api/dataLayer/modules/deliveryMethod/detail';
  import { addOutboundForecast } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';

  interface Props {
    model?: any;
    initialKey?: any[];
  }

  const prop = defineProps<Props>();
  const emit = defineEmits(['saved']);
  const checkedRowKeys = ref<any[]>([]);
  const groupNotifyDetail = ref<any[]>([]);
  const deliveryMethod = ref<any[]>([]);
  onMounted(async () => {
    await init();
  });
  let allNotifyDetail: any[] = $ref([]);
  let loading: boolean = $ref(false);

  watch(checkedRowKeys, async (val) => {
    if (val.length > 0) {
      deliveryMethod.value = allNotifyDetail.find((it) => it.id === val[0]).operation;
      allNotifyDetail = allNotifyDetail.filter((x) => x?.operation === deliveryMethod.value);
    } else {
      await updateFilter(null);
      deliveryMethod.value = '';
    }
  });

  let step = $ref(0);

  async function updateFilter(filterObj) {
    allNotifyDetail = (await getReserveItems(filterObj))
      .filter((it) => it.instorageContainerNum > 0 || it.instorageTrayNum > 0)
      .map((it) => {
        it.outBoundTrayNum = it.instorageTrayNum;
        it.outBoundContainerNum = it.instorageContainerNum;
        it.originId = it.id;
        return it;
      });
  }

  async function init() {
    addressFormFields.unshift(await asyncCustomerFormField());
    await updateFilter(null);
  }

  function confirmSelection() {
    allNotifyDetail = allNotifyDetail.filter((it: any) => checkedRowKeys.value.includes(it.id));
    console.log(allNotifyDetail, 'log2');
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
    value.deliveryDetail = deliveryMethod.value ?? '';
    loading = true;
    allNotifyDetail.forEach((it) => {
      it.needCar = value.needCar;
      if (it.needCar === '1') {
        it.carStatus = CarStatus.UnAble;
      } else {
        it.carStatus = CarStatus.NoNeed;
      }
    });
    const res = {
      ...value,
      carStatus: value.needCar === '1' ? CarStatus.UnAble : CarStatus.NoNeed,
      outboundDetailInfo: [...allNotifyDetail],
    };
    await addOutboundForecast(res);
    await OutBoundPlanManager.add(value, allNotifyDetail);
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
    { title: '箱号', key: 'containerId' },
    { title: '托数', key: 'outBoundTrayNum' },
    { title: '箱数', key: 'outBoundContainerNum' },
    { title: '重量', key: 'weight' },
    { title: '体积', key: 'volume' },
    { title: '出库方式', key: 'operation' },
    { title: 'FBA号', key: 'FBA/DeliveryCode' },
    editableColumn({ title: '备注', key: 'note' }, allNotifyDetail),
  ]);
  const displayColumns: DataTableColumns<any> = $computed(() => [
    { title: '入库ID', key: 'notifyId' },
    { title: '票号', key: 'ticketId' },
    { title: '箱号', key: 'containerId' },
    { title: '托数', key: 'outBoundTrayNum' },
    { title: '箱数', key: 'outBoundContainerNum' },
    { title: '重量', key: 'weight' },
    { title: '体积', key: 'volume' },
    { title: '预计出库方式', key: 'operation' },
    { title: 'FBA号', key: 'FBA/DeliveryCode' },
    { title: '备注', key: 'note' },
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
        console.log(model.needCar, 'needCar');
        return model.needCar === '0';
      },
    },
    {
      field: 'detail',
      label: '明细',
    },
    {
      field: 'operationRequirement',
      label: '操作要求',
      componentProps: {
        type: 'textarea',
      },
    },
  ];

  const filters: FormField[] = [
    {
      label: '出库方式',
      field: 'operation',
      component: 'NSelect',
      componentProps: {
        options: deliveryDetailMethods.flat(),
      },
    },
  ];
</script>

<style lang="less" scoped></style>
