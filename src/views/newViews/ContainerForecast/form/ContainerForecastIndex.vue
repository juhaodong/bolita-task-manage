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
  import { difference, groupBy } from 'lodash-es';
  import { allKeysList } from '@/api/dataLayer/common/AllKeys';
  import { $ref } from 'vue/macros';
  import ErrorMessageDialog from '@/views/newViews/ContainerForecast/form/ErrorMessageDialog.vue';
  import dayjs from 'dayjs';
  import { addOrUpdateNotify, saveFiles } from '@/api/newDataLayer/Notify/Notify';
  import {
    addOrUpdateInventoryUseLog,
    getCurrentLogTime,
    getInventoryUseLogListByNotifyId,
  } from '@/api/newDataLayer/Warehouse/UseLog';
  import {
    addOrUpdateTask,
    defaultTask,
    getTaskListByNotifyId,
    searchTaskPrice,
  } from '@/api/newDataLayer/TaskList/TaskList';
  import { safeSumBy } from '@/store/utils/utils';
  import { getFBACodeList } from '@/api/newDataLayer/FBACode/FBACode';
  import { addOrUpdateTaskTimeLine } from '@/api/newDataLayer/TimeLine/TimeLine';

  interface Prop {
    currentModel?: any;
    type: NotifyType;
  }

  const prop = defineProps<Prop>();
  const emit = defineEmits(['saved']);
  let loading: boolean = $ref(false);
  let defaultValue = {
    containerNo: '',
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

  function isValidString(str) {
    return /^[A-Za-z0-9]+$/.test(str);
  }

  async function readFile(file, notifyType) {
    if (!file) {
      return [];
    }
    const schema = Object.fromEntries(
      getNeededColumnByNotifyType(notifyType).map((it) => {
        return [it.title, { prop: it.key }];
      })
    );
    console.log(schema, 'schema');
    const allFBACodeList = await getFBACodeList();
    try {
      let currentRows = [];
      let { rows, errors } = await readXlsxFile(file, { schema, row: { from: 1 } });
      rows = rows.slice(2);
      console.log(rows, 'rows');
      const groupContainerId = Object.keys(groupBy(rows, 'containerId'));
      if (groupContainerId.length > 1) {
        errorMessage.push({ detail: '一个Excel文件中不可有多个柜号' });
      } else {
        defaultValue.containerNo = groupContainerId[0];
      }
      for (const [index, it] of rows.entries()) {
        const keys = Object.keys(it);
        const res = difference(
          allKeysList.map((x) => x.field),
          keys
        );
        it.uploadFileTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
        if (!isValidString(it.ticketId)) {
          errorMessage.push({ index: index + 4, detail: '票号中不可有特殊符号' });
        } else {
          it.ticketId = it.ticketId.trim();
        }
        //判断大件托盘
        if (it.outboundMethod === '大件托盘') {
          if (!it.productName) {
            errorMessage.push({ index: index + 4, detail: '品名不可为空' });
          }
          if (!it.unNumber) {
            errorMessage.push({ index: index + 4, detail: 'UN号不可为空' });
          }
          if (!it.recipient) {
            errorMessage.push({ index: index + 4, detail: '收件人不可为空' });
          }
          if (!it.phone) {
            errorMessage.push({ index: index + 4, detail: '电话不可为空' });
          }
          if (!it.email) {
            errorMessage.push({ index: index + 4, detail: '邮箱不可为空' });
          }
          if (!it.tailgate) {
            errorMessage.push({ index: index + 4, detail: '尾板不可为空' });
          }
          it.packing = '大件托盘';
        }

        //判断FBA卡车派送
        if (it.deliveryMethod === 'FBA卡车派送') {
          const allFBACode = allFBACodeList.map((x) => x.code);
          if (!allFBACode.includes(it.fcAddress)) {
            errorMessage.push({ index: index + 4, detail: 'FC不在FBACode列表中' });
          }
        } else {
          if (!it.address) {
            errorMessage.push({ index: index + 4, detail: '送货地址不可为空' });
          }
          if (!it.postcode) {
            errorMessage.push({ index: index + 4, detail: '邮编不可为空' });
          }
        }

        if (it.packing === '纸箱') {
          if (!it.number) {
            errorMessage.push({ index: index + 4, detail: '件数不可为空' });
          }
          it.trayNum = 0;
        }

        if (['木箱', '大件托盘', '标准托盘'].includes(it.packing)) {
          if (!it.trayNum) {
            errorMessage.push({ index: index + 4, detail: '托数不可为空' });
          }
          it.number = 0;
        }

        if (it.changeOrderFiles === '是') {
          it.operateInStorage = '是';
        }
        it.suggestedPrice = await searchTaskPrice(
          it.size,
          parseFloat(it.weight),
          it.country,
          it.outboundMethod,
          it.number,
          it.postcode ? it.postcode.slice(0, 2) : ''
        );
        it.inStatus = InBoundDetailStatus.WaitCheck;
        currentRows.push(Object.assign({}, defaultTask, it));
        if (res.length > 0) {
          const realMessageDetail = [];
          for (const item of res) {
            const detailInfo = allKeysList.find((x) => x.field === item).label;
            realMessageDetail.push(detailInfo);
          }
          errorMessage.push({ index: index + 4, detail: realMessageDetail });
        }
      }
      if (currentRows.length > 0 && errors.length == 0) {
        // Handle duplicate ticketId values
        const ticketIdCount = {};

        // First pass: count occurrences of each ticketId
        for (const row of currentRows) {
          if (row.ticketId) {
            ticketIdCount[row.ticketId] = (ticketIdCount[row.ticketId] || 0) + 1;
          }
        }
        // Second pass: append sequential numbers to duplicate ticketIds
        for (const ticketId in ticketIdCount) {
          if (ticketIdCount[ticketId] > 1) {
            let counter = 1;
            for (const row of currentRows) {
              if (row.ticketId === ticketId) {
                row.ticketId = `${row.ticketId}-${counter}`;
                counter++;
              }
            }
          }
        }
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
    defaultValue = Object.assign(defaultValue, value);
    startLoading();
    loadingMessage = '';
    if (value?.id) {
      value.planArriveDateTime = dayjs(value.planArriveDateTime).format('YYYY-MM-DDT00:00:00');
      await addOrUpdateNotify(value);
      const taskList = await getTaskListByNotifyId(value.id);
      const log = (await getInventoryUseLogListByNotifyId(value.id))[0];
      if (log) {
        await addOrUpdateInventoryUseLog({
          id: log.id,
          notifyId: value.id,
          inventoryId: value.inventoryId,
          useAtTimestamp: getCurrentLogTime(value.planArriveDateTime, value.adminTimeSpan),
        });
      }
      for (const task of taskList) {
        task.customerId = value.customerId;
        task.inventoryId = value.inventoryId;
        task.inHouseTime = value.inHouseTime;
        task.planArriveDateTime = value.planArriveDateTime;
        await addOrUpdateTask(task);
      }
      emit('saved');
    } else {
      loadingMessage += '正在读取文件！' + `<br>`;
      const userStore = useUserStore();
      value.notifyType = prop.type;
      value.unloadingFile = '';
      value.totalTime = '';
      value.unloadEndTime = '';
      value.unloadStartTime = '';
      value.realDate = '';
      value.totalCount = '';
      value.operationalRemarks = '';
      value.salesName = userStore.info?.userName;
      value.cashStatus = '';
      value.planArriveDateTime = dayjs(value.planArriveDateTime).format('YYYY-MM-DD') + 'T00:00:00';
      value.inStatus = InBoundStatus.WaitCheck;
      let taskList = [...(await readFile(value.files?.[0].file, value.notifyType))];
      value.containerNo = defaultValue.containerNo.trim();
      value.arrivedCount =
        safeSumBy(taskList, 'number').toString() +
        '件' +
        safeSumBy(taskList, 'trayNum').toString() +
        '托';

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
              detailTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
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
