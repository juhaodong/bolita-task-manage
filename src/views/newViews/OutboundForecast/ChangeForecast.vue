<script lang="ts" setup>
  import { $ref } from 'vue/macros';
  import { watchEffect } from 'vue';
  import { updateOutboundForecast } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';

  interface Props {
    id?: any;
    refCode?: any;
    pickDate?: any;
    pickTime?: any;
    isa?: any;
    amzId?: any;
    operator?: any;
    changeNote?: any;
  }

  let newPickDate = $ref(null);
  let newPickTime = $ref(null);
  let newOperator = $ref('');
  let newChangeNote = $ref('');
  const emit = defineEmits(['saved']);

  watchEffect(async () => {
    await reload();
  });

  async function save() {
    const res = {
      alreadyChanged: 1,
      reservationGetProductDetailTime: newPickTime,
      reservationGetProductTime: newPickDate ? newPickDate : prop.pickDate,
      changeOperator: newOperator ? newOperator : prop.operator,
      changeNote: newChangeNote ? newChangeNote : prop.changeNote,
    };
    await updateOutboundForecast(prop.id, res);
    emit('saved');
  }

  async function reload() {
    newPickTime = prop.pickTime;
  }
  const prop = defineProps<Props>();
</script>

<template>
  <div class="mt-8">
    <n-descriptions :columns="3" bordered label-placement="left">
      <n-descriptions-item :span="2" label="出库日期">
        <n-date-picker v-model:value="newPickDate" :placeholder="pickDate" type="date" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="出库时间">
        <n-input v-model:value="newPickTime"
      /></n-descriptions-item>
      <n-descriptions-item :span="2" label="Ref">
        {{ refCode }}
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="ISA">
        {{ isa }}
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="AMZ-Sendungs ID">
        {{ amzId }}
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="操作人">
        <n-input v-model:value="newOperator" :placeholder="operator" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="备注">
        <n-input v-model:value="newChangeNote" :placeholder="changeNote" />
      </n-descriptions-item>
    </n-descriptions>
    <n-space class="mt-4">
      <n-button secondary type="warning" @click="save">保存</n-button>
    </n-space>
  </div>
</template>

<style lang="less" scoped></style>
