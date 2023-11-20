<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <template v-if="step == 0">
        <filter-bar :form-fields="searchSchema" @clear="updateFilter" @submit="updateFilter" />
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
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { onMounted, ref } from 'vue';
  import { DataTableColumns } from 'naive-ui';
  import { getReserveItems } from '@/api/dataLayer/modules/notify/notify-detail';
  import { editableColumn } from '@/views/bolita-views/composable/useableColumns';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import {
    asyncCustomerFormField,
    getFilesUploadFormField,
  } from '@/api/dataLayer/fieldDefination/common';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { safeParseInt, toastError } from '@/store/utils/utils';
  import { groupBy } from 'lodash';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { OutBoundPlanManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';
  import { afterPlanDetailAdded } from '@/api/dataLayer/modules/OutBoundPlan/outAddHook';

  interface Props {
    model?: any;
    initialKey?: any[];
  }

  const prop = defineProps<Props>();
  const emit = defineEmits(['saved']);
  const checkedRowKeys = ref<any[]>([]);
  const groupNotifyDetail = ref<any[]>([]);
  onMounted(async () => {
    await init();
    checkedRowKeys.value = prop?.initialKey ?? [];
    if (checkedRowKeys.value.length > 0) {
      allNotifyDetail = allNotifyDetail.filter((it: any) => checkedRowKeys.value.includes(it.id));
    }
    console.log(allNotifyDetail, 'all');
    groupNotifyDetail.value = groupBy(allNotifyDetail, 'deliveryDetail');
    console.log(groupNotifyDetail.value, 'log1');
  });
  let allNotifyDetail: any[] = $ref([]);
  let loading: boolean = $ref(false);

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
    loading = true;
    for (const item in groupNotifyDetail.value) {
      value.planList = groupNotifyDetail.value[item];
      value.deliveryMethod = value.planList[0].deliveryMethod;
      value.deliveryDetail = value.planList[0].deliveryDetail;
      await OutBoundPlanManager.add(value, groupNotifyDetail.value[item]);
      await afterPlanDetailAdded(groupNotifyDetail.value[item]);
    }
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
    { title: '物流方式', key: 'deliveryMethod' },
    { title: '物流详情', key: 'deliveryDetail' },
    { title: '票号', key: 'ticketId' },
    editableColumn({ title: '箱号', key: 'containerId' }, allNotifyDetail),
    editableColumn({ title: '托数', key: 'outBoundTrayNum', width: 60 }, allNotifyDetail),
    editableColumn({ title: '箱数', key: 'outBoundContainerNum', width: 60 }, allNotifyDetail),
    editableColumn({ title: '长', key: 'length', width: 60 }, allNotifyDetail),
    editableColumn({ title: '宽', key: 'width', width: 60 }, allNotifyDetail),
    editableColumn({ title: '高', key: 'height', width: 60 }, allNotifyDetail),
    editableColumn({ title: '重量', key: 'weightKg', width: 60 }, allNotifyDetail),
    editableColumn({ title: '体积', key: 'volume', width: 60 }, allNotifyDetail),
    editableColumn({ title: 'FBA号', key: 'FBANo' }, allNotifyDetail),
    editableColumn({ title: '备注', key: 'note' }, allNotifyDetail),
  ]);
  const displayColumns: DataTableColumns<any> = $computed(() => [
    { title: '入库ID', key: 'notifyId' },
    { title: '物流详情', key: 'deliveryDetail' },
    { title: '票号', key: 'ticketId' },
    { title: '箱号', key: 'containerId' },
    { title: '托数', key: 'outBoundTrayNum' },
    { title: '箱数', key: 'outBoundContainerNum' },
    { title: '物流详情', key: 'deliveryDetail' },
    { title: '地址', key: 'deliveryAddress' },
    { title: '物流方式', key: 'deliveryMethod' },
    { title: '长', key: 'length' },
    { title: '宽', key: 'width' },
    { title: '高', key: 'height' },
    { title: '重量', key: 'weightKg' },
    { title: '体积', key: 'volume' },
    { title: 'FBA号', key: 'FBANo' },
    { title: '备注', key: 'note' },
  ]);
  const searchSchema: FormField[] = [
    { label: '入库ID', field: 'notifyId' },
    { label: '票号', field: 'ticketId' },
    { label: '货柜号', field: 'containerNo' },
  ];

  const addressFormFields: FormField[] = [
    getFilesUploadFormField('files', false),
    {
      field: 'operationRequirement',
      label: '操作要求',
      componentProps: {
        type: 'textarea',
      },
    },
  ];
</script>

<style lang="less" scoped></style>
