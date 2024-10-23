<template>
  <n-card class="proCard">
    <template v-if="step === 1">
      <normal-form
        :default-value-model="model"
        :form-fields="model?.id ? editSchemas : schemas"
        @cancel="resetForm"
        @submit="handleSubmit"
      />
    </template>
    <template v-else>
      <div style="display: flex; margin-bottom: 20px">
        <n-space>
          <n-radio-group v-if="!model?.id" v-model:value="usefulTimeSpan">
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
          <div v-if="model?.id" style="display: flex; justify-content: center; align-items: center">
            <div class="mr-4">运营预报时间</div>
            <n-select
              v-if="userPowerType"
              v-model:value="adminTimeSpan"
              :options="generateOptionFromTimeArray(timeArrays)"
              placeholder="时段"
              style="width: 200px"
            />
          </div>
        </n-space>
      </div>
      <n-button
        :disabled="!usefulTimeSpan && !adminTimeSpan"
        style="margin-right: 20px"
        type="success"
        @click="submit"
        >上传</n-button
      >
      <n-button type="info" @click="step = 1">返回</n-button>
    </template>
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { getFilesUploadFormField } from '@/api/dataLayer/fieldDefination/common';
  import { FormFields, safeScope } from '@/api/dataLayer/common/GeneralModel';
  import {
    asyncUserCustomer,
    asyncWarehouseList,
    generateOptionFromTimeArray,
  } from '@/store/utils/utils';
  import { $ref } from 'vue/macros';
  import { getCurrentWarehouseUseTimespan } from '@/api/newDataLayer/Warehouse/Warehouse';
  import { computed } from 'vue';
  import { timeArrays } from '@/api/newDataLayer/Common/Common';
  import { getInventoryUseLogListByInventoryId } from '@/api/newDataLayer/Warehouse/UseLog';
  import dayjs from 'dayjs';
  import { groupBy } from 'lodash';
  import { userType } from '@/api/dataLayer/common/power';

  interface Props {
    model?: any;
    defaultValue: any;
  }

  let step = $ref(1);
  let usefulTimeSpan = $ref('');
  let adminTimeSpan = $ref('');

  const prop = defineProps<Props>();

  const currentTimeList = computed(() => {
    const amount = currentWarehouse?.useAmount.split(',');
    return currentWarehouse?.useTimeSpan.split(',').map((it, index) => {
      return {
        time: it,
        useLogLength: selectedWarehouseLog[it]?.length ?? 0,
        totalAmount: amount[index],
      };
    });
  });

  const userPowerType = computed(() => {
    return userType();
  });

  const schemas: FormFields = [
    {
      label: 'id',
      field: 'id',
      required: false,
      disableCondition: () => {
        return prop.model?.id;
      },
      displayCondition: () => {
        return prop.model?.id;
      },
    },
    asyncUserCustomer(prop.model ? prop.model.customer.id : prop.defaultValue.customerId),
    {
      field: 'containerNo',
      label: '货柜号',
      defaultValue: prop.model ? prop.model.containerNo : prop.defaultValue.containerNo,
    },
    asyncWarehouseList(prop.model ? prop.model.inventory.id : prop.defaultValue.inventoryId),
    {
      field: 'planArriveDateTime',
      component: 'NDatePicker',
      label: '预计到仓时间',
      defaultValue: prop.model
        ? prop.model.planArriveDateTime
        : prop.defaultValue.planArriveDateTime,
      componentProps: {
        type: 'date',
        clearable: true,
      },
    },
    getFilesUploadFormField('files', false, () => {
      window.open('https://aaden-storage.s3.eu-central-1.amazonaws.com/NotifyMoBan.xlsx');
    }),
    {
      field: 'note',
      label: '预报备注',
      defaultValue: prop.model ? prop.model.note : prop.defaultValue.note,
      required: false,
    },
  ];

  const editSchemas: FormFields = [
    {
      label: 'id',
      field: 'id',
      required: false,
      disableCondition: () => {
        return prop.model?.id;
      },
      displayCondition: () => {
        return prop.model?.id;
      },
    },
    asyncUserCustomer(prop.model ? prop.model.customer.id : prop.defaultValue.customerId),
    {
      field: 'containerNo',
      label: '货柜号',
      defaultValue: prop.model ? prop.model.containerNo : prop.defaultValue.containerNo,
    },
    asyncWarehouseList(prop.model ? prop.model.inventory.id : prop.defaultValue.inventoryId),
    {
      field: 'planArriveDateTime',
      component: 'NDatePicker',
      label: '预计到仓时间',
      defaultValue: prop.model
        ? prop.model.planArriveDateTime
        : prop.defaultValue.planArriveDateTime,
      componentProps: {
        type: 'date',
        clearable: true,
      },
    },
    {
      field: 'note',
      label: '预报备注',
      defaultValue: prop.model ? prop.model.note : prop.defaultValue.note,
      required: false,
    },
    {
      field: 'operationalRemarks',
      label: '运营备注',
      defaultValue: '',
      required: false,
    },
  ];

  const emit = defineEmits(['submit', 'closed']);

  let currentWarehouse = $ref({});
  let currentData = $ref({});
  let selectedWarehouseLog = $ref({});

  async function handleSubmit(values: any) {
    console.log(values, 'values');
    const totalLog = (
      await getInventoryUseLogListByInventoryId(values.inventoryId, values.planArriveDateTime)
    ).map((it) => {
      it.inHouseTime = dayjs(it.useAtTimestamp).format('HH:mm');
      return it;
    });
    selectedWarehouseLog = groupBy(totalLog, 'inHouseTime');
    currentWarehouse = await getCurrentWarehouseUseTimespan(values.inventoryId);
    console.log(currentWarehouse, 'house');
    if (prop.model?.id) {
      currentData = Object.assign(prop.model, values);
      console.log('333');
    } else {
      currentData = values;
    }

    step = 2;
  }
  async function submit() {
    if (!prop.model?.id) {
      currentData.inHouseTime = usefulTimeSpan;
    } else {
      currentData.inHouseTime = currentData.inHouseTime + '/' + adminTimeSpan;
    }
    console.log(currentData, 'data');

    await safeScope(async () => {
      emit('submit', currentData);
    });
  }
</script>

<style lang="less" scoped></style>
