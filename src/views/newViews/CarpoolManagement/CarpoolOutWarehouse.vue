<template>
  <n-card v-if="hasAuthPower('outStorageView')" :bordered="false" class="proCard">
    <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter">
      <n-button
        v-if="hasAuthPower('outStorageCarAdd')"
        size="small"
        style="margin-left: 10px"
        type="primary"
        @click="ImportFilesDialog = true"
        >库外订车</n-button
      >
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
          :actionColumn="actionColumn"
          :columns="outCarColumns"
          :request="loadDataTable"
          :row-key="(row) => row.id"
        />
      </n-tab-pane>
    </n-tabs>
    <n-modal
      v-model:show="ImportFilesDialog"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="库外订车"
    >
      <import-out-warehouse-file @saved="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="editDetailModel"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="编辑详情"
    >
      <out-car-detail :model="currentModel" @saved="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="showOfferPrice"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 800px; max-width: 800px"
      title="报价表"
    >
      <out-warehouse-car-offer :ids="currentId" @save="reloadTable" />
    </n-modal>
  </n-card>
  <no-power-page v-else />
</template>

<script lang="ts" setup>
  import { Component, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { filters, outCarColumns } from './columns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import { dateCompare, OneYearMonthTab } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';
  import { hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import ImportOutWarehouseFile from '@/views/newViews/CarpoolManagement/ImportOutWarehouseFile.vue';
  import { OutWarehouseManager } from '@/api/dataLayer/modules/OutWarehouseCar/OutWarehouseModel';
  import OutCarDetail from '@/views/newViews/CarpoolManagement/OutCarDetail.vue';
  import OutWarehouseCarOffer from '@/views/newViews/CarpoolManagement/OutWarehouseCarOffer.vue';
  import { useUploadDialog } from '@/store/modules/uploadFileState';

  const showModal = ref(false);

  let filterObj: any | null = $ref(null);
  let data: any = $ref([]);
  let currentModel: any | null = $ref(null);
  let paymentDialogShow: boolean = $ref(false);
  let selectedMonth: any | null = $ref('');
  let ImportFilesDialog = $ref(false);
  let editDetailModel = $ref(false);
  let monthTab: any | null = $ref(null);
  let currentId = $ref('');
  let showOfferPrice = $ref(false);
  const loadDataTable = async () => {
    const res = (await OutWarehouseManager.load())
      .filter((x) => dayjs(x.createTimestamp).format('YYYY-MM') === selectedMonth)
      .sort(dateCompare('realDate'));
    console.log(res, 'res');
    return res;
  };

  onMounted(async () => {
    monthTab = OneYearMonthTab();
    selectedMonth = monthTab[0];
  });
  const actionRef = ref();

  function updateFilter(value) {
    if (value !== null) {
      let { filterTitleOne, filterKeyOne, filterTitleTwo, filterKeyTwo, ...NewObj } = value;
      if (
        (value['filterTitleOne'] && value['filterKeyOne']) ||
        (value['filterTitleTwo'] && value['filterKeyTwo'])
      ) {
        const keyOne = outCarColumns.find((it) => it.title === value['filterTitleOne']).key;
        const keyTwo = outCarColumns.find((it) => it.title === value['filterTitleTwo']).key;
        if (keyOne) {
          NewObj[keyOne] = value['filterKeyOne'];
        }
        if (keyTwo) {
          NewObj[keyTwo] = value['filterKeyTwo'];
        }
      }
      filterObj = NewObj;
    } else {
      filterObj = null;
    }
    reloadTable();
  }

  function reloadTable() {
    actionRef.value[0].reload();
    editDetailModel = false;
    showOfferPrice = false;
    ImportFilesDialog = false;
    paymentDialogShow = false;
  }

  async function startEdit(id) {
    currentModel = await OutWarehouseManager.getById(id);
    editDetailModel = true;
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record: any) {
      const fileAction = (label, key, icon?: Component, power) => {
        return getFileActionButton(
          label,
          key,
          OutWarehouseManager,
          reloadTable,
          record,
          icon,
          power
        );
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '修改',
            onClick() {
              startEdit(record.id);
            },
            ifShow: () => {
              return hasAuthPower('outStorageEdit');
            },
          },
          {
            label: '物流报价',
            onClick() {
              currentId = record.id;
              showOfferPrice = true;
            },
            ifShow: () => {
              return hasAuthPower('outStorageEdit');
            },
          },
          {
            label: '下单',
            async onClick() {
              record.status = '已下单';
              await OutWarehouseManager.editInternal(record, record.id);
              reloadTable();
            },
            ifShow: () => {
              return hasAuthPower('outStorageConfirmOrder');
            },
          },
          fileAction('POD', 'POD', '', 'outStoragePOD'),
          {
            label: '送仓文件',
            highlight: () => {
              return record?.['warehouseSendingFile']?.length > 0 ? 'success' : 'error';
            },
            ifShow: () => {
              return record?.warehouseDeliveryFile === '是';
            },
            disabled: !hasAuthPower('outStorageSendFile'),
            async onClick() {
              const upload = useUploadDialog();
              const files = await upload.upload(record['warehouseSendingFile']);
              if (files.checkPassed) {
                const obj = {};
                obj['warehouseDeliveryFile'] = files.files;
                await OutWarehouseManager.editInternal(obj, record.id);
              }
              actionRef.value[0].reload();
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
