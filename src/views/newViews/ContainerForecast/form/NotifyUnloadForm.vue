<script lang="ts" setup>
  import { computed, watchEffect } from 'vue';
  import { InBoundStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import { handleRequest, safeParseInt, safeSumInt, toastSuccess } from '@/store/utils/utils';
  import { timeDisplayYMD } from '@/views/bolita-views/composable/useableColumns';
  import dayjs from 'dayjs';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { usePermission } from '@/hooks/web/usePermission';
  import { useUserStore } from '@/store/modules/user';
  import { NotifyListPower } from '@/api/dataLayer/common/PowerModel';
  import { PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';
  import { $ref } from 'vue/macros';
  import { addOrUpdateNotify, getNotifyById } from '@/api/newDataLayer/Notify/Notify';
  import { addOrUpdateTask, getTaskListByNotifyId } from '@/api/newDataLayer/TaskList/TaskList';
  import { addOrUpdateTaskTimeLine } from '@/api/newDataLayer/TimeLine/TimeLine';

  interface Props {
    notifyId: string;
  }

  const { hasPermission } = usePermission();

  const userInfo = $computed(() => {
    return useUserStore()?.info;
  });

  const userPowerType = $computed(() => {
    return userInfo?.userType;
  });

  const canEdit = $computed(() => {
    return notifyInfo?.inStatus !== InBoundStatus.All || userPowerType === PermissionEnums.Manager;
  });
  const AccountPowerList = computed(() => {
    return userInfo?.powerList;
  });
  const showBtn = computed(() => {
    console.log(AccountPowerList.value);
    return hasPermission([NotifyListPower.Operate]);
  });

  const props = defineProps<Props>();
  let notifyInfo: any | null = $ref(null);
  let currentTaskList: any[] = $ref([]);

  const emit = defineEmits(['close', 'refresh', 'save']);
  watchEffect(async () => {
    await reload();
  });

  const totalContainerCount = computed(() => {
    return currentTaskList.reduce((sum, i) => sum + safeParseInt(i?.number), 0);
  });

  const totalTrayCount = computed(() => {
    return currentTaskList.reduce((sum, i) => sum + safeParseInt(i?.trayCount), 0);
  });
  const totalArrivedContainerCount = computed(() => {
    return safeSumInt(currentTaskList, 'arrivedContainerNumEdit') ?? 0;
  });
  const totalArrivedTrayCount = computed(() => {
    return safeSumInt(currentTaskList, 'arrivedTrayNumEdit') ?? 0;
  });

  async function reload() {
    if (props.notifyId != null) {
      notifyInfo = await getNotifyById(props.notifyId);
      console.log(notifyInfo, ' info');
      currentTaskList = await getTaskListByNotifyId(notifyInfo.id);
      emit('refresh');
      unloadPerson = notifyInfo?.unloadPerson ?? '';
      loadAll();
    }
  }

  let unloadPerson: string = $ref('');
  let startTime: any = $ref(null);
  let endTime: any = $ref(null);
  let realDate: any = $ref(null);

  const totalTime = $computed(() => {
    const res = dayjs(realDate).format('YYYY-MM-DD');
    const currentEndDateTime = res + ' ' + endTime;
    const currentStartDateTime = res + ' ' + startTime;
    const result = Math.ceil(dayjs(currentEndDateTime).diff(currentStartDateTime, 'minute') / 60);
    console.log(result, 'result');
    if (result) {
      return result;
    } else {
      return '';
    }
  });

  const canSave = $computed(() => {
    return realDate && startTime && endTime && unloadPerson;
  });

  function allArrived() {
    currentTaskList.forEach((it) => {
      it.arrivedTrayNumEdit = it.trayNum ?? 0;
      it.arrivedContainerNumEdit = it.number;
    });
  }

  function loadAll() {
    currentTaskList.forEach((it, index) => {
      currentTaskList[index].arrivedTrayNumEdit = it.arrivedTrayNum == 0 ? '' : it.arrivedTrayNum;
      currentTaskList[index].arrivedContainerNumEdit =
        it.arrivedContainerNum == 0 ? '' : it.arrivedContainerNum;
    });
  }

  function compareStatus(currentValue: string, limitValue: string) {
    if (safeParseInt(currentValue) == safeParseInt(limitValue)) {
      return 'success';
    } else {
      return safeParseInt(currentValue) > safeParseInt(limitValue) ? 'error' : 'warning';
    }
  }

  let loading: boolean = $ref(false);
  let log: string = $ref('');

  async function confirm() {
    loading = true;
    const newInStatus = InBoundStatus.All;
    let request = [];
    let i = 0;
    for (const listElement of currentTaskList) {
      i = i + 1;
      log = '正在加载' + '第' + i + '票货物,共' + currentTaskList.length + '票' + `<br>`;
      listElement.arrivedTrayNum = listElement.arrivedTrayNumEdit ?? 0;
      listElement.arrivedContainerNum = listElement.arrivedContainerNumEdit ?? 0;
      listElement.note = listElement.note ?? '';
      listElement.warehouseLocation = listElement.warehouseLocation ?? '';
      listElement.instorageTrayNum = listElement.arrivedTrayNumEdit ?? 0;
      listElement.instorageContainerNum = listElement.arrivedContainerNumEdit ?? 0;
      listElement.inStatus =
        listElement.outboundMethod === '存仓'
          ? '存仓'
          : listElement.operateInStorage === '是'
          ? '入库待操作'
          : newInStatus;
      listElement.arriveTime = dayjs(realDate).format('YYYY-MM-DD') + ' ' + startTime;
      listElement.customerId = listElement.customer.id;
      listElement.inventoryId = listElement.inventory.id;
      if (listElement.inStatus === '存仓') {
        await addOrUpdateTaskTimeLine({
          useType: 'storage',
          bolitaTaskId: listElement.id,
          operator: userInfo?.realName,
          detailTime: dayjs().valueOf(),
          note: '开始存仓',
        });
      }
      await addOrUpdateTaskTimeLine({
        useType: 'normal',
        bolitaTaskId: listElement.id,
        operator: userInfo?.realName,
        detailTime: dayjs().valueOf(),
        note: '卸柜并入库',
      });
      request.push(addOrUpdateTask(listElement));
    }
    log += '正在处理数据';
    await Promise.all(request);
    (notifyInfo.arrivedCount =
      totalArrivedTrayCount.value + '托' + totalArrivedContainerCount.value + '箱'),
      (notifyInfo.inStatus = newInStatus),
      (notifyInfo.unloadPerson = unloadPerson),
      (notifyInfo.totalCount = totalTrayCount.value + totalContainerCount.value),
      (notifyInfo.realDate = realDate),
      (notifyInfo.unloadStartTime = startTime),
      (notifyInfo.unloadEndTime = endTime),
      (notifyInfo.totalTime = totalTime);
    notifyInfo.customerId = notifyInfo.customer.id;
    notifyInfo.inventoryId = notifyInfo.inventory.id;

    const res = await addOrUpdateNotify(notifyInfo);

    await handleRequest(res, () => {
      toastSuccess('success');
      emit('save');
    });
    loading = false;
  }
</script>

<template>
  <div id="print" class="mt-8">
    <loading-frame :loading="loading" :title="log">
      <n-descriptions v-if="notifyInfo" :columns="2" bordered label-placement="left">
        <n-descriptions-item label="货柜号">
          {{ notifyInfo?.containerNo }}
        </n-descriptions-item>

        <n-descriptions-item label="客户ID">
          {{ notifyInfo?.customer.customerName }}</n-descriptions-item
        >
        <n-descriptions-item label="预约日期时间">
          {{ timeDisplayYMD(notifyInfo?.planArriveDateTime) }}/{{ notifyInfo?.inHouseTime }}
        </n-descriptions-item>
        <n-descriptions-item label="实际入库日期">
          {{ timeDisplayYMD(notifyInfo?.arrivedInventoryTime) ?? '' }}
        </n-descriptions-item>
        <n-descriptions-item label="预报总数"> {{ notifyInfo?.arrivedCount }}</n-descriptions-item>
        <n-descriptions-item label="实际卸柜日期">
          <n-date-picker v-model:value="realDate" type="date" />
        </n-descriptions-item>
        <!--        <n-descriptions-item label="实际卸柜日期">-->
        <!--          <n-date-picker v-model:value="currentDate" clearable type="date" />-->
        <!--        </n-descriptions-item>-->
        <n-descriptions-item label="卸柜起始时间">
          <n-time-picker v-model:formatted-value="startTime" value-format="HH:mm:ss" />
        </n-descriptions-item>
        <n-descriptions-item label="卸柜结束时间">
          <n-time-picker v-model:formatted-value="endTime" value-format="HH:mm:ss" />
        </n-descriptions-item>
        <n-descriptions-item label="卸柜时长">
          <n-input v-model:value="totalTime" disabled />
        </n-descriptions-item>
      </n-descriptions>
      <div class="mt-4 noMaxHeight" style="max-height: 800px; overflow-y: scroll">
        <n-table :single-line="false" class="mt-4">
          <thead>
            <tr>
              <th>票号</th>
              <th>预报 托</th>
              <th>预报 箱</th>
              <th style="width: 100px">入库 托</th>
              <th style="width: 100px">入库 箱</th>
              <th>库位</th>
              <th>仓库备注</th>
            </tr>
          </thead>
          <tbody v-if="currentTaskList">
            <tr v-for="item in currentTaskList" :key="item.id">
              <td>{{ item?.ticketId }}</td>
              <td>{{ item?.trayNum ?? 0 }}</td>
              <td>{{ item?.number ?? 0 }}</td>
              <td>
                <n-input
                  v-model:value="item.arrivedTrayNumEdit"
                  :disabled="!canEdit"
                  :status="compareStatus(item.arrivedTrayNumEdit, item.trayNum)"
                  placeholder=""
                  @focus="item.arrivedTrayNumEdit = ''"
                />
              </td>
              <td>
                <n-input
                  v-model:value="item.arrivedContainerNumEdit"
                  :disabled="!canEdit"
                  :status="compareStatus(item.arrivedContainerNumEdit, item.containerNum)"
                  placeholder=""
                  @focus="item.arrivedContainerNumEdit = ''"
                />
              </td>
              <td>
                <n-input v-model:value="item.note" :disabled="!canEdit" placeholder="" />
              </td>
              <td>
                <n-input
                  v-model:value="item.warehouseLocation"
                  :disabled="!canEdit"
                  placeholder=""
                />
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>
      <div class="mt-4">
        <table>
          <tr class="!bg-gray-100" style="height: 32px">
            <td>总计</td>
            <td>预报 箱 {{ totalContainerCount }}</td>
            <td>到达 箱 {{ totalArrivedContainerCount }}</td>
          </tr>
        </table>
      </div>
      <n-space v-if="notifyInfo" :wrap-item="false" class="mt-4">
        <n-button v-print="'#print'" type="default">打印</n-button>
        <n-button secondary @click="allArrived">全部到齐</n-button>
        <div class="flex-grow"></div>
        <div>
          <n-input v-model:value="unloadPerson" placeholder="卸柜人员" />
        </div>
        <n-button :disabled="!canSave" type="primary" @click="confirm">确认全部到货 </n-button>
      </n-space>
    </loading-frame>
  </div>
</template>

<style lang="less" scoped>
  @media print {
    .noMaxHeight {
      max-height: unset !important;
      overflow: hidden;
    }
  }
</style>
