<template>
  <n-card class="proCard">
    <template v-if="step === 1">
      <normal-form
        :default-value-model="model"
        :form-fields="schemas"
        @cancel="resetForm"
        @submit="handleSubmit"
      />
    </template>
    <template v-else>
      <div style="display: flex; margin-bottom: 20px">
        <n-space>
          <n-radio-group v-model:value="usefulTimeSpan">
            <n-radio
              v-for="(item, index) in currentTimeList"
              :key="index"
              :disabled="item.useLogLength > currentWarehouse.useAmount"
              :value="item.time"
              size="large"
            >
              {{ item.time }}
            </n-radio>
          </n-radio-group>
        </n-space>
      </div>
      <n-button
        :disabled="!usefulTimeSpan"
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
  import { asyncUserCustomer, asyncWarehouseList } from '@/store/utils/utils';
  import { $ref } from 'vue/macros';
  import {
    getCurrentWarehouseUseTimespan,
    getInventoryByName,
  } from '@/api/newDataLayer/Warehouse/Warehouse';
  import { computed } from 'vue';
  import { getInventoryUseLogListByInventoryId } from '@/api/newDataLayer/Warehouse/UseLog';
  import dayjs from 'dayjs';
  import { groupBy } from 'lodash';

  interface Props {
    model?: any;
    defaultValue: any;
  }

  let step = $ref(1);
  let usefulTimeSpan = $ref('');

  const prop = defineProps<Props>();

  const currentTimeList = computed(() => {
    return currentWarehouse?.useTimeSpan.split(',').map((it) => {
      return { time: it, useLogLength: selectedWarehouseLog[it]?.length ?? 0 };
    });
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
    asyncUserCustomer(prop.model ? prop.model.customerName : prop.defaultValue.customerName),
    {
      field: 'containerNo',
      label: '货柜号',
      defaultValue: prop.model ? prop.model.containerNo : prop.defaultValue.containerNo,
    },
    asyncWarehouseList(prop.model ? prop.model.warehouseId : prop.defaultValue.warehouseId),
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
      window.open(
        'https://firebasestorage.googleapis.com/v0/b/bolita-task-manage.appspot.com/o/NotifyMoBan.xlsx?alt=media&token=12ccc420-eb09-4afb-9ad4-fff39da9da77'
      );
    }),
    {
      field: 'note',
      label: '预报备注',
      defaultValue: prop.model ? prop.model.note : prop.defaultValue.note,
      required: false,
    },
  ];

  const emit = defineEmits(['submit', 'closed']);

  let currentWarehouse = $ref({});
  let currentData = $ref({});
  let selectedWarehouseLog = $ref({});

  async function handleSubmit(values: any) {
    const warehouseInfo = await getInventoryByName(values.warehouseId);
    const wareHouseId = warehouseInfo.id;
    const totalLog = (
      await getInventoryUseLogListByInventoryId(wareHouseId, values.planArriveDateTime)
    ).map((it) => {
      it.inHouseTime = dayjs(it.useAtTimestamp).format('HH:mm');
      return it;
    });
    selectedWarehouseLog = groupBy(totalLog, 'inHouseTime');
    currentWarehouse = await getCurrentWarehouseUseTimespan(values.warehouseId);
    currentData = values;
    step = 2;
  }
  async function submit() {
    currentData.inHouseTime = usefulTimeSpan;
    await safeScope(async () => {
      emit('submit', currentData);
    });
  }
</script>

<style lang="less" scoped></style>
