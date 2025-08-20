<template>
  <div class="mt-2">
    <div v-if="step === 1">
      <n-descriptions :columns="3" bordered label-placement="left">
        <n-descriptions-item :span="2" label="FBA号">
          <n-input v-model:value="FBACode" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="托数">
          <n-input v-model:value="trayNum" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="数量">
          <n-input v-model:value="containerNum" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="总实重">
          <n-input v-model:value="totalWeight" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="总体积">
          <n-input v-model:value="totalVolume" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="Ref">
          <n-input v-model:value="ref" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="po">
          <n-input v-model:value="po" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="FBACode">
          <n-input v-model:value="deliveryCode" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="ISA">
          <n-input v-model:value="ISA" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="备注">
          <n-input v-model:value="note" />
        </n-descriptions-item>
      </n-descriptions>
      <div class="mt-4">
        <n-button style="float: right" type="info" @click="nextStep">下一步</n-button>
      </div>
    </div>
    <div v-else-if="step === 2">
      <div class="text-center font-bold">提货仓库地址</div>
      <n-descriptions :columns="3" bordered label-placement="left">
        <n-descriptions-item :span="2" label="街道">
          <n-input v-model:value="warehouseStreet" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="电话/邮箱">
          <n-input v-model:value="warehouseEmail" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="地址附加">
          <n-input v-model:value="warehouseAppendAddress" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="门牌号">
          <n-input v-model:value="warehouseHouseNo" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="城市">
          <n-input v-model:value="warehouseCity" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="邮编">
          <n-input v-model:value="warehousePostcode" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="国家">
          <n-input v-model:value="warehouseCountry" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="州">
          <n-input v-model:value="warehouseState" />
        </n-descriptions-item>
      </n-descriptions>
      <div class="mt-4">
        <n-button type="info" @click="lastStep">上一步</n-button>
        <n-button style="float: right" type="info" @click="nextStep">下一步</n-button>
      </div>
    </div>
    <div v-else>
      <div class="text-center font-bold">收件人地址</div>
      <n-descriptions :columns="3" bordered label-placement="left">
        <n-descriptions-item :span="2" label="街道">
          <n-input v-model:value="customerStreet" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="电话/邮箱">
          <n-input v-model:value="customerEmail" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="地址附加">
          <n-input v-model:value="customerAppendAddress" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="门牌号">
          <n-input v-model:value="customerHouseNo" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="城市">
          <n-input v-model:value="customerCity" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="邮编">
          <n-input v-model:value="customerPostcode" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="国家">
          <n-input v-model:value="customerCountry" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="州">
          <n-input v-model:value="customerState" />
        </n-descriptions-item>
      </n-descriptions>
      <div class="mt-4">
        <n-button type="info" @click="lastStep">上一步</n-button>
        <div style="float: right">
          <n-button type="info" @click="save">保存</n-button>
        </div>
      </div>
    </div>
    <n-button v-if="currentId && data.interception !== 1" type="error" @click="cancel"
      >截停</n-button
    >
  </div>
</template>
<script lang="ts" setup>
  import { $ref } from 'vue/macros';
  import {
    addOutboundForecastByOut,
    updateOutboundForecastByOut,
  } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import { watchEffect } from 'vue';
  import dayjs from 'dayjs';

  let currentId = $ref('');

  interface Props {
    data?: any;
  }
  let step = $ref(1);
  let FBACode = $ref('');
  let trayNum = $ref('');
  let containerNum = $ref('');
  let totalWeight = $ref('');
  let totalVolume = $ref('');
  let ref = $ref('');
  let po = $ref('');
  let deliveryCode = $ref('');
  let ISA = $ref('');
  let note = $ref('');
  let warehouseStreet = $ref('');
  let warehouseEmail = $ref('');
  let warehouseAppendAddress = $ref('');
  let warehouseHouseNo = $ref('');
  let warehouseCity = $ref('');
  let warehousePostcode = $ref('');
  let warehouseCountry = $ref('');
  let warehouseState = $ref('');
  let customerStreet = $ref('');
  let customerEmail = $ref('');
  let customerAppendAddress = $ref('');
  let customerHouseNo = $ref('');
  let customerCity = $ref('');
  let customerPostcode = $ref('');
  let customerCountry = $ref('');
  let customerState = $ref('');

  const prop = defineProps<Props>();

  const emit = defineEmits(['saved']);

  watchEffect(async () => {
    await reload();
  });

  async function cancel() {
    await updateOutboundForecastByOut(prop.data.id, { interception: 1 });
    emit('saved');
  }

  function reload() {
    FBACode = prop.data.FBACode ?? '';
    trayNum = prop.data.trayNum ?? '';
    containerNum = prop.data.containerNum ?? '';
    totalWeight = prop.data.totalWeight ?? '';
    totalVolume = prop.data.totalVolume ?? '';
    ref = prop.data.ref ?? '';
    po = prop.data.po ?? '';
    deliveryCode = prop.data.deliveryCode ?? '';
    ISA = prop.data.ISA ?? '';
    note = prop.data.note ?? '';
    warehouseStreet = prop.data.outWarehouseInfo?.warehouseStreet ?? '';
    warehouseEmail = prop.data.outWarehouseInfo?.warehouseEmail ?? '';
    warehouseAppendAddress = prop.data.outWarehouseInfo?.warehouseAppendAddress ?? '';
    warehouseHouseNo = prop.data.outWarehouseInfo?.warehouseHouseNo ?? '';
    warehouseCity = prop.data.outWarehouseInfo?.warehouseCity ?? '';
    warehousePostcode = prop.data.outWarehouseInfo?.warehousePostcode ?? '';
    warehouseCountry = prop.data.outWarehouseInfo?.warehouseCountry ?? '';
    warehouseState = prop.data.outWarehouseInfo?.warehouseState ?? '';
    customerStreet = prop.data.street ?? '';
    customerEmail = prop.data.email ?? '';
    customerAppendAddress = prop.data.appendAddress ?? '';
    customerHouseNo = prop.data.houseNo ?? '';
    customerCity = prop.data.city ?? '';
    customerPostcode = prop.data.postcode ?? '';
    customerCountry = prop.data.country ?? '';
    customerState = prop.data.state ?? '';
    currentId = prop.data.id ?? '';
  }

  async function save() {
    const res = {
      FBACode: FBACode,
      trayNum: trayNum,
      containerNum: containerNum,
      totalWeight: totalWeight,
      totalVolume: totalVolume,
      ref: ref,
      po: po,
      deliveryCode: deliveryCode,
      ISA: ISA,
      note: note,
      outWarehouseInfo: {
        warehouseStreet: warehouseStreet,
        warehouseEmail: warehouseEmail,
        warehouseAppendAddress: warehouseAppendAddress,
        warehouseHouseNo: warehouseHouseNo,
        warehouseCity: warehouseCity,
        warehousePostcode: warehousePostcode,
        warehouseCountry: warehouseCountry,
        warehouseState: warehouseState,
      },
      street: customerStreet,
      email: customerEmail,
      appendAddress: customerAppendAddress,
      houseNo: customerHouseNo,
      city: customerCity,
      postcode: customerPostcode,
      country: customerCountry,
      state: customerState,
      interception: 0,
    };
    if (currentId) {
      await updateOutboundForecastByOut(prop.data.id, res);
    } else {
      res.createTimestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
      await addOutboundForecastByOut(res);
    }
    emit('saved');
  }

  function lastStep() {
    step = step - 1;
  }

  function nextStep() {
    step = step + 1;
  }
</script>

<style lang="less" scoped></style>
