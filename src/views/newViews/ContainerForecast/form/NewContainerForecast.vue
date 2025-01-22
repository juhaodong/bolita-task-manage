<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <n-form
        ref="formRef"
        :model="currentData"
        :rules="rules"
        label-placement="left"
        label-width="100px"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="客户" path="customerId">
          <n-select
            v-model:value="currentData.customerId"
            :options="customerList"
            placeholder="客户"
          />
        </n-form-item>
        <n-form-item label="货柜号" path="containerNo">
          <n-input v-model:value="currentData.containerNo" placeholder="货柜号" />
        </n-form-item>
        <n-form-item label="仓库" path="inventoryId">
          <n-select
            v-model:value="currentData.inventoryId"
            :options="warehouseList"
            placeholder="仓库"
          />
        </n-form-item>
        <n-form-item v-if="currentData.inventoryId" label="预计到仓日期" path="planArriveDateTime">
          <n-date-picker
            v-model:value="currentData.planArriveDateTime"
            placeholder="预计到仓日期"
          />
        </n-form-item>
        <n-form-item
          v-if="currentData.planArriveDateTime && !model?.id"
          label="预计到仓时间"
          path="usefulTimeSpan"
        >
          <n-radio-group v-model:value="currentData.inHouseTime">
            <n-radio
              v-for="(item, index) in currentTimeList"
              :key="index"
              :disabled="item.useLogLength > item.totalAmount"
              :value="item.time"
              size="large"
            >
              {{ item.time }}
            </n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item v-if="model?.id" label="预计到仓时间">
          <n-input
            v-model:value="currentData.inHouseTime"
            disabled
            placeholder="时段"
            style="width: 200px"
          />
        </n-form-item>
        <n-form-item v-if="model?.id" label="运营预报时间">
          <n-select
            v-if="userPowerType"
            v-model:value="adminTimeSpan"
            :options="generateOptionFromTimeArray(timeArrays)"
            placeholder="时段"
            style="width: 200px"
          />
        </n-form-item>
        <n-form-item v-if="!model?.id" label="附件" path="files">
          <div style="display: flex; justify-items: center; align-content: center">
            <n-upload v-model:file-list="currentData.files">
              <n-button>上传文件</n-button>
            </n-upload>
            <n-button dashed style="margin-left: 20px" type="info" @click="downLoadFiles">
              下载文档
            </n-button>
          </div>
        </n-form-item>
        <n-form-item label="预报备注">
          <n-input v-model:value="currentData.note" placeholder="预报备注" />
        </n-form-item>
      </n-form>
      <n-button style="margin-left: 100px" @click="submit">提交</n-button>
    </loading-frame>
  </n-card>
</template>
<script lang="ts" setup>
  import { $ref } from 'vue/macros';
  import {
    getCurrentWarehouseUseTimespan,
    getInventoryList,
  } from '@/api/newDataLayer/Warehouse/Warehouse';
  import { computed, onMounted, ref, watch } from 'vue';
  import { getInventoryUseLogListByInventoryId } from '@/api/newDataLayer/Warehouse/UseLog';
  import dayjs from 'dayjs';
  import { groupBy } from 'lodash';
  import { getCustomerListByIds } from '@/api/newDataLayer/Customer/Customer';
  import { useUserStore } from '@/store/modules/user';
  import { getUserById } from '@/api/newDataLayer/User/User';
  import { userType } from '@/api/dataLayer/common/power';
  import { generateOptionFromTimeArray } from '@/store/utils/utils';
  import { timeArrays } from '@/api/newDataLayer/Common/Common';
  import { currentBaseImageUrl } from '@/api/dataLayer/fieldDefination/common';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';

  interface Props {
    model?: any;
    defaultValue: any;
  }
  const formRef = ref<FormInst | null>(null);
  let loading = $ref(false);
  let adminTimeSpan = $ref('');
  let customerList = $ref([]);
  let warehouseList = $ref([]);
  let rules = $ref({
    customerId: {
      required: true,
      trigger: ['blur', 'change'],
      message: '请输入',
    },
    containerNo: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入',
    },
    inventoryId: {
      required: true,
      trigger: ['blur', 'change'],
      message: '请输入',
    },
    planArriveDateTime: {
      type: 'number',
      required: true,
      trigger: ['blur', 'change'],
      message: '请输入',
    },
    files: {
      required: true,
      trigger: ['blur', 'change'],
      message: '请输入',
    },
    note: {
      required: false,
      trigger: ['blur', 'input'],
      message: '请输入',
    },
  });

  const emit = defineEmits(['submit', 'closed']);

  let currentWarehouse = $ref({});
  let currentData = $ref({
    customerId: '',
    containerNo: '',
    inventoryId: '',
    planArriveDateTime: null,
    files: [],
    note: '',
    inHouseTime: '',
  });
  let selectedWarehouseLog = $ref({});

  onMounted(async () => {
    loading = true;
    const userStore = useUserStore();
    const currentUser = await getUserById(userStore.info.id);
    customerList = (await getCustomerListByIds(currentUser.customerIds.split(','))).map((it) => ({
      label: it.customerName,
      value: it.id,
    }));
    warehouseList = (await getInventoryList()).map((it) => ({
      label: it.name,
      value: it.id,
    }));
    currentData.customerId = customerList[0]?.value;
    currentData.inventoryId = warehouseList[0]?.value;
    if (prop.model?.id) {
      currentData = Object.assign({}, prop.model);
      currentData.inventoryId = currentData.inventory.id;
      currentData.customerId = currentData.customer.id;
    }
    loading = false;
  });
  const userPowerType = computed(() => {
    return userType();
  });

  watch(
    currentData,
    async (value) => {
      if (value.inventoryId) {
        currentWarehouse = await getCurrentWarehouseUseTimespan(value.inventoryId);
      }
      if (value.inventoryId && value.planArriveDateTime) {
        const totalLog = (
          await getInventoryUseLogListByInventoryId(value.inventoryId, value.planArriveDateTime)
        ).map((it) => {
          it.inHouseTime = dayjs(it.useAtTimestamp).format('HH:mm');
          return it;
        });
        selectedWarehouseLog = groupBy(totalLog, 'inHouseTime');
      }
    },
    { deep: true, immediate: true }
  );

  const prop = defineProps<Props>();

  const currentTimeList = computed(() => {
    if (selectedWarehouseLog && currentWarehouse.useAmount) {
      const amount = currentWarehouse?.useAmount ? currentWarehouse?.useAmount.split(',') : [];
      return currentWarehouse?.useTimeSpan.split(',').map((it, index) => {
        return {
          time: it,
          useLogLength: selectedWarehouseLog[it]?.length ?? 0,
          totalAmount: amount[index],
        };
      });
    } else {
      return [];
    }
  });

  function downLoadFiles() {
    window.open(
      currentBaseImageUrl + 'https://aaden-storage.s3.eu-central-1.amazonaws.com/NotifyMoBan.xlsx'
    );
  }

  async function submit() {
    if (prop.model?.id) {
      currentData.inHouseTime = currentData.inHouseTime + '/' + adminTimeSpan;
    }
    await safeScope(async () => {
      emit('submit', currentData);
    });
  }
</script>

<style lang="less" scoped></style>
