<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <template v-if="step == 0">
        <filter-bar :form-fields="searchSchema" @submit="updateFilter" @clear="updateFilter" />
        <n-data-table
          class="mt-4"
          v-model:checked-row-keys="checkedRowKeys"
          virtual-scroll
          max-height="450"
          v-if="allNotifyDetail.length > 0"
          :columns="columns"
          :data="allNotifyDetail"
        />
        <n-space
          v-if="checkedRowKeys.length > 0"
          class="mt-4"
          align="center"
          justify="space-between"
        >
          <div>已经选择{{ checkedRowKeys.length }}条记录 </div>
          <n-button @click="confirmSelection" :disabled="checkedRowKeys.length == 0" type="primary"
            >确定
          </n-button>
        </n-space>
      </template>
      <template v-else>
        <n-data-table
          class="mt-4"
          v-model:checked-row-keys="checkedRowKeys"
          virtual-scroll
          max-height="450"
          v-if="allNotifyDetail.length > 0"
          :columns="displayColumns"
          :data="allNotifyDetail"
        />
        <normal-form class="mt-8" :form-fields="addressFormFields" @submit="saveOutboundPlan" />
      </template>
    </loading-frame>
  </n-card>
</template>
<script lang="ts" setup>
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { onMounted, ref } from 'vue';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { DataTableColumns } from 'naive-ui';
  import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
  import { editableColumn } from '@/views/bolita-views/composable/useableColumns';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { getTargetAddressSelectionGroup } from '@/api/dataLayer/fieldDefination/addressGroup';
  import {
    asyncCustomerFormField,
    getDatePickerFormField,
    getFilesUploadFormField,
    salesFormField,
  } from '@/api/dataLayer/fieldDefination/common';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { OutBoundPlanManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';
  import { handleRequest } from '@/store/utils/utils';

  interface Props {
    model?: any;
  }

  defineProps<Props>();
  const emit = defineEmits(['saved']);
  onMounted(async () => {
    await init();
  });
  let allNotifyDetail: any[] = $ref([]);
  let loading: boolean = $ref(false);
  const checkedRowKeys = ref([]);
  let step = $ref(0);

  async function updateFilter(filterObj) {
    checkedRowKeys.value = [];
    if (!filterObj) {
      allNotifyDetail = [];
    } else {
      allNotifyDetail = (await NotifyDetailManager.load(filterObj)).map((it) => {
        it.key = it.notifyId + it.id;
        return it;
      });
    }
  }
  async function init() {
    addressFormFields.unshift(await asyncCustomerFormField());
    await updateFilter(null);
  }

  function confirmSelection() {
    allNotifyDetail = allNotifyDetail.filter((it) => checkedRowKeys.value.includes(it.key));
    step = 1;
  }

  async function saveOutboundPlan(value) {
    loading = true;
    value.planList = allNotifyDetail;
    const res = await OutBoundPlanManager.add(value);
    await handleRequest(res, () => {
      emit('saved');
    });
    loading = false;
  }

  const columns: DataTableColumns<any> = $computed(() => [
    {
      type: 'selection',
      key: 'selection',
    },
    { title: '入库ID', key: 'notifyId' },
    { title: '票号', key: 'id' },
    editableColumn({ title: '箱号', key: 'containerId' }, allNotifyDetail),
    editableColumn({ title: '产品SKU', key: 'productSKU' }, allNotifyDetail),
    editableColumn({ title: '托数', key: 'trayNum' }, allNotifyDetail),
    editableColumn({ title: '箱数', key: 'containerNum' }, allNotifyDetail),
    editableColumn({ title: '长', key: 'length' }, allNotifyDetail),
    editableColumn({ title: '宽', key: 'width' }, allNotifyDetail),
    editableColumn({ title: '高', key: 'height' }, allNotifyDetail),
    editableColumn({ title: '重量', key: 'weightKg' }, allNotifyDetail),
    editableColumn({ title: '体积', key: 'volume' }, allNotifyDetail),
    editableColumn({ title: 'FBA号', key: 'FBANo' }, allNotifyDetail),
    editableColumn({ title: '备注', key: 'note' }, allNotifyDetail),
  ]);
  const displayColumns: DataTableColumns<any> = $computed(() => [
    {
      type: 'selection',
      key: 'selection',
    },
    { title: '入库ID', key: 'notifyId' },
    { title: '票号', key: 'id' },
    { title: '箱号', key: 'containerId' },
    { title: '产品SKU', key: 'productSKU' },
    { title: '托数', key: 'trayNum' },
    { title: '箱数', key: 'containerNum' },
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
    { label: '票号', field: 'id' },
    { label: '货柜号', field: 'containerNo' },
  ];

  const addressFormFields: FormField[] = [
    getDatePickerFormField('reservationOutboundDate', '预约出库日期'),
    salesFormField,
    getFilesUploadFormField(),
    {
      field: 'operationRequirement',
      label: '操作要求',
      componentProps: {
        type: 'textarea',
      },
      required: true,
    },
    ...getTargetAddressSelectionGroup(),
  ];
</script>

<style lang="less" scoped></style>
