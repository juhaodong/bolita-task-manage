<script lang="ts" setup>
  import { computed, watchEffect } from 'vue';
  import { OutStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import { safeParseInt, safeSumInt, toastError, toastSuccess } from '@/store/utils/utils';
  import { timeDisplay, timeDisplayYMD } from '@/views/bolita-views/composable/useableColumns';
  import { ResultEnum } from '@/store/enums/httpEnum';
  import dayjs from 'dayjs';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { usePermission } from '@/hooks/web/usePermission';
  import { useUserStore } from '@/store/modules/user';
  import { $ref } from 'vue/macros';
  import { addOrUpdateTask, getTaskListByIds } from '@/api/newDataLayer/TaskList/TaskList';

  interface Props {
    outboundInfo: [];
    id: [];
  }

  const { hasPermission } = usePermission();

  const userInfo = $computed(() => {
    return useUserStore()?.info;
  });

  const props = defineProps<Props>();
  let currentTaskList: any[] = $ref([]);
  let currentOutBoundInfo = $ref([]);

  const emit = defineEmits(['close', 'refresh', 'save']);
  watchEffect(async () => {
    await reload();
  });

  const totalContainerCount = computed(() => {
    return currentTaskList.reduce((sum, i) => sum + safeParseInt(i?.arrivedContainerNum), 0);
  });

  const totalTrayCount = computed(() => {
    return currentTaskList.reduce((sum, i) => sum + safeParseInt(i?.arrivedTrayNum), 0);
  });
  const totalOutContainerCount = computed(() => {
    return safeSumInt(currentTaskList, 'outContainerNumEdit') ?? 0;
  });
  const totalOutTrayCount = computed(() => {
    return safeSumInt(currentTaskList, 'outTrayNumEdit') ?? 0;
  });

  async function reload() {
    currentOutBoundInfo = props.outboundInfo;
    currentTaskList = await getTaskListByIds(currentOutBoundInfo.outboundDetailInfo.split(','));
    outOperatePerson = currentOutBoundInfo?.outOperatePerson ?? '';
    loadAll();
  }

  let outOperatePerson: string = $ref('');
  let currentDate: any = $ref(null);
  let totalTime: string = $ref('');

  function allOut() {
    currentTaskList.forEach((it) => {
      it.outTrayNumEdit = it.arrivedTrayNum ?? 0;
      it.outContainerNumEdit = it.arrivedContainerNum ?? 0;
    });
  }

  function loadAll() {
    currentTaskList.forEach((it, index) => {
      currentTaskList[index].outTrayNumEdit = it.outTrayNum == 0 ? '' : it.outTrayNum;
      currentTaskList[index].outContainerNumEdit =
        it.outContainerNum == 0 ? '' : it.outContainerNum;
    });
    console.log(currentTaskList, 'list');
  }

  let loading: boolean = $ref(false);

  async function confirm() {
    loading = true;
    const newInStatus = OutStatus.uploadCar;
    for (const listElement of currentTaskList) {
      listElement.outTrayNum = listElement?.outTrayNumEdit ?? 0;
      listElement.outContainerNum = listElement?.outContainerNumEdit ?? 0;
      listElement.inStatus = newInStatus;
      listElement.OutBoundTime = dayjs().valueOf();
      const res = await addOrUpdateTask(listElement);
      if (res.code != ResultEnum.SUCCESS) {
        toastError(res.message);
        break;
      }
    }
    // await updateOutboundForecast(props.outboundInfo?.id, {
    //   outCount: totalOutTrayCount.value + '托' + totalOutContainerCount.value + '箱',
    //   inStatus: newInStatus,
    //   trayOutCount: totalOutTrayCount.value,
    //   containerOutCount: totalOutContainerCount.value,
    //   outOperatePerson: outOperatePerson,
    //   currentOutDate: currentDate ?? dayjs().format('YYYY-MM-DD'),
    //   outTotalTime: totalTime ?? '',
    // });
    toastSuccess('success');
    emit('save');
    loading = false;
  }
</script>

<template>
  <div id="print" class="mt-8">
    <loading-frame :loading="loading">
      <n-descriptions v-if="currentOutBoundInfo" :columns="2" bordered label-placement="left">
        <n-descriptions-item label="Ref.">
          {{ currentOutBoundInfo.REF ?? currentOutBoundInfo.id }}
        </n-descriptions-item>
        <n-descriptions-item label="预报总数">
          {{ currentOutBoundInfo?.containerNum }}</n-descriptions-item
        >
        <n-descriptions-item label="预约日期时间">
          {{ timeDisplay(currentOutBoundInfo?.pickUpDateTime) }}
        </n-descriptions-item>
        <n-descriptions-item label="装柜时长">
          <n-input v-model:value="totalTime" :placeholder="currentOutBoundInfo?.outTotalTime" />
        </n-descriptions-item>
        <n-descriptions-item label="实际装柜日期">
          <n-date-picker
            v-model:value="currentDate"
            :placeholder="timeDisplayYMD(currentOutBoundInfo?.currentOutDate)"
            type="date"
          />
        </n-descriptions-item>
      </n-descriptions>
      <div class="mt-4 noMaxHeight" style="max-height: 800px; overflow-y: scroll">
        <n-table :single-line="false" class="mt-4">
          <thead>
            <tr>
              <th>票号</th>
              <th>预报 托</th>
              <th>预报 箱</th>
              <th style="width: 100px">出库 托</th>
              <th style="width: 100px">出库 箱</th>
            </tr>
          </thead>
          <tbody v-if="currentTaskList">
            <tr v-for="item in currentTaskList" :key="item.id">
              <td>{{ item?.ticketId }}</td>
              <td>{{ item?.arrivedTrayNum ?? 0 }}</td>
              <td>{{ item?.arrivedContainerNum ?? 0 }}</td>
              <td>
                <n-input v-model:value="item.outTrayNumEdit" placeholder="" />
              </td>
              <td>
                <n-input v-model:value="item.outContainerNumEdit" placeholder="" />
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>
      <div class="mt-4">
        <table>
          <tr class="!bg-gray-100" style="height: 32px">
            <td>总计</td>
            <td>预报 {{ totalContainerCount }} 箱</td>
            <td>预报 {{ totalTrayCount }} 托 </td>
            <td>出库 {{ totalOutContainerCount }} 箱</td>
            <td>出库 {{ totalOutTrayCount }} 托 </td>
          </tr>
        </table>
      </div>
      <n-space v-if="currentOutBoundInfo" :wrap-item="false" class="mt-4">
        <n-button secondary @click="allOut">全部装柜</n-button>
        <div class="flex-grow"></div>
        <div>
          <n-input v-model:value="outOperatePerson" placeholder="装柜人员" />
        </div>
        <n-button type="primary" @click="confirm">确认装车 </n-button>
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
