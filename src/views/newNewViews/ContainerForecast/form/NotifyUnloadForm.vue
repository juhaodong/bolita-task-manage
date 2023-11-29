<script lang="ts" setup>
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
  import dayjs from 'dayjs';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { usePermission } from '@/hooks/web/usePermission';
  import { useUserStore } from '@/store/modules/user';
  import { NotifyListPower } from '@/api/dataLayer/common/PowerModel';
  import { PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';

  console.log(getDateNow, timeDisplay);

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
      notifyInfo = await NotifyManager.getById(props.notifyId);
      currentDate = notifyInfo.currentDate;
      currentTaskList = await getNotifyDetailListByNotify(props.notifyId);
      emit('refresh');
      unloadPerson = notifyInfo?.unloadPerson ?? '';
      loadAll();
    }
  }

  let unloadPerson: string = $ref('');
  let currentDate: string = $ref('');

  const canConfirm = computed(() => {
    return unloadPerson && canEdit;
  });

  function allArrived() {
    currentTaskList.forEach((it) => {
      it.arrivedTrayNumEdit = it.trayNum;
      it.arrivedContainerNumEdit = it.containerNum;
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

  async function confirm() {
    loading = true;
    for (const listElement of currentTaskList) {
      const editInfo: any = {
        arrivedTrayNum: listElement.arrivedTrayNumEdit ?? 0,
        arrivedContainerNum: listElement.arrivedContainerNumEdit ?? 0,
        note: listElement.note,
      };
      editInfo.instorageTrayNum = listElement.arrivedTrayNumEdit ?? 0;
      editInfo.instorageContainerNum = listElement.arrivedContainerNumEdit ?? 0;
      editInfo.arriveTime = dayjs().valueOf();
      const res = await NotifyDetailManager.edit(editInfo, listElement.id);
      if (res.code != ResultEnum.SUCCESS) {
        toastError(res.message);
        break;
      }
    }
    const newInStatus = InBoundStatus.All;

    const res = await NotifyManager.edit(
      {
        arrivedCount: totalArrivedTrayCount.value + totalArrivedContainerCount.value,
        inStatus: newInStatus,
        totalCount: totalTrayCount.value + totalContainerCount.value,
        unloadPerson: unloadPerson,
        currentDate: currentDate ?? '',
      },
      props.notifyId
    );
    await handleRequest(res, () => {
      toastSuccess('sucees');
      emit('save');
    });
    loading = false;
  }

  async function save() {
    loading = true;
    for (const listElement of currentTaskList) {
      if (
        listElement.arrivedTrayNumEdit != listElement.arrivedTrayNum ||
        listElement.arrivedContainerNumEdit != listElement.arrivedContainerNum
      ) {
        const editInfo: any = {
          arrivedTrayNum: listElement?.arrivedTrayNumEdit ?? 0,
          arrivedContainerNum: listElement?.arrivedContainerNumEdit ?? 0,
          note: listElement.note,
        };
        if (listElement.arrivedTrayNumEdit == listElement.trayNum) {
          editInfo.instorageTrayNum = listElement?.arrivedTrayNumEdit ?? 0;
        }
        if (listElement.arrivedContainerNumEdit == listElement.containerNum) {
          editInfo.instorageContainerNum = listElement?.arrivedContainerNumEdit ?? 0;
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
        unloadPerson: unloadPerson,
        currentDate: currentDate ?? '',
      },
      props.notifyId
    );
    await handleRequest(res, () => {
      toastSuccess('sucees');
      emit('save');
    });
    loading = false;
  }
</script>

<template>
  <div id="print" class="mt-8">
    <loading-frame :loading="loading">
      <n-descriptions v-if="notifyInfo" :columns="3" bordered label-placement="left">
        <n-descriptions-item :span="2" label="货柜号">
          {{ notifyInfo?.containerNo }}
        </n-descriptions-item>
        <n-descriptions-item label="卸柜人" />
        <n-descriptions-item label="日期"> {{ getDateNow() }}</n-descriptions-item>

        <n-descriptions-item label="客户ID"> {{ notifyInfo?.customerId }}</n-descriptions-item>
        <n-descriptions-item label="预约日期时间">
          {{ timeDisplay(notifyInfo?.reserveTime) }}
        </n-descriptions-item>
        <n-descriptions-item label="预报总数"> {{ notifyInfo?.totalCount }}</n-descriptions-item>
        <n-descriptions-item label="仓库ID">
          {{ notifyInfo?.warehouseId ?? '-' }}
        </n-descriptions-item>
        <n-descriptions-item label="卸柜起止时间">
          <n-input v-model:value="currentDate" placeholder="卸柜起止时间" />
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
              <th>备注</th>
            </tr>
          </thead>
          <tbody v-if="currentTaskList">
            <tr v-for="item in currentTaskList" :key="item.id">
              <td>{{ item?.ticketId }}</td>
              <td>{{ item?.trayNum ?? 0 }}</td>
              <td>{{ item?.containerNum ?? 0 }}</td>
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
            </tr>
          </tbody>
        </n-table>
      </div>
      <div class="mt-4">
        <table>
          <tr class="!bg-gray-100" style="height: 32px">
            <td>总计</td>
            <td>预报 托 {{ totalTrayCount }}</td>
            <td>预报 箱 {{ totalContainerCount }}</td>
            <td>到达 托 {{ totalArrivedTrayCount }}</td>
            <td>到达 箱 {{ totalArrivedContainerCount }}</td>
          </tr>
        </table>
      </div>
      <n-space v-if="notifyInfo" :wrap-item="false" class="mt-4">
        <n-button v-print="'#print'" type="default">打印</n-button>
        <n-button v-if="showBtn" secondary @click="allArrived">全部到齐</n-button>
        <div class="flex-grow"></div>
        <div>
          <n-input v-model:value="unloadPerson" placeholder="卸柜人员" />
        </div>
        <n-button v-if="showBtn" :disabled="!canEdit" secondary type="warning" @click="save"
          >保存
        </n-button>
        <n-button v-if="showBtn" :disabled="!canConfirm" type="primary" @click="confirm"
          >确认全部到货
        </n-button>
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
