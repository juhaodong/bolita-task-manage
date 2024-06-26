<template>
  <n-card :bordered="false" class="proCard">
    <div>
      <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter">
        <n-button type="primary" @click="selectedHeader">
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          选择表头显示
        </n-button>
        <n-button
          v-if="typeMission === '整柜任务看板' && hasAuthPower('missionOutboundAdd')"
          type="primary"
          @click="addTable"
        >
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          新建出库计划
        </n-button>
        <n-button
          v-if="typeMission === '审核看板' && hasAuthPower('missionCheck')"
          type="primary"
          @click="checkDetailInfo"
        >
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          审核
        </n-button>
        <n-button
          v-if="typeMission === '报价看板' && hasAuthPower('missionPriceOffer')"
          type="primary"
          @click="showOfferPrice = true"
        >
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          报价
        </n-button>
        <n-button type="primary" @click="downloadData">
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
      <n-tabs
        v-model:value="typeMission"
        animated
        class="card-tabs"
        pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
        pane-wrapper-style="margin: 0 -4px"
        size="large"
      >
        <n-tab-pane
          v-for="currentType in typeTab"
          :key="currentType"
          :name="currentType"
          :tab="currentType"
        >
          <div v-if="hasPagePower">
            <BasicTable
              ref="actionRef"
              v-model:checked-row-keys="checkedRows"
              :actionColumn="actionColumn"
              :columns="currentColumns"
              :request="loadDataTable"
              :row-key="(row) => row.id"
            />
          </div>
          <no-power-page v-else />
        </n-tab-pane>
      </n-tabs>
      <n-modal
        v-model:show="showModal"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 600px; max-width: 1200px"
        title="出库计划"
      >
        <new-outbound-plan :model="checkedRows" @saved="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="editDetailModel"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 600px; max-width: 600px"
        title="编辑详情"
      >
        <edit-mission-detail :model="currentModel" @saved="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="addNewFeeDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 800px; max-width: 800px"
        title="新建费用"
      >
        <new-total-fee :current-data="currentData" @saved="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="addNewTrayDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 800px; max-width: 800px"
        title="添加托盘"
      >
        <new-tray-dialog :current-data="recordData" @saved="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="showCurrentHeaderDataTable"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 800px; max-width: 800px"
        title="添加表头"
      >
        <selected-header-table :all-columns="columns" :type="'mission'" @saved="reloadHeader" />
      </n-modal>
      <n-modal
        v-model:show="showTimeLine"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 800px; max-width: 800px"
        title="时间线"
      >
        <time-line :ids="currentId" />
      </n-modal>
      <n-modal
        v-model:show="showOfferPrice"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 800px; max-width: 800px"
        title="报价表"
      >
        <offer-price-dialog :ids="checkedRows" @save="reloadTable" />
      </n-modal>
    </div>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, computed, h, onMounted, reactive, ref, watch } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import { $ref } from 'vue/macros';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import {
    getDetailListById,
    NotifyDetailManager,
  } from '@/api/dataLayer/modules/notify/notify-detail';
  import {
    InBoundDetailStatus,
    InBoundStatus,
    NotifyManager,
  } from '@/api/dataLayer/modules/notify/notify-api';
  import { Box20Filled } from '@vicons/fluent';
  import NewOutboundPlan from '@/views/newViews/OutboundPlan/NewOutboundPlan.vue';
  import { dateCompare } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';
  import EditMissionDetail from '@/views/newViews/Missions/AlreadyWarehousing/EditMissionDetail.vue';
  import NewTotalFee from '@/views/newViews/SettlementManage/NewTotalFee.vue';
  import { useUploadDialog } from '@/store/modules/uploadFileState';
  import NewTrayDialog from '@/views/newViews/Missions/AlreadyWarehousing/NewTrayDialog.vue';
  import SelectedHeaderTable from '@/views/newViews/Missions/AlreadyWarehousing/SelectedHeaderTable.vue';
  import { getTableHeader } from '@/api/dataLayer/common/TableHeader';
  import TimeLine from '@/views/newViews/Missions/AlreadyWarehousing/TimeLine.vue';
  import { useUserStore } from '@/store/modules/user';
  import {
    checkedObj,
    offerObj,
    planObj,
  } from '@/views/newViews/Missions/AlreadyWarehousing/selectionType';
  import OfferPriceDialog from '@/views/newViews/Missions/AlreadyWarehousing/OfferPriceDialog.vue';
  import { getUserCustomerList, hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import { generateOptionFromArray, safeSumBy } from '@/store/utils/utils';
  import { valueOfToday } from '@/api/dataLayer/common/Date';
  import FileSaver from 'file-saver';

  const showModal = ref(false);
  let editDetailModel = ref(false);

  let filterObj: any | null = $ref(null);
  let addNewFeeDialog = $ref(false);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);
  let typeTab = $ref(['整柜任务看板', '审核看板', '报价看板', '存仓看板']);
  let typeMission = ref('');
  let selectedMonth: any | null = $ref('');
  let currentData: any | null = $ref('');
  let recordData: any | null = $ref('');
  let allList: any | null = $ref([]);
  let addNewTrayDialog = $ref(false);
  let showCurrentHeaderDataTable = $ref(false);
  let currentHeader = $ref([]);
  let currentColumns = $ref([]);
  let currentId = $ref('');
  let showTimeLine = $ref(false);
  let currentWithOutSelection = $ref([]);
  let showOfferPrice = $ref(false);
  let optionOne = $ref('');
  let optionTwo = $ref('');
  let valueOne = $ref('');
  let valueTwo = $ref('');
  let dateRange = $ref(null);
  let showAll = $ref(false);

  const actionRef = ref();
  const props = defineProps<Prop>();
  interface Prop {
    belongsToId?: string;
  }

  const realOptions = computed(() => {
    return generateOptionFromArray(columns.filter((it) => it.key).map((it) => it.title));
  });

  const hasPagePower = computed(() => {
    if (typeMission.value === '整柜任务看板') {
      return hasAuthPower('missionAllView');
    } else if (typeMission.value === '审核看板') {
      return hasAuthPower('missionCheckView');
    } else if (typeMission.value === '报价看板') {
      return hasAuthPower('missionOfferView');
    } else if (typeMission.value === '存仓看板') {
      return hasAuthPower('missionStorageView');
    }
  });

  async function startEdit(id) {
    currentModel = await NotifyDetailManager.getById(id);
    editDetailModel.value = true;
  }

  async function selectedHeader() {
    showCurrentHeaderDataTable = true;
  }

  async function startAddTray(id) {
    addNewTrayDialog = true;
  }

  function addTable() {
    showModal.value = true;
  }

  async function downloadData() {
    let selectedList = [];
    if (checkedRows.length > 0) {
      selectedList = await getDetailListById(checkedRows);
    } else {
      selectedList = await loadDataTable();
    }
    console.log(selectedList, 'list');
    let headerTitle = columns
      .filter((it) => it.title)
      .map((it) => it.title)
      .join();
    let dataStrings = [];
    dataStrings.unshift(headerTitle);
    selectedList.forEach((it) => {
      const res = [
        it.customerName ?? '',
        it.containerId ?? '',
        it.ticketId ?? '',
        it.country ?? '',
        it.number ?? '',
        it.arrivedContainerNum ?? '',
        it.weight ?? '',
        it.volume ?? '',
        it.size ?? '',
        it.inStatus ?? '',
        it.warehouseId ?? '',
        it.stayTime ?? '',
        it.deliveryIdIn ?? '',
        it.normalNote ?? '',
        it.FBADeliveryCode ?? '',
        it.outboundMethod ?? '',
        it.deliveryMethod ?? '',
        it.operationRequire ?? '',
        it.operationNote ?? '',
        it.finalStatus ?? '',
        it.PO ?? '',
        it.FCAddress ?? '',
        it.postcode ?? '',
        it.inBoundDetailStatus ?? '',
        it.changeOrderFiles ?? '',
        it.transportationNote ?? '',
        it.trayNum ?? '',
        it.arrivedTrayNum ?? '',
        it.planArriveDateTime ? dayjs(it.planArriveDateTime).format('YYYY-MM-DD') : '',
        it.currentDate ? dayjs(it.currentDate[0]).format('YYYY-MM-DD') : '',
        it.deliveryTime ? dayjs(it.deliveryTime).format('YYYY-MM-DD') : '',
        it.Ref ?? '',
        it.note ?? '',
        it.sign ?? '',
        it.package ?? '',
        it.industrialTrayNum ?? '',
        it.productName ?? '',
        it.UNNumber ?? '',
        it.recipient ?? '',
        it.phone ?? '',
        it.email ?? '',
        it.needReserve ?? '',
        it.industrialNote ?? '',
      ];
      dataStrings.push(res.join());
    });
    dataStrings = dataStrings.join('\n');
    const blob = new Blob([dataStrings], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, '任务明细' + '.csv');
  }

  async function checkDetailInfo() {
    for (const rows of checkedRows) {
      const res = allList.find((it) => it.id === rows);
      if (res) {
        res.inStatus = InBoundStatus.Wait;
        res.checkedTime = dayjs().format('YYYY-MM-DD');
        const userInfo = useUserStore().info;
        res.timeLine.unshift({
          operator: userInfo?.realName,
          detailTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          note: '进行了审核',
        });
        await NotifyDetailManager.editInternal(res, rows);
        const containerForecastInfo = await NotifyManager.getById(res.notifyId);
        if (containerForecastInfo.inStatus === InBoundStatus.WaitCheck) {
          const allDetailList = allList
            .filter((x) => x.notifyId === res.notifyId)
            .filter(
              (b) =>
                b.inStatus === InBoundDetailStatus.WaitSubmit ||
                b.inStatus === InBoundDetailStatus.WaitCheck
            );
          if (allDetailList.length === 0) {
            containerForecastInfo.inStatus = InBoundStatus.Wait;
            await NotifyManager.editInternal(containerForecastInfo, containerForecastInfo.id);
          }
        }
      }
    }
    checkedRows = [];
    await reloadTable();
  }

  const loadDataTable = async () => {
    if (typeMission.value === '整柜任务看板') {
      allList = await NotifyDetailManager.load(filterObj);
    } else if (typeMission.value === '存仓看板') {
      allList = (await NotifyDetailManager.load(filterObj)).filter((it) => it.inStatus === '存仓');
    } else if (typeMission.value === '审核看板') {
      allList = (await NotifyDetailManager.load(filterObj)).filter(
        (it) => it.inStatus === '等待提交' || it.inStatus === '等待审核'
      );
    } else if (typeMission.value === '报价看板') {
      allList = (await NotifyDetailManager.load(filterObj)).filter(
        (it) => it.needOfferPrice === '1'
      );
    }
    const ownedCustomerIds = await getUserCustomerList();
    allList.forEach((it) => {
      if (it.storageTime) {
        const res = it.storageTime.pop();
        if (!res.totalStorageTime) {
          res.outBoundTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
          res.totalStorageTime = dayjs(res.outBoundTime).diff(res.storageTime, 'hour');
        }
        it.storageTime.push(res);
        const usefulTimeList = it.storageTime.filter((x) => x.totalStorageTime);
        it.stayTime = safeSumBy(usefulTimeList, 'totalStorageTime');
      } else {
        it.stayTime = '-';
      }
    });
    allList = allList.filter((it) => ownedCustomerIds.includes(it.customerId));
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
    return allList.sort(dateCompare('createTimestamp'));
  };

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

  function checkCashStatus(id) {
    currentData = allList.find((it) => it.id === id);
    addNewFeeDialog = true;
  }

  watch(
    typeMission,
    async (value, oldValue) => {
      if (value !== oldValue) {
        await reloadHeader();
      }
    },
    { immediate: true, deep: true }
  );

  async function reloadHeader() {
    currentWithOutSelection = [];
    currentHeader = await getTableHeader('mission');
    currentHeader.forEach((item) => {
      const res = columns.find((it) => it.key === item.key);
      currentWithOutSelection.push(res);
    });
    currentWithOutSelection =
      currentWithOutSelection.length > 0 ? currentWithOutSelection : columns;
    if (typeMission.value === '整柜任务看板') {
      currentColumns = [planObj, ...currentWithOutSelection];
    } else if (typeMission.value === '审核看板') {
      currentColumns = [checkedObj, ...currentWithOutSelection];
    } else if (typeMission.value === '报价看板') {
      currentColumns = [offerObj, ...currentWithOutSelection];
    } else {
      currentColumns = [...currentWithOutSelection];
    }
    showCurrentHeaderDataTable = false;
  }

  async function reloadTable() {
    showModal.value = false;
    editDetailModel.value = false;
    addNewFeeDialog = false;
    addNewTrayDialog = false;
    showCurrentHeaderDataTable = false;
    showOfferPrice = false;
    await actionRef.value[0].reload();
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
    await reloadHeader();
    typeMission.value = '整柜任务看板';
    const res = getQueryString('containerId');
    if (res) {
      updateFilter({ containerId: res });
    } else {
      await reloadTable();
    }
    if (props.belongsToId) {
      filterObj = { belongsToId: props.belongsToId };
    }
  });

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record: any) {
      const fileAction = (label, key, icon?: Component, power) => {
        return getFileActionButton(
          label,
          key,
          NotifyDetailManager,
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
              return hasAuthPower('missionEdit');
            },
          },
          {
            label: '结算',
            onClick() {
              checkCashStatus(record.id);
            },
            ifShow: () => {
              return hasAuthPower('missionSettle');
            },
          },
          {
            label: '请报价',
            onClick() {
              checkCashStatus(record.id);
            },
            highlight: () => {
              return 'info';
            },
            ifShow: () => {
              return record?.['needOfferPrice'] === '1' && hasAuthPower('missionPriceOffer');
            },
          },
          {
            label: '时间线',
            onClick() {
              currentId = record.id;
              showTimeLine = true;
            },
            ifShow: () => {
              return hasAuthPower('missionTimeline');
            },
          },
          {
            label: '换单文件',
            highlight: () => {
              return record?.['changeOrder']?.length > 0 ? 'success' : 'error';
            },
            ifShow: () => {
              return record?.changeOrderFiles === '是' && hasAuthPower('missionChangeFile');
            },
            async onClick() {
              const upload = useUploadDialog();
              const files = await upload.upload(record['changeOrder']);
              const userInfo = useUserStore().info;
              if (files.checkPassed) {
                const obj = {};
                obj['changeOrder'] = files.files;
                if (!record.arriveTime) {
                  obj['inStatus'] = InBoundDetailStatus.WaitCheck;
                }
                let res = record.timeLine;
                res.unshift({
                  operator: userInfo?.realName,
                  detailTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                  note: '提交了换单文件',
                });
                obj['timeLine'] = res;
                await NotifyDetailManager.editInternal(obj, record.id);
              }
              actionRef.value[0].reload();
            },
          },
          {
            label: '托盘标签',
            highlight: () => {
              return record?.['trayFiles']?.length > 0 ? 'success' : 'error';
            },
            ifShow: () => {
              return (
                record?.deliveryMethod === 'FBA卡车派送' &&
                record?.outboundMethod === '标准托盘' &&
                hasAuthPower('missionTrayTag')
              );
            },
            async onClick() {
              const upload = useUploadDialog();
              const files = await upload.upload(record['trayFiles']);
              const userInfo = useUserStore().info;
              if (files.checkPassed) {
                const obj = {};
                obj['trayFiles'] = files.files;
                let res = record.timeLine;
                res.unshift({
                  operator: userInfo?.realName,
                  detailTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                  note: '提交了托盘标签',
                });
                obj['timeLine'] = res;
                await NotifyDetailManager.editInternal(obj, record.id);
              }
              actionRef.value[0].reload();
            },
          },
          fileAction('POD', 'POD', '', 'missionPOD'),
          fileAction('操作文件', 'operationFiles', '', 'missionOperationFile'),
          fileAction('问题图片', 'problemFiles', '', 'missionProblemPic'),
          {
            label: '添加托盘',
            onClick() {
              recordData = record;
              startAddTray(record.id);
            },
            highlight: () => {
              return record.detailTray ? 'success' : 'error';
            },
            ifShow: () => {
              return (
                (record.outboundMethod === '大件托盘' || record.outboundMethod === '标准托盘') &&
                hasAuthPower('missionAddTray')
              );
            },
          },
          {
            label: '信息已变更',
            highlight: () => {
              return 'error';
            },
            async onClick() {
              record.alreadyChanged = 0;
              await NotifyDetailManager.editInternal(record, record.id);
            },
            ifShow: () => {
              return record.alreadyChanged;
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
