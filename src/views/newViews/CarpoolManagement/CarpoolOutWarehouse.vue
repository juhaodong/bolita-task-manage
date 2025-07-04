<template>
  <n-card v-if="hasAuthPower('outStorageView')" :bordered="false" class="proCard">
    <filter-bar
      v-model="filterItems"
      v-model:dateRange="dateRange"
      v-model:showAll="showAll"
      :columns="outCarColumns"
      @clear="updateFilter(null)"
      @submit="updateFilter"
      @filter-change="updateFilterWithItems"
    />
    <div class="my-2"></div>
    <n-button
      v-if="hasAuthPower('outStorageCarAdd')"
      class="action-button"
      size="small"
      type="primary"
      @click="ImportFilesDialog = true"
    >
      <template #icon>
        <n-icon>
          <DocumentAdd20Regular />
        </n-icon>
      </template>
      库外订车
    </n-button>
    <n-button class="action-button" size="small" type="info" @click="downloadData">
      <template #icon>
        <n-icon>
          <ArrowDownload20Regular />
        </n-icon>
      </template>
      下载
    </n-button>
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
  import { computed, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { outCarColumns } from './columns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import { hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import ImportOutWarehouseFile from '@/views/newViews/CarpoolManagement/ImportOutWarehouseFile.vue';
  import { OutWarehouseManager } from '@/api/dataLayer/modules/OutWarehouseCar/OutWarehouseModel';
  import OutCarDetail from '@/views/newViews/CarpoolManagement/OutCarDetail.vue';
  import OutWarehouseCarOffer from '@/views/newViews/CarpoolManagement/OutWarehouseCarOffer.vue';
  import { useUploadDialog } from '@/store/modules/uploadFileState';
  import { generateOptionFromArray } from '@/store/utils/utils';
  import { columns } from '@/views/newViews/ContainerForecast/columns';
  import FileSaver from 'file-saver';
  import { getOutWarehouseDetailListById } from '@/api/dataLayer/modules/GetListById';
  import { NIcon, NTooltip } from 'naive-ui';
  import {
    ArrowDownload20Regular,
    Delete20Regular,
    DocumentAdd20Regular,
    DocumentEdit20Regular,
    Image20Regular,
  } from '@vicons/fluent';
  import {
    deleteExternalVehicleList,
    getExternalVehicleList,
    updateExternalVehicle,
  } from '@/api/newDataLayer/CarManage/ExternalVehicle';
  import dayjs from 'dayjs';

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
  let filterItems = $ref<Array<{ option: string; value: string }>>([]);
  let showAll = $ref(false);

  const realOptions = computed(() => {
    return generateOptionFromArray(columns.filter((it) => it.key).map((it) => it.title));
  });
  const loadDataTable = async () => {
    let res = await getExternalVehicleList();
    console.log(res);
    return res;
    // let res = (await OutWarehouseManager.load()).sort(dateCompare('realDate'));
    // if (dateRange) {
    //   let startDate = dayjs(dateRange[0]).startOf('day').valueOf() ?? valueOfToday[0];
    //   let endDate = dayjs(dateRange[1]).endOf('day').valueOf() ?? valueOfToday[1];
    //   res = res.filter((it) => it.createTimestamp > startDate && it.createTimestamp < endDate);
    // }
    // return res;
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

  onMounted(async () => {});
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

  function updateFilterWithItems(value) {
    filterObj = value;
    reloadTable();
  }

  // Helper function to render icon with tooltip
  const renderIconWithTooltip = (icon, tooltip) => {
    return () =>
      h(
        NTooltip,
        { trigger: 'hover', placement: 'top' },
        {
          trigger: () => h(NIcon, { size: 18, class: 'action-icon' }, { default: () => h(icon) }),
          default: () => tooltip,
        }
      );
  };

  function reloadTable() {
    actionRef.value.reload();
    editDetailModel = false;
    showOfferPrice = false;
    ImportFilesDialog = false;
    paymentDialogShow = false;
  }

  async function startEdit(record) {
    // Transform deliveryDate and pickupDate using dayjs for proper display in NDatePicker
    // NDatePicker with type="datetime" expects a timestamp (milliseconds)
    if (record.deliveryDate) {
      // Ensure the date is a valid timestamp
      record.deliveryDate = dayjs(record.deliveryDate).isValid()
        ? dayjs(record.deliveryDate).valueOf()
        : null;
    }
    if (record.pickupDate) {
      // Ensure the date is a valid timestamp
      record.pickupDate = dayjs(record.pickupDate).isValid()
        ? dayjs(record.pickupDate).valueOf()
        : null;
    }
    currentModel = record;
    editDetailModel = true;
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 200,
    render(record: any) {
      // Custom file action with icon
      const iconFileAction = (label, key, icon, power) => {
        return {
          icon: renderIconWithTooltip(icon, label),
          onClick: async () => {
            try {
              const upload = useUploadDialog();
              const files = await upload.upload(record[key]);
              if (files.checkPassed) {
                record[key] = files.files;
                await OutWarehouseManager.editInternal(record, record.id);
                reloadTable();
              }
            } catch (error) {
              console.error('上传失败:', error);
            }
          },
          ifShow: () => {
            return hasAuthPower(power);
          },
        };
      };

      return h(TableAction as any, {
        style: 'text',
        actions: [
          {
            icon: renderIconWithTooltip(DocumentEdit20Regular, '修改'),
            onClick() {
              record.customerName = record.customer.customerName;
              startEdit(record);
            },
            ifShow: () => {
              return hasAuthPower('outStorageEdit');
            },
          },
          {
            icon: renderIconWithTooltip(Image20Regular, '文件'),
            highlight: () => {
              return record?.['files']?.length > 1 ? 'success' : 'error';
            },
            disabled: !hasAuthPower('outStorageSendFile'),
            async onClick() {
              const upload = useUploadDialog();
              const files = await upload.upload(record['files']);
              if (files.checkPassed) {
                record.files = files.files;
                await updateExternalVehicle(record);
              }
              actionRef.value.reload();
            },
          },
          {
            icon: renderIconWithTooltip(Delete20Regular, '删除'),
            async onClick() {
              try {
                await deleteExternalVehicleList(record.id);
                reloadTable();
              } catch (error) {
                console.error('删除失败:', error);
              }
            },
            ifShow: () => {
              return hasAuthPower('outStorageEdit');
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped>
  .action-button {
    margin-right: 8px;
  }

  .filter-container {
    display: flex;
    align-items: center;
    margin-top: 8px;
    flex-wrap: wrap;
  }

  .filter-card {
    max-width: 300px;
  }

  .filter-row {
    display: flex;
    align-items: center;
  }

  /* Styles for action icons */
  :deep(.action-icon) {
    margin: 0 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  :deep(.n-icon) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :deep(.n-tooltip) {
    max-width: 200px;
    word-break: keep-all;
  }
</style>
