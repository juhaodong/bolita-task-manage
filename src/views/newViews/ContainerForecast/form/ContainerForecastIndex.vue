<script lang="ts" setup>
  import {
    InBoundDetailStatus,
    InBoundStatus,
    NotifyType,
  } from '@/api/dataLayer/modules/notify/notify-api';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { getNeededColumnByNotifyType } from '@/api/dataLayer/modules/notify/NotifyRepository';
  import NewContainerForecast from '@/views/newViews/ContainerForecast/form/NewContainerForecast.vue';
  import { useUserStore } from '@/store/modules/user';
  import readXlsxFile from 'read-excel-file';
  import { difference } from 'lodash-es';
  import { allDeliveryList, allKeysList } from '@/api/dataLayer/common/AllKeys';
  import { $ref } from 'vue/macros';
  import ErrorMessageDialog from '@/views/newViews/ContainerForecast/form/ErrorMessageDialog.vue';
  import dayjs from 'dayjs';
  import { addOrUpdateNotify, saveFiles } from '@/api/newDataLayer/Notify/Notify';
  import { getCustomerById } from '@/api/newDataLayer/Customer/Customer';
  import { getUserNameById } from '@/api/newDataLayer/User/User';
  import { getFBACodeList } from '@/api/newDataLayer/FBACode/FBACode';
  import {
    addOrUpdateInventoryUseLog,
    getCurrentLogTime,
  } from '@/api/newDataLayer/Warehouse/UseLog';
  import { addOrUpdateTask } from '@/api/newDataLayer/TaskList/TaskList';
  import { addOrUpdateTaskTimeLine } from '@/api/newDataLayer/TimeLine/TimeLine';
  import { safeSumBy } from '@/store/utils/utils';

  interface Prop {
    currentModel?: any;
    type: NotifyType;
  }

  const prop = defineProps<Prop>();
  const emit = defineEmits(['saved']);
  let loading: boolean = $ref(false);
  let defaultValue = {
    customerName: '',
    containerNo: '',
    warehouseId: '',
    planArriveDateTime: dayjs().valueOf(),
    inHouseTime: '',
    note: '',
  };

  const defaultTask = {
    FBADeliveryCode: '',
    FCAddress: '',
    PO: '',
    arriveTime: '',
    arrivedContainerNum: 0,
    arrivedCount: 0,
    arrivedTrayNum: 0,
    cashStatus: '',
    changeOrderFiles: '',
    containerId: '',
    country: '',
    customerId: '',
    customerName: '',
    deliveryMethod: '',
    files: '',
    inHouseTime: '',
    inStatus: '',
    inStorageContainerNum: 0,
    inStorageTrayNum: 0,
    note: '',
    notifyId: '',
    notifyType: '',
    number: 0,
    operateInStorage: '',
    operationRequire: '',
    outboundMethod: '',
    outPrice: '',
    planArriveDateTime: dayjs().valueOf(),
    salesName: '',
    size: '',
    stayTime: '',
    storagePosition: '',
    timeLine: [],
    uploadFileTime: '',
    volume: 0.0,
    warehouseId: '',
    weight: 0.0,
    ticketId: '',
    trayNum: '',
    normalNote: '',
    postcode: '',
    operationNote: '',
    transportationNote: '',
    sign: '',
    packing: '',
    industrialTrayNum: '',
    productName: '',
    UNNumber: '',
    recipient: '',
    phone: '',
    email: '',
    needReserve: '',
    industrialNote: '',
    POD: '',
    operationFiles: '',
    problemFiles: '',
    trayFiles: '',
    changeOrder: '',
    detailTray: '',
    trayType: '',
    alreadyChanged: 0,
    outboundId: '',
    needOfferPrice: '',
    waitPrice: '',
    suggestedPrice: '',
    costPrice: '',
    REF: '',
    bookingCarTime: '',
  };

  function startLoading() {
    loading = true;
  }

  function stop() {
    loading = false;
  }

  let errorMessage = $ref([]);

  async function readFile(file, notifyType) {
    if (!file) {
      return [];
    }
    const schema = Object.fromEntries(
      getNeededColumnByNotifyType(notifyType).map((it) => {
        return [it.title, { prop: it.key }];
      })
    );
    const allFBACodeList = await getFBACodeList();
    try {
      let currentRows = [];
      let { rows, errors } = await readXlsxFile(file, { schema });
      rows = rows.slice(2);
      rows.forEach((it, index) => {
        const keys = Object.keys(it);
        const res = difference(
          allKeysList.map((x) => x.field),
          keys
        );
        it.uploadFileTime = dayjs().format('YYYY-MM-DD');
        if (it.outboundMethod !== '存仓') {
          if (it.outboundMethod === '散货') {
            if (it.deliveryMethod === 'FBA卡车派送') {
              if (!it.FBADeliveryCode) {
                errorMessage.push({ index: index + 4, detail: 'FBA单号' });
              }
              if (!it.PO) {
                errorMessage.push({ index: index + 4, detail: 'PO' });
              }
            }
            if (!allDeliveryList.includes(it.deliveryMethod) && !it.FCAddress) {
              errorMessage.push({ index: index + 4, detail: 'FC/送货地址' });
            }
          }
          if (it.deliveryMethod === 'FBA卡车派送') {
            if (!it.FCAddress) {
              errorMessage.push({ index: index + 4, detail: 'FC/送货地址' });
            }
            if (!it.postcode) {
              const currentFBACode = allFBACodeList.find((b) => b.code === it.FCAddress);
              if (!currentFBACode) {
                errorMessage.push({ index: index + 4, detail: 'FC/送货地址' });
              } else {
                it.postcode = currentFBACode.postcode;
              }
            }
          }
        }
        if (it.changeOrderFiles === '是') {
          it.inStatus = InBoundDetailStatus.WaitSubmit;
          it.operateInStorage = '是';
        } else {
          it.inStatus = InBoundDetailStatus.WaitCheck;
        }
        currentRows.push(Object.assign({}, defaultTask, it));
        if (res.length > 0) {
          const realMessageDetail = [];
          res.forEach((it) => {
            const detailInfo = allKeysList.find((x) => x.field === it).label;
            realMessageDetail.push(detailInfo);
          });
          errorMessage.push({ index: index + 4, detail: realMessageDetail });
        }
      });
      if (currentRows.length > 0 && errors.length == 0) {
        return currentRows;
      }
    } catch (e: any) {
      console.log(e?.message);
    }
    return [];
  }

  function closeDialog() {
    errorMessage = [];
  }

  async function saveNotify(value: any) {
    defaultValue = value;
    startLoading();
    const userStore = useUserStore();

    const currentCustomer = (await getCustomerById(value.customerId)) ?? '';
    // value.customerName = currentCustomer.customerName ?? '';
    value.notifyType = prop.type;
    value.unloadingFile = '';
    value.totalTime = '';
    value.unloadEndTime = '';
    value.unloadStartTime = '';
    value.realDate = '';
    value.totalCount = '';
    value.salesName =
      (await getUserNameById(currentCustomer.belongSalesId)) ?? userStore.info?.userName;
    value.cashStatus = '';
    value.inStatus = InBoundStatus.WaitCheck;
    let taskList = [
      ...(await readFile(value.files?.[0].file, value.notifyType)),
      ...(value?.trayTaskList ?? []),
    ];
    console.log(taskList, 'list');
    value.arrivedCount = safeSumBy(taskList, 'number').toString();

    if (value.files) {
      value.files = await saveFiles(value.files);
    } else {
      value.files = '';
    }
    console.log(value, 'value');
    if (errorMessage.length === 0) {
      const res = await addOrUpdateNotify(value);
      await addOrUpdateInventoryUseLog({
        notifyId: res.data.id,
        inventoryId: value.inventoryId,
        useAtTimestamp: getCurrentLogTime(value.planArriveDateTime, value.inHouseTime),
      });
      let quest = [];
      for (const item of taskList) {
        // item.customerName = value.customerName;
        item.customerId = value.customerId;
        item.inventoryId = value.inventoryId;
        item.inHouseTime = value.inHouseTime;
        item.notifyId = res.data.id;
        item.files = value.files;
        item.planArriveDateTime = value.planArriveDateTime;
        quest.push(addOrUpdateTask(item));
      }
      const result = await Promise.all(quest);
      const ids = result.map((it) => it.data.id);
      let idQuest = [];
      const userInfo = useUserStore().info;
      for (const id of ids) {
        idQuest.push(
          addOrUpdateTaskTimeLine({
            useType: 'normal',
            bolitaTaskId: id,
            operator: userInfo?.realName,
            detailTime: dayjs().valueOf(),
            note: '新建货柜预报',
          })
        );
      }
      await Promise.all(idQuest);
      emit('saved');
    } else {
      // emit('saved');
    }
    stop();
  }
</script>

<template>
  <loading-frame :loading="loading">
    <template v-if="errorMessage.length === 0">
      <new-container-forecast
        :default-value="defaultValue"
        :model="currentModel"
        @closed="closeDialog"
        @submit="saveNotify"
      />
    </template>
    <template v-else>
      <error-message-dialog :error-message="errorMessage" @closed="closeDialog" />
    </template>
    <!--    <template v-else-if="type == NotifyType.TrayOrBox">-->
    <!--      <notify-tray-form :model="currentModel" @submit="saveNotify" />-->
    <!--    </template>-->
  </loading-frame>
</template>

<style lang="less" scoped></style>
