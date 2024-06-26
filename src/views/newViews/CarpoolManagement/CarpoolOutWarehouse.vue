<template>
  <n-card v-if="hasAuthPower('outStorageView')" :bordered="false" class="proCard">
    <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter">
      <n-button
        v-if="hasAuthPower('outStorageCarAdd')"
        style="margin-left: 10px"
        type="primary"
        @click="ImportFilesDialog = true"
        >库外订车</n-button
      >
      <n-button type="info" @click="downloadData"> 下载 </n-button>
    </filter-bar>
    <div class="mt-2" style="display: flex; align-items: center; justify-items: center">
      <n-card embedded size="small" style="max-width: 300px">
        <div style="display: flex">
          <n-select
            v-model:value="optionOne"
            :options="realOptions"
            placeholder="过滤项1"
            style="width: 130px"
          />
          <n-input
            v-model:value="valueOne"
            class="ml-2"
            placeholder="过滤值1"
            style="width: 130px"
            type="text"
          />
        </div>
      </n-card>
      <n-card class="ml-2" embedded size="small" style="max-width: 300px">
        <div style="display: flex">
          <n-select
            v-model:value="optionTwo"
            :options="realOptions"
            placeholder="过滤项2"
            style="width: 130px"
          />
          <n-input
            v-model:value="valueTwo"
            class="ml-2"
            placeholder="过滤值2"
            style="width: 130px"
            type="text"
          />
        </div>
      </n-card>
      <n-date-picker v-model:value="dateRange" class="ml-2" clearable type="daterange" />
    </div>
    <div class="my-2"></div>
    <BasicTable
      ref="actionRef"
      v-model:checked-row-keys="checkedRows"
      :actionColumn="actionColumn"
      :columns="outCarColumns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
    />
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
  import { Component, computed, h, onMounted, reactive, ref } from 'vue';
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
  import { valueOfToday } from '@/api/dataLayer/common/Date';
  import { generateOptionFromArray } from '@/store/utils/utils';
  import { columns } from '@/views/newViews/ContainerForecast/columns';
  import FileSaver from 'file-saver';
  import { getOutWarehouseDetailListById } from '@/api/dataLayer/modules/GetListById';

  const showModal = ref(false);

  let filterObj: any | null = $ref(null);
  let data: any = $ref([]);
  let currentModel: any | null = $ref(null);
  let paymentDialogShow: boolean = $ref(false);
  let selectedMonth: any | null = $ref('');
  let checkedRows = $ref([]);
  let ImportFilesDialog = $ref(false);
  let editDetailModel = $ref(false);
  let monthTab: any | null = $ref(null);
  let currentId = $ref('');
  let showOfferPrice = $ref(false);
  let optionOne = $ref('');
  let optionTwo = $ref('');
  let valueOne = $ref('');
  let valueTwo = $ref('');
  let dateRange = $ref(null);

  const realOptions = computed(() => {
    return generateOptionFromArray(columns.filter((it) => it.key).map((it) => it.title));
  });
  const loadDataTable = async () => {
    let res = (await OutWarehouseManager.load()).sort(dateCompare('realDate'));
    if (dateRange) {
      let startDate = dayjs(dateRange[0]).startOf('day').valueOf() ?? valueOfToday[0];
      let endDate = dayjs(dateRange[1]).endOf('day').valueOf() ?? valueOfToday[1];
      res = res.filter((it) => it.createTimestamp > startDate && it.createTimestamp < endDate);
    }
    return res;
  };

  async function downloadData() {
    let selectedList = [];
    if (checkedRows.length > 0) {
      selectedList = await getOutWarehouseDetailListById(checkedRows);
    } else {
      selectedList = await loadDataTable();
    }
    let headerTitle = outCarColumns
      .filter((it) => it.title)
      .map((it) => it.title)
      .join();
    let dataStrings = [];
    dataStrings.unshift(headerTitle);
    selectedList.forEach((it) => {
      const res = [
        it.realDate ?? '',
        it.channel ?? '',
        it.carType ?? '',
        it.customerId ?? '',
        it.orderId ?? '',
        it.trayNumber ?? '',
        it.boxNumber ?? '',
        it.stackable ?? '',
        it.needEquipment ?? '',
        it.pickingAddress ?? '',
        it.sendingAddress ?? '',
        it.pickingDate ?? '',
        it.sendingDate ?? '',
        it.platformOrderId ?? '',
        it.offerPrice ?? '',
        it.POD ?? '',
        it.size ?? '',
        it.demand ?? '',
        it.priceDemand ?? '',
        it.warehouseDeliveryFile ?? '',
        it.logisticsCompany ?? '',
        it.costPrice ?? '',
        it.logisticsPrice ?? '',
        it.status ?? '',
        it.note ?? '',
      ];
      dataStrings.push(res.join());
    });
    dataStrings = dataStrings.join('\n');
    const blob = new Blob([dataStrings], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, '库外订车' + '.csv');
  }

  onMounted(async () => {
    monthTab = OneYearMonthTab();
    selectedMonth = monthTab[0];
  });
  const actionRef = ref();

  function updateFilter(value) {
    if (value !== null) {
      if (optionOne && valueOne) {
        const keyOne = outCarColumns.find((it) => it.title === optionOne).key;

        value[keyOne] = valueOne;
      }
      if (optionTwo && valueTwo) {
        const keyTwo = outCarColumns.find((it) => it.title === optionTwo).key;
        value[keyTwo] = valueTwo;
      }
      filterObj = value;
    } else {
      filterObj = null;
      optionOne = '';
      valueOne = '';
      optionTwo = '';
      valueTwo = '';
      dateRange = null;
    }
    reloadTable();
  }

  function reloadTable() {
    actionRef.value.reload();
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
