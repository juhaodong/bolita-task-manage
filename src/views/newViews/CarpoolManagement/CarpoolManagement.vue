<template>
  <n-card v-if="hasAuthPower('orderCarView')" :bordered="false" class="proCard">
    <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter">
      <n-button
        v-if="hasAuthPower('orderCarOffer')"
        :disabled="priceRules"
        type="primary"
        @click="startShareCar('offer')"
      >
        <template #icon>
          <n-icon>
            <Box20Filled />
          </n-icon>
        </template>
        报价
      </n-button>
      <n-button
        v-if="hasAuthPower('orderCarBookingCar')"
        :disabled="carRules"
        type="primary"
        @click="startShareCar('car')"
      >
        <template #icon>
          <n-icon>
            <Box20Filled />
          </n-icon>
        </template>
        订车
      </n-button>
      <n-button type="info" @click="downloadData">
        <template #icon>
          <n-icon>
            <Box20Filled />
          </n-icon>
        </template>
        下载
      </n-button>
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
      <n-checkbox v-model:checked="showAll" class="ml-2" label="全部" size="large" />
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
  </n-card>
  <no-power-page v-else />
</template>

<script lang="ts" setup>
  import { Box20Filled } from '@vicons/fluent';
  import { Component, computed, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import { CarpoolManager } from '@/api/dataLayer/modules/logistic/carpool';
  import { getFileActionButtonByOutForecast } from '@/views/bolita-views/composable/useableColumns';
  import { useUserStore } from '@/store/modules/user';
  import { CarpoolManagementPower } from '@/api/dataLayer/common/PowerModel';
  import { getOutboundForecast } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import { dateCompare, OneYearMonthTab } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';
  import EditOF from '@/views/newViews/OperationDetail/NotOutbound/EditOF.vue';
  import NewCarpoolManagement from '@/views/newViews/CarpoolManagement/dialog/NewCarpoolManagement.vue';
  import { hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import { valueOfToday } from '@/api/dataLayer/common/Date';
  import { generateOptionFromArray } from '@/store/utils/utils';
  import FileSaver from 'file-saver';
  import { getDetailListById } from '@/api/dataLayer/modules/notify/notify-detail';

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
  const loadDataTable = async () => {
    allList = (await getOutboundForecast(filterObj)).sort(dateCompare('createBookCarTimestamp'));
    if (!showAll) {
      allList = allList.filter((a) => a.inStatus !== '已取消');
    }
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
    if (checkedRows.length > 0) {
      selectedList = await getDetailListById(checkedRows);
    } else {
      selectedList = await loadDataTable();
    }
    let headerTitle = columns
      .filter((it) => it.title)
      .map((it) => it.title)
      .join();
    let dataStrings = [];
    dataStrings.unshift(headerTitle);
    selectedList.forEach((it) => {
      const res = [
        it.id ?? '',
        it.createBookCarTimestamp ?? '',
        it.inStatus ?? '',
        it.deliveryMethod ?? '',
        it.waybillId ?? '',
        it.trayNum ?? '',
        it.containerNum ?? '',
        it.totalOutOffer ?? '',
        it.costPrice ?? '',
        it.suggestedPrice ?? '',
        it.postcode ?? '',
        it.FCAddress ?? '',
        it.REF ?? '',
        it.ISA ?? '',
        it.AMZID ?? '',
        it.trayNum ?? '',
        it.reservationGetProductTime ?? '',
        it.reservationGetProductDetailTime ?? '',
        it.orderCarPrice ?? '',
        it.city ?? '',
        it.street ?? '',
        it.appendAddress ?? '',
        it.houseNo ?? '',
        it.contact ?? '',
        it.email ?? '',
        it.note ?? '',
      ];
      dataStrings.push(res.join());
    });
    dataStrings = dataStrings.join('\n');
    const blob = new Blob([dataStrings], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, '订车管理' + '.csv');
  }

  onMounted(async () => {
    monthTab = OneYearMonthTab();
    selectedMonth = monthTab[0];
  });
  const realOptions = computed(() => {
    return generateOptionFromArray(columns.filter((it) => it.key).map((it) => it.title));
  });

  const realDetailInfoById = computed(() => {
    let res = [];
    for (const id of checkedRows) {
      const detailInfoById = allList.find((it) => it.id === id);
      res.push(detailInfoById);
    }
    return res;
  });
  const priceRules = computed(() => {
    return (
      checkedRows.length < 1 || realDetailInfoById?.value.filter((it) => it.waitPrice).length !== 0
    );
  });
  const carRules = computed(() => {
    return (
      checkedRows.length < 1 ||
      realDetailInfoById?.value.filter((it) => it.waitCar).length !== 0 ||
      realDetailInfoById?.value.filter((it) => it.waitPrice === 1).length !== checkedRows.length
    );
  });

  function startShareCar(item) {
    typeName = item;
    showShareCarModel = true;
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

  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
    showShareCarModel = false;
    paymentDialogShow = false;
    editOutboundForecast = false;
  }
  async function addOut() {
    showModal.value = true;
  }

  function saved() {
    reloadTable();
  }

  async function startEdit(id) {
    currentModel = await CarpoolManager.getById(id);
    showModal.value = true;
  }

  async function doPayment(id) {
    currentModel = await CarpoolManager.getById(id);
    paymentDialogShow = true;
  }

  const AccountPowerList = computed(() => {
    return useUserStore()?.info?.powerList;
  });
  const SubmitOrderOperate = computed(() => {
    return AccountPowerList.value.includes(CarpoolManagementPower.SubmitOrder);
  });
  const PODOperate = computed(() => {
    return AccountPowerList.value.includes(CarpoolManagementPower.POD);
  });
  const BillOperate = computed(() => {
    return AccountPowerList.value.includes(CarpoolManagementPower.Bill);
  });
  function startEditOF(id) {
    editId = id;
    editOutboundForecast = true;
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record: any) {
      const fileAction = (label, key, icon?: Component, power) => {
        return getFileActionButtonByOutForecast(label, key, reloadTable, record, icon, power);
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '修改',
            onClick() {
              startEditOF(record.id);
            },
            ifShow: () => {
              return hasAuthPower('orderCarEdit');
            },
          },
          fileAction('提单', 'pickupFiles', '', 'orderCarOrder'),
          fileAction('POD', 'PODFiles', '', 'orderCarPOD'),
          fileAction('CMR', 'CMRFiles', '', 'orderCarCMR'),
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
