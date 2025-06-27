<template>
  <div>
    <n-card v-if="hasAuthPower('orderCarView')" :bordered="false" class="proCard">
      <filter-bar
        v-model="filterItems"
        v-model:dateRange="dateRange"
        v-model:showAll="showAll"
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
        <!--      <n-checkbox v-model:checked="showAll" class="ml-2" label="全部" size="large" />-->
      </div>
      <div class="my-2"></div>
      <BasicTable
        ref="actionRef"
        v-model:checked-row-keys="checkedRows"
        :actionColumn="actionColumn"
        :columns="columns"
        :request="loadDataTable"
        :row-key="(row) => row.id"
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
    </n-card>
    <no-power-page v-else />
  </div>
</template>

<script lang="ts" setup>
  import { ArrowDownload20Regular, Box20Filled } from '@vicons/fluent';
  import { computed, h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { NIcon, NTooltip } from 'naive-ui';
  import { columns } from './columns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import { CarpoolManager } from '@/api/dataLayer/modules/logistic/carpool';
  import { useUserStore } from '@/store/modules/user';
  import { dateCompare } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';
  import EditOF from '@/views/newViews/OperationDetail/NotOutbound/EditOF.vue';
  import NewCarpoolManagement from '@/views/newViews/CarpoolManagement/dialog/NewCarpoolManagement.vue';
  import { hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import { valueOfToday } from '@/api/dataLayer/common/Date';
  import { generateOptionFromArray } from '@/store/utils/utils';
  import FileSaver from 'file-saver';
  import { getOutboundForecastListByFilter } from '@/api/newDataLayer/CarManage/CarManage';
  import OfferCustomerDialog from '@/views/newViews/CarpoolManagement/dialog/OfferCustomerDialog.vue';
  import BookingCarDialog from '@/views/newViews/CarpoolManagement/dialog/BookingCarDialog.vue';
  import { useUploadDialog } from '@/store/modules/uploadFileState';
  import { addOrUpdateWithRefOutboundForecast } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';
  import * as XLSX from 'xlsx';

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
  let optionOne = $ref('');
  let optionTwo = $ref('');
  let valueOne = $ref('');
  let valueTwo = $ref('');
  let showAll = $ref(false);
  let dateRange = $ref(null);
  let currentInfo = $ref({});
  let offerDialog = $ref(false);
  let carDialog = $ref(false);
  let filterItems = $ref<Array<{ option: string; value: string }>>([]);
  const loadDataTable = async () => {
    let currentFilter = [
      {
        field: 'inStatus',
        op: '!=',
        value: '无需订车',
      },
    ];
    if (filterObj) {
      const res = Object.keys(filterObj);
      for (const filterItem of res) {
        currentFilter.push({
          field: filterItem,
          op: filterObj[filterItem] ? 'like' : '!=',
          value: '%' + filterObj[filterItem] + '%' ?? '',
        });
      }
    }
    allList = (await getOutboundForecastListByFilter(currentFilter)).sort(
      dateCompare('createTimestamp')
    );
    // if (!showAll) {
    //   allList = allList.filter((a) => a.inStatus !== '已取消');
    // }
    if (dateRange) {
      let startDate = dayjs(dateRange[0]).startOf('day').valueOf() ?? valueOfToday[0];
      let endDate = dayjs(dateRange[1]).endOf('day').valueOf() ?? valueOfToday[1];
      allList = allList.filter(
        (it) => it.createTimestamp > startDate && it.createTimestamp < endDate
      );
    }
    return allList;
  };
  const actionRef = ref();

  async function downloadData() {
    let selectedList = [];
    selectedList = await loadDataTable();
    let headerTitle = columns.filter((it) => it.title).map((it) => it.title);
    let data = [];
    data.unshift(headerTitle);
    selectedList.forEach((it) => {
      const res = [
        it.id ?? '',
        it.createTimestamp ? dayjs(parseFloat(it.createTimestamp)).format('YYYY-MM-DD') : '',
        it.inStatus ?? '',
        it.deliveryMethod ?? '',
        it.waybillId ?? '',
        it.trayNum ?? '',
        it.totalNumber ?? '',
        it.totalOutOffer ?? '',
        it.costPrice ?? '',
        it.suggestedPrice ?? '',
        it.postcode ?? '',
        it.FCAddress ?? '',
        it.REF ?? '',
        it.ISA ?? '',
        it.logisticsCompany ?? '',
        it.amzid ?? '',
        it.trayNum ?? '',
        it.reservationGetProductTime
          ? dayjs(parseFloat(it.reservationGetProductTime)).format('YYYY-MM-DD')
          : '',
        it.reservationGetProductDetailTime ?? '',
        it.note ?? '',
      ];
      data.push(res);
    });
    // 创建一个工作簿
    const workbook = XLSX.utils.book_new();
    // 将数据转换为工作表
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // 生成Excel文件
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    // 保存文件
    FileSaver.saveAs(blob, '订车管理.xlsx');
  }
  const realOptions = computed(() => {
    return generateOptionFromArray(columns.filter((it) => it.key).map((it) => it.title));
  });

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
    if (value !== null) {
      if (optionOne && valueOne) {
        const keyOne = columns.find((it) => it.title === optionOne).key;

        value[keyOne] = valueOne;
      }
      if (optionTwo && valueTwo) {
        const keyTwo = columns.find((it) => it.title === optionTwo).key;
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

  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
    showShareCarModel = false;
    paymentDialogShow = false;
    editOutboundForecast = false;
    offerDialog = false;
    carDialog = false;
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
            icon: renderIconWithTooltip(Box20Filled, '对外报价'),
            onClick() {
              currentInfo = record;
              offerDialog = true;
            },
          },
          {
            icon: renderIconWithTooltip(Box20Filled, '订车'),
            onClick() {
              currentInfo = record;
              carDialog = true;
            },
          },
          {
            icon: renderIconWithTooltip(Box20Filled, 'POD'),
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
          iconFileAction('提单', 'pickupFiles', Box20Filled, 'orderCarOrder'),
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
