<template>
  <n-card class="proCard">
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
      <n-space v-if="checkedRowKeys.length > 0" class="mt-4" align="center" justify="space-between">
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
      <normal-form class="mt-8" :form-fields="addressFormFields" />
    </template>
  </n-card>
</template>
<script lang="ts" setup>
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { onMounted, ref } from 'vue';
  import { listUser, PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { DataTableColumns } from 'naive-ui';
  import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
  import { editableColumn } from '@/views/bolita-views/composable/useableColumns';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { getTargetAddressSelectionGroup } from '@/api/dataLayer/fieldDefination/addressGroup';
  import { getFilesUploadFormField } from '@/api/dataLayer/fieldDefination/common';

  interface Props {
    model?: any;
  }

  defineProps<Props>();

  let customerList = ref<any[]>([]);
  let allNotifyDetail: any[] = $ref([]);

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

  const emit = defineEmits(['submit']);

  async function init() {
    customerList.value = (await listUser(PermissionEnums.Customer)).result.map((it) => ({
      label: it.realName,
      value: it.id,
    }));
    await updateFilter(null);
  }
  onMounted(async () => {
    await init();
  });
  const checkedRowKeys = ref([]);
  let step = $ref(0);
  function confirmSelection() {
    allNotifyDetail = allNotifyDetail.filter((it) => checkedRowKeys.value.includes(it.key));
    step = 1;
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
    {
      field: 'operationRequirement',
      label: '操作要求',
      componentProps: {
        type: 'textarea',
      },
      required: true,
    },
    getFilesUploadFormField(),
    ...getTargetAddressSelectionGroup(),
  ];
</script>

<style lang="less" scoped></style>
