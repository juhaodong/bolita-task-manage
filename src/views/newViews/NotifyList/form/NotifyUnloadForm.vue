<script setup lang="ts">
  import { computed, watchEffect } from 'vue';
  import { InBoundStatus, NotifyManager } from '@/api/dataLayer/modules/notify/notify-api';
  import {
    getNotifyDetailListByNotify,
    NotifyDetailManager,
  } from '@/api/dataLayer/modules/notify/notify-detail';
  import {
    handleRequest,
    safeParseInt,
    safeSumInt,
    toastError,
    toastSuccess,
  } from '@/store/utils/utils';
  import { getDateNow, timeDisplay } from '@/views/bolita-views/composable/useableColumns';
  import { ResultEnum } from '@/store/enums/httpEnum';

  console.log(getDateNow, timeDisplay);

  interface Props {
    notifyId: string;
  }

  const props = defineProps<Props>();
  let notifyDetail: any | null = $ref(null);
  let currentTaskList: any[] = $ref([]);

  const emit = defineEmits(['close', 'refresh', 'save']);
  watchEffect(async () => {
    await reload();
  });

  const totalContainerCount = computed(() => {
    return currentTaskList.reduce((sum, i) => sum + safeParseInt(i?.containerNum), 0);
  });

  const totalTrayCount = computed(() => {
    return currentTaskList.reduce((sum, i) => sum + safeParseInt(i?.trayCount), 0);
  });
  const totalArrivedContainerCount = computed(() => {
    return safeSumInt(currentTaskList, 'arrivedContainerNumEdit');
  });
  const totalArrivedTrayCount = computed(() => {
    return safeSumInt(currentTaskList, 'arrivedTrayNumEdit');
  });

  async function reload() {
    if (props.notifyId != null) {
      notifyDetail = await NotifyManager.getById(props.notifyId);
      currentTaskList = await getNotifyDetailListByNotify(props.notifyId);
      emit('refresh');
      loadAll();
    }
  }

  let unloadPerson: string = $ref('');

  const canConfirm = computed(() => {
    return unloadPerson;
  });

  function loadAll() {
    currentTaskList.forEach((it) => {
      it.arrivedTrayNumEdit = it.arrivedTrayNum ?? 0;
      it.arrivedContainerNumEdit = it.arrivedContainerNum ?? 0;
    });
  }

  async function save() {
    for (const listElement of currentTaskList) {
      if (
        listElement.arrivedTrayNumEdit != listElement.arrivedTrayNum ||
        listElement.arrivedContainerNumEdit != listElement.arrivedContainerNum
      ) {
        const editInfo: any = {
          arrivedTrayNum: listElement.arrivedTrayNumEdit,
          arrivedContainerNum: listElement.arrivedContainerNumEdit,
          note: listElement.note,
        };
        if (listElement.arrivedTrayNumEdit == listElement.trayNum) {
          editInfo.instorageTrayNum = listElement.arrivedTrayNumEdit;
        }
        if (listElement.arrivedContainerNumEdit == listElement.containerNum) {
          editInfo.instorageContainerNum = listElement.arrivedContainerNumEdit;
        }
        const res = await NotifyDetailManager.edit(editInfo, listElement.id);
        if (res.code != ResultEnum.SUCCESS) {
          toastError(res.message);
          break;
        }
      }
    }
    const newInStatus =
      totalContainerCount.value + totalTrayCount.value ==
      totalArrivedTrayCount.value + totalArrivedContainerCount.value
        ? InBoundStatus.All
        : InBoundStatus.Partial;
    const res = await NotifyManager.edit(
      {
        arrivedCount: totalArrivedTrayCount.value + totalArrivedContainerCount.value,
        inStatus: newInStatus,
        totalCount: totalTrayCount.value + totalContainerCount.value,
      },
      props.notifyId
    );
    await handleRequest(res, () => {
      toastSuccess('sucees');
      emit('save');
    });
  }
</script>

<template>
  <div class="mt-8">
    <n-descriptions v-if="notifyDetail" :columns="3" label-placement="left" bordered>
      <n-descriptions-item :span="2" label="卸柜人" />
      <n-descriptions-item label="日期"> {{ getDateNow() }}</n-descriptions-item>
      <n-descriptions-item label="货柜号"> {{ notifyDetail?.containerNo }}</n-descriptions-item>
      <n-descriptions-item label="客户ID"> {{ notifyDetail?.customerId }}</n-descriptions-item>
      <n-descriptions-item label="预约日期时间">
        {{ timeDisplay(notifyDetail?.planArriveDateTime) }}
      </n-descriptions-item>
      <n-descriptions-item label="预报总数"> {{ notifyDetail?.totalCount }}</n-descriptions-item>
      <n-descriptions-item label="仓库ID">
        {{ notifyDetail?.warehouse ?? '-' }}
      </n-descriptions-item>
      <n-descriptions-item label="卸柜起止时间" />
    </n-descriptions>
    <div class="mt-4" style="max-height: 800px; overflow-y: scroll">
      <n-table class="mt-4" :single-line="false">
        <thead>
          <tr>
            <th>票号</th>
            <th>预报 托</th>
            <th>预报 箱</th>
            <th style="width: 100px">入库 托</th>
            <th style="width: 100px">入库 箱</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody v-if="currentTaskList">
          <tr :key="item.id" v-for="item in currentTaskList">
            <td>{{ item.id }}</td>
            <td>{{ item?.trayNum ?? 0 }}</td>
            <td>{{ item?.containerNum ?? 0 }}</td>
            <td>
              <n-input
                v-model:value="item.arrivedTrayNumEdit"
                placeholder=""
                @focus="item.arrivedTrayNumEdit = ''"
              />
            </td>
            <td>
              <n-input
                @focus="item.arrivedContainerNumEdit = ''"
                v-model:value="item.arrivedContainerNumEdit"
                placeholder=""
              />
            </td>
            <td>
              <n-input v-model:value="item.note" placeholder="" />
            </td>
          </tr>
        </tbody>
      </n-table>
    </div>

    <n-space class="mt-4">
      <n-button type="default">打印</n-button>
      <table class="grow" style="width: 400px">
        <tr class="!bg-gray-100" style="height: 32px">
          <td>总计</td>
          <td>预报 托 {{ totalTrayCount }}</td>
          <td>预报 箱 {{ totalContainerCount }}</td>
          <td>到达 托 {{ totalArrivedTrayCount }}</td>
          <td>到达 箱 {{ totalArrivedContainerCount }}</td>
        </tr>
      </table>

      <n-input placeholder="卸柜人员" v-model:value="unloadPerson" />
      <n-button @click="save" type="primary" :disabled="!canConfirm">确认</n-button>
    </n-space>
  </div>
</template>

<style scoped lang="less"></style>
