<script lang="ts" setup>
  import { computed, watchEffect } from 'vue';
  import { InBoundStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import { handleRequest, safeParseInt, safeSumInt, toastSuccess } from '@/store/utils/utils';
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
  import { timeDisplayYMD } from '@/views/bolita-views/composable/useableColumns';

  interface Props {
    notifyId: string;
  }

  const { hasPermission } = usePermission();

  const userInfo = $computed(() => {
    return useUserStore()?.info;
  });

  const options = [
    { label: '纸箱', value: '纸箱' },
    { label: '木箱', value: '木箱' },
    { label: '标准托盘', value: '标准托盘' },
    { label: '大件托盘', value: '大件托盘' },
  ];

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
    return currentTaskList.reduce((sum, i) => sum + safeParseInt(i?.trayNum), 0);
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
      listElement.arriveTime = dayjs(realDate).format('YYYY-MM-DD') + 'T' + startTime;
      if (listElement.inStatus === '存仓') {
        await addOrUpdateTaskTimeLine({
          useType: 'storage',
          bolitaTaskId: listElement.id,
          operator: userInfo?.realName,
          detailTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
          note: '开始存仓',
        });
      }
      await addOrUpdateTaskTimeLine({
        useType: 'normal',
        bolitaTaskId: listElement.id,
        operator: userInfo?.realName,
        detailTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
        note: '卸柜并入库',
      });
      request.push(addOrUpdateTask(listElement));
    }
    log += '正在处理数据';
    await Promise.all(request);
    (notifyInfo.arrivedCount =
      totalArrivedContainerCount.value + '件' + totalArrivedTrayCount.value + '托'),
      (notifyInfo.inStatus = newInStatus),
      (notifyInfo.unloadPerson = unloadPerson),
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
  <div id="print" style="height: 100vh">
    <loading-frame :loading="loading" :title="log">
      <!-- 基本信息区域 -->
      <div class="info-section">
        <n-descriptions
          v-if="notifyInfo"
          :columns="2"
          bordered
          label-placement="left"
          size="medium"
        >
          <n-descriptions-item label="货柜号">
            {{ notifyInfo?.containerNo }}
          </n-descriptions-item>

          <n-descriptions-item label="客户ID">
            {{ notifyInfo?.customer.customerName }}</n-descriptions-item
          >
          <n-descriptions-item label="预约日期时间">
            {{ timeDisplayYMD(notifyInfo?.planArriveDateTime) }}/{{ notifyInfo?.inHouseTime }}
          </n-descriptions-item>
          <n-descriptions-item label="预报总数"> {{ notifyInfo?.totalCount }}</n-descriptions-item>
          <n-descriptions-item label="实际卸柜日期">
            <n-date-picker v-model:value="realDate" type="date" class="full-width-input" />
          </n-descriptions-item>
          <n-descriptions-item label="卸柜起始时间">
            <n-time-picker
              v-model:formatted-value="startTime"
              value-format="HH:mm:ss"
              class="full-width-input"
            />
          </n-descriptions-item>
          <n-descriptions-item label="卸柜结束时间">
            <n-time-picker
              v-model:formatted-value="endTime"
              value-format="HH:mm:ss"
              class="full-width-input"
            />
          </n-descriptions-item>
          <n-descriptions-item label="卸柜时长">
            <n-input v-model:value="totalTime" disabled class="full-width-input" />
          </n-descriptions-item>
        </n-descriptions>
      </div>

      <!-- 表格区域 -->
      <div class="table-section mt-2">
        <n-table :bordered="true" :single-line="false">
          <thead>
            <tr>
              <th style="width: 100px">票号</th>
              <th style="width: 40px">预报 箱托</th>
              <th style="width: 40px">预报 件</th>
              <th style="width: 80px">入库 箱托</th>
              <th style="width: 80px">入库 件</th>
              <th style="width: 160px">尺寸</th>
              <th style="width: 80px">入库方式</th>
              <th style="width: 80px">库位</th>
              <th style="width: 80px">仓库备注</th>
            </tr>
          </thead>
          <tbody v-if="currentTaskList">
            <tr v-for="item in currentTaskList" :key="item.id">
              <td>
                <n-tooltip v-if="item?.ticketId" trigger="hover">
                  <template #trigger>
                    <span class="ellipsis-cell">{{ item?.ticketId }}</span>
                  </template>
                  {{ item?.ticketId }}
                </n-tooltip>
              </td>
              <td class="text-center">{{ item?.trayNum ?? 0 }}</td>
              <td class="text-center">{{ item?.number ?? 0 }}</td>
              <td>
                <n-input v-model:value="item.arrivedTrayNumEdit" :disabled="!canEdit" />
              </td>
              <td>
                <n-input v-model:value="item.arrivedContainerNumEdit" :disabled="!canEdit" />
              </td>
              <td>
                <n-tooltip v-if="item.size" trigger="hover">
                  <template #trigger>
                    <n-input v-model:value="item.size" :disabled="!canEdit" />
                  </template>
                  {{ item.size }}
                </n-tooltip>
                <n-input v-else v-model:value="item.size" :disabled="!canEdit" />
              </td>
              <td>
                <n-select v-model:value="item.packing" :disabled="!canEdit" :options="options" />
              </td>
              <td>
                <n-tooltip v-if="item.warehouseLocation" trigger="hover">
                  <template #trigger>
                    <n-input v-model:value="item.warehouseLocation" :disabled="!canEdit" />
                  </template>
                  {{ item.warehouseLocation }}
                </n-tooltip>
                <n-input v-else v-model:value="item.warehouseLocation" :disabled="!canEdit" />
              </td>
              <td>
                <n-tooltip v-if="item.note" trigger="hover">
                  <template #trigger>
                    <n-input v-model:value="item.note" :disabled="!canEdit" />
                  </template>
                  {{ item.note }}
                </n-tooltip>
                <n-input v-else v-model:value="item.note" :disabled="!canEdit" />
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>

      <!-- 汇总区域 -->
      <div class="summary-section mt-4">
        <n-table :bordered="true" :single-line="true">
          <tbody>
            <tr class="summary-row">
              <td style="width: 100px" class="font-bold">总计</td>
              <td style="width: 200px"
                >预报 箱/箱托: {{ totalContainerCount }}/{{ totalTrayCount }}</td
              >
              <td style="width: 200px"
                >到达 箱/箱托: {{ totalArrivedContainerCount }}/{{ totalArrivedTrayCount }}</td
              >
            </tr>
          </tbody>
        </n-table>
      </div>

      <!-- 操作按钮区域 -->
      <div class="action-section">
        <n-space v-if="notifyInfo" :wrap="false" justify="space-between" align="center">
          <div>
            <n-space>
              <n-button v-print="'#print'" type="default">打印</n-button>
              <n-button secondary @click="allArrived">全部到齐</n-button>
            </n-space>
          </div>
          <div>
            <n-space>
              <n-input v-model:value="unloadPerson" placeholder="卸柜人员" style="width: 150px" />
              <n-button :disabled="!canSave" type="primary" @click="confirm">确认</n-button>
            </n-space>
          </div>
        </n-space>
      </div>
    </loading-frame>
  </div>
</template>

<style lang="less" scoped>
  .info-section,
  .table-section,
  .summary-section,
  .action-section {
    margin-bottom: 16px;
  }

  .table-section {
    max-height: calc(100vh - 400px);
    overflow-y: auto;
    border-radius: 4px;
  }

  .full-width-input {
    width: 100%;
  }

  .text-center {
    text-align: center;
  }

  .font-bold {
    font-weight: bold;
  }

  .summary-row {
    background-color: #f3f4f6;
    height: 40px;
  }

  .mt-6 {
    margin-top: 24px;
  }

  .ellipsis-cell {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :deep(.n-tooltip) {
    max-width: 300px;
    word-break: break-all;
  }

  @media print {
    .table-section {
      max-height: unset !important;
      overflow: visible !important;
    }
  }
</style>
