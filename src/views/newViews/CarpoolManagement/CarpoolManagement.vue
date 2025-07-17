<template>
  <div>
    <n-card v-if="hasAuthPower('orderCarView')" :bordered="false" class="proCard">
      <filter-bar
        v-model="filterItems"
        :columns="columns"
        @clear="updateFilter(null)"
        @submit="updateFilter"
        @filter-change="updateFilterWithItems"
      />
      <div class="mt-2">
        <n-button class="action-button" size="small" type="info" @click="downloadData">
          <template #icon>
            <n-icon>
              <ArrowDownload20Regular />
            </n-icon>
          </template>
          下载
        </n-button>
      </div>
      <!-- Filter controls are now handled by FilterBar component -->
      <div class="my-2"></div>
      <BasicTable
        ref="actionRef"
        v-model:checked-row-keys="checkedRows"
        :actionColumn="actionColumn"
        :columns="columns"
        :pagination="paginationReactive"
        :request="loadDataTable"
        :row-key="(row) => row.id"
        @update:page="handlePageChange"
        @update:pageSize="handlePageSizeChange"
      />
      <n-modal
        v-model:show="editOutboundForecast"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 600px; max-width: 600px"
        title="编辑"
      >
        <edit-o-f :id="editId" @saved="saved" />
      </n-modal>
      <n-modal
        v-model:show="showShareCarModel"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 600px; max-width: 600px"
        title="新建"
      >
        <new-carpool-management
          :merged-out-ids="checkedRows"
          :type-name="typeName"
          @saved="saveShareCar"
        />
      </n-modal>
      <n-modal
        v-model:show="offerDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 600px; max-width: 600px"
        title="对外报价"
      >
        <offer-customer-dialog :info="currentInfo" @saved="saved" />
      </n-modal>
      <n-modal
        v-model:show="carDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 600px; max-width: 600px"
        title="订车信息"
      >
        <booking-car-dialog :info="currentInfo" @saved="saved" />
      </n-modal>
      <n-modal
        v-model:show="showConfirmCancelDialog"
        :show-icon="false"
        class="modal-small"
        preset="card"
        style="width: 600px"
        title="请确认"
      >
        <confirm-dialog :title="'确定取消订车吗?'" @saved="cancelOrderCar" />
      </n-modal>
    </n-card>
    <no-power-page v-else />
  </div>
</template>

<script lang="ts" setup>
import {
  ArrowDownload20Regular,
  Document20Regular, DocumentEdit20Regular,
  DrawImage20Regular,
  Payment20Regular,
  VehicleTruck20Regular,
  Warning20Regular
} from "@vicons/fluent";
  import { computed, h, onMounted, reactive, ref } from "vue";
  import { BasicTable, TableAction } from '@/components/Table';
  import { NIcon, NTooltip } from 'naive-ui';
  import { columns } from './columns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import { CarpoolManager } from '@/api/dataLayer/modules/logistic/carpool';
  import { useUserStore } from '@/store/modules/user';
  import dayjs from 'dayjs';
  import EditOF from '@/views/newViews/OperationDetail/NotOutbound/EditOF.vue';
  import NewCarpoolManagement from '@/views/newViews/CarpoolManagement/dialog/NewCarpoolManagement.vue';
  import { hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import { valueOfToday } from '@/api/dataLayer/common/Date';
  import FileSaver from 'file-saver';
  import {
    addOrUpdateWithRefOutboundForecast,
    getOutboundForecastListByFilterWithPagination,
  } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';
  import OfferCustomerDialog from '@/views/newViews/CarpoolManagement/dialog/OfferCustomerDialog.vue';
  import BookingCarDialog from '@/views/newViews/CarpoolManagement/dialog/BookingCarDialog.vue';
  import { useUploadDialog } from '@/store/modules/uploadFileState';
  import * as XLSX from 'xlsx';
  import ConfirmDialog from "@/views/newViews/Common/ConfirmDialog.vue";
  import {
    updateTaskListAfterBookingCarWithInfo, updateTaskListAfterCancelBookingCarWithInfo
  } from "@/api/dataLayer/modules/OutboundForecast/OutboundForecast";
import router from "@/router";

  const showModal = ref(false);

  let filterObj: any | null = $ref(null);
  let currentModel: any | null = $ref(null);
  let paymentDialogShow: boolean = $ref(false);
  let selectedMonth: any | null = $ref('');
  let monthTab: any | null = $ref(null);
  let editOutboundForecast = $ref(false);
  let showShareCarModel = $ref(false);
  let checkedRows = $ref([]);
  let typeName = $ref('');
  let editId = $ref('');
  let allList = $ref([]);
  let showAll = $ref(false);
  let dateRange = $ref(null);
  let currentInfo = $ref({});
  let offerDialog = $ref(false);
  let carDialog = $ref(false);
  let filterItems = $ref<Array<{ option: string; value: string }>>([]);

  const paginationReactive = reactive({
    defaultPage: 1,
    pageNumber: 0,
    pageSize: 10,
    defaultPageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    onChange: (page: number) => {
      paginationReactive.pageNumber = page - 1;
      // reloadTable() is called by handlePageChange, no need to call it here
    },
    onUpdatePageSize: (pageSize: number) => {
      paginationReactive.pageSize = pageSize;
      paginationReactive.pageNumber = 0;
      // Let the BasicTable component handle the data fetching
    },
  });
  const loadDataTable = async () => {
    // Build filter criteria
    let currentFilter = [];

    if (filterObj) {
      // Handle array format (from FilterBar)
      const filterOne = filterObj.filter((it) => it?.component?.name !== 'DatePicker');
      const filterTwo = filterObj.filter((it) => it?.component?.name === 'DatePicker');

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

      currentFilter = currentFilter.concat(filterWithOutDate, filterWithDate);
    }
    // currentFilter.push({
    //   field: 'inStatus',
    //   op: '!=',
    //   value: '无需订车',
    // });
    currentFilter.map((it) => {
      if (it.field === 'id') {
        it.op = '=='
        it.value = parseFloat(it.value.replace(/^%|%$/g, ""))
      }
    })
    // Get paginated data
    const res = await getOutboundForecastListByFilterWithPagination(
      currentFilter,
      paginationReactive
    );
    let allList = res.content;
    const totalCount = res.page.totalElements;

    // Apply date range filter if needed
    if (dateRange) {
      let startDate = dayjs(dateRange[0]).startOf('day').valueOf() ?? valueOfToday[0];
      let endDate = dayjs(dateRange[1]).endOf('day').valueOf() ?? valueOfToday[1];
      allList = allList.filter(
        (it) => it.createTimestamp > startDate && it.createTimestamp < endDate
      );
    }

    // Create fake list items for pagination display
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

    // Return results with fake items for pagination
    return fakeListStart.concat(allList.concat(fakeListEnd));
  };
  const actionRef = ref();
  let showConfirmCancelDialog = $ref(false);

  async function cancelOrderCar () {
    currentInfo.AMZID = '';
    currentInfo.ISA = '';
    currentInfo.bookCarTimestamp = '';
    currentInfo.carStatus = '';
    currentInfo.note = '';
    currentInfo.reservationGetProductDetailTime = '';
    currentInfo.reservationGetProductTime = '';
    currentInfo.waitCar = '0';
    currentInfo.waybillId = '';
    currentInfo.logisticsCompany = '';
    currentInfo.inStatus = '待订车';
    await updateTaskListAfterCancelBookingCarWithInfo(currentInfo.id, currentInfo);
    await addOrUpdateWithRefOutboundForecast(currentInfo);
    showConfirmCancelDialog = false
    reloadTable();
  }

  async function downloadData() {
    try {
      let selectedList = [];
      selectedList = await loadDataTable();
      // Create a 2D array for Excel data
      const data = [];
      const headers = columns.filter((it) => it.title).map((it) => it.title);
      data.push(headers);

      // Add data rows
      selectedList.forEach((item) => {
        const row = [];
        columns
          .filter((col) => col.title)
          .forEach((col) => {
            // Handle nested properties like 'customer.customerName'
            if (col.key && col.key.includes('.')) {
              const keys = col.key.split('.');
              let value = item;
              for (const key of keys) {
                value = value && value[key];
              }
              row.push(value || '');
            } else if (col.key) {
              // Handle date fields
              if (col.key === 'createTimestamp' && item[col.key]) {
                row.push(dayjs(item[col.key]).format('YYYY-MM-DD'));
              } else if (col.key === 'reservationGetProductTime' && item[col.key]) {
                row.push(dayjs(item[col.key]).format('YYYY-MM-DD'));
              } else {
                row.push(item[col.key] || '');
              }
            } else {
              row.push('');
            }
          });

        // Only add non-empty rows to the data array
        // Check if the row has at least one non-empty value
        const hasValue = row.some((value) => value !== '' && value !== null && value !== undefined);
        if (hasValue) {
          data.push(row);
        }
      });

      // Add data rows - filter out any rows with all empty values

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(data);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

      // Save file
      FileSaver.saveAs(blob, '订车管理.xlsx');
    } catch (error) {
      console.error('下载失败:', error);
    }
  }

  function startShareCar(item) {
    // typeName = item;
    // showShareCarModel = true;
    carDialog = true;
  }

  async function saveShareCar() {
    reloadTable();
    checkedRows = [];
  }

  function updateFilter(value) {
    filterObj = value;
    if (value === null) {
      dateRange = null;
    }
    reloadTable();
  }

  function updateFilterWithItems(value) {
    filterObj = value;
    reloadTable();
  }

  function handlePageChange(page: number) {
    paginationReactive.pageNumber = page - 1;
    reloadTable();
  }

  function handlePageSizeChange(pageSize: number) {
    paginationReactive.pageSize = pageSize;
    paginationReactive.pageNumber = 0;
    reloadTable();
  }

  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
    showShareCarModel = false;
    paymentDialogShow = false;
    editOutboundForecast = false;
    offerDialog = false;
    carDialog = false;
    showConfirmCancelDialog = false
  }

  function saved() {
    reloadTable();
  }

  async function startEdit(id) {
    currentModel = await CarpoolManager.getById(id);
    showModal.value = true;
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

  const AccountPowerList = computed(() => {
    return useUserStore()?.info?.powerList;
  });
  function startEditOF(id) {
    editId = id;
    editOutboundForecast = true;
  }

  function getQueryString(name) {
    return (
      decodeURIComponent(
        (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [
          '',
          '',
        ])[1].replace(/\+/g, '%20')
      ) || null
    );
  }

  onMounted(async () => {
    const res = getQueryString('id');
    if (res) {
      filterItems.push({
        option: 'id',
        key: 'id',
        value: res,
        display: res,
      });
      updateFilter(filterItems);
    } else {
      await reloadTable();
    }
  });

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 100,
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
                await addOrUpdateWithRefOutboundForecast(record);
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
            icon: renderIconWithTooltip(Payment20Regular, '对外报价'),
            onClick() {
              currentInfo = record;
              offerDialog = true;
            },
            ifShow: () => {
              return record.needOfferPrice === '1'
            },
            highlight: () => {
              return record?.['waitPrice'] === '1' ? 'success' : 'error';
            },
          },
          {
            icon: renderIconWithTooltip(VehicleTruck20Regular, '订车'),
            onClick() {
              currentInfo = record;
              carDialog = true;
            },
            ifShow: () => {
              return record.needCar === '1'
            },
            highlight: () => {
              return record?.['waitCar'] === '1' ? 'success' : 'error';
            },
          },
          {
            icon: renderIconWithTooltip(DrawImage20Regular, 'POD'),
            highlight: () => {
              return record?.['podfiles']?.length > 0 ? 'success' : 'error';
            },
            async onClick() {
              const upload = useUploadDialog();
              const files = await upload.upload(record['podfiles']);
              if (files.checkPassed) {
                record.PODFiles = files.files;
                await addOrUpdateWithRefOutboundForecast(record);
              }
              await actionRef.value.reload();
            },
            ifShow: () => {
              return hasAuthPower('orderCarPOD');
            },
          },
          iconFileAction('提单', 'pickupFiles', Document20Regular, 'orderCarOrder'),
          {
            icon: renderIconWithTooltip(Warning20Regular, '取消订车'),
            onClick() {
              currentInfo = record;
              showConfirmCancelDialog = true;
            },
            ifShow: () => {
              return record.needCar === '1' && record?.['waitCar'] === '1' && record?.['inStatus'] !== '已完成'
            },
            highlight: () => {
              return 'error'
            },
          },
          {
            icon: renderIconWithTooltip(Warning20Regular, '审核'),
            async onClick() {
              await router.push('/car/carBookingDetail?id=' + record.id);
            },
            ifShow: () => {
              return record.inStatus === '等待审核'
            },
            highlight: () => {
              return 'error'
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
