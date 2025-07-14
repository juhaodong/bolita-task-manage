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
  import {
    addOrUpdateTask,
    defaultTask,
    getTaskListByNotifyId,
  } from '@/api/newDataLayer/TaskList/TaskList';
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
    customerId: '',
    containerNo: '',
    inventoryId: '',
    planArriveDateTime: dayjs().valueOf(),
    inHouseTime: '',
    note: '',
  };

  function startLoading() {
    loading = true;
  }

  function stop() {
    loading = false;
    loadingMessage = '';
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
      errorMessage.push({ detail: '文件上传错误' + e?.message });
      console.log(e?.message);
    }
    return [];
  }

  function closeDialog() {
    errorMessage = [];
  }

  let loadingMessage = $ref('');

  async function saveNotify(value: any) {
    defaultValue = value;
    startLoading();
    loadingMessage = '';
    if (value?.id) {
      await addOrUpdateNotify(value);
      const taskList = await getTaskListByNotifyId(value.id);
      for (const task of taskList) {
        task.customerId = value.customerId;
        task.inventoryId = value.inventoryId;
        task.inHouseTime = value.inHouseTime;
        await addOrUpdateTask(task);
      }
      emit('saved');
    } else {
      loadingMessage += '正在读取文件！' + `<br>`;
      const userStore = useUserStore();
      const currentCustomer = (await getCustomerById(value.customerId)) ?? '';
      value.containerNo = value.containerNo.trim();
      value.notifyType = prop.type;
      value.unloadingFile = '';
      value.totalTime = '';
      value.unloadEndTime = '';
      value.unloadStartTime = '';
      value.realDate = '';
      value.totalCount = '';
      value.operationalRemarks = '';
      value.salesName =
        (await getUserNameById(currentCustomer.belongSalesId)) ?? userStore.info?.userName;
      value.cashStatus = '';
      value.inStatus = InBoundStatus.WaitCheck;
      let taskList = [
        ...(await readFile(value.files?.[0].file, value.notifyType)),
        ...(value?.trayTaskList ?? []),
      ];
      value.arrivedCount = safeSumBy(taskList, 'number').toString();

      if (value.files) {
        try {
          value.files = await saveFiles(value.files);
        } catch (e) {
          errorMessage.push({ detail: '文件上传错误' + e?.message });
        }
      } else {
        value.files = '';
      }
      if (errorMessage.length === 0) {
        loadingMessage += '正在上传' + value.containerNo + '的货柜预报！' + `<br>`;
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
          item.outBoundTime = '';
          item.outContainerNum = '';
          item.outTrayNum = '';
          item.cmrfiles = '';
          loadingMessage += '正在加载票号:' + item.ticketId + '的任务明细！' + `<br>`;
          quest.push(addOrUpdateTask(item));
        }
        const result = await Promise.all(quest);
        loadingMessage += '正在上传货柜号:' + value.containerNo + '的任务明细！' + `<br>`;
        const ids = result.map((it) => it.data.id);
        let idQuest = [];
        const userInfo = useUserStore().info;
        loadingMessage += '正在写入每一票的TimeLine' + `<br>`;
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
        loadingMessage += '完成' + `<br>`;
        emit('saved');
      }
    }
    stop();
  }
</script>

<template>
  <loading-frame :loading="loading" :title="loadingMessage">
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
