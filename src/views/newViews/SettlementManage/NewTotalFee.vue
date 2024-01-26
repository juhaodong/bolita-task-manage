<template>
  <div class="mt-8">
    <div>
      <n-grid :cols="6" item-responsive>
        <n-grid-item class="font-bold" span="2"> 客户:{{ currentData?.customerId }} </n-grid-item>
        <n-grid-item
          class="font-bold"
          span="2"
          style="display: flex; justify-content: center; align-items: center"
        >
          柜号{{ currentData?.containerId }}
        </n-grid-item>
        <n-grid-item
          class="font-bold"
          span="2"
          style="display: flex; justify-content: right; align-items: center"
        >
          票号:{{ currentData?.ticketId }}
        </n-grid-item>
      </n-grid>
    </div>
    <div v-if="!loading">
      <n-card :bordered="false" class="mt-4" embedded title="💴 入库费">
        <div>
          <div style="display: flex; align-items: flex-end; justify-content: end"
            >总计: {{ inboundTotal }}</div
          >
          <n-grid :cols="6" x-gap="12">
            <n-gi class="textStyle" span="2"> 类别 </n-gi>
            <n-gi class="textStyle"> 单价 </n-gi>
            <n-gi class="textStyle"> 数量 </n-gi>
            <n-gi class="textStyle"> 总计 </n-gi>
            <n-gi class="textStyle"> 备注 </n-gi>
          </n-grid>

          <div v-for="(a, index) in inboundFeeList" :key="a.key" class="d-flex align-center mb-1">
            <div style="display: flex">
              <n-grid :cols="6" x-gap="12">
                <n-gi span="2">
                  <n-select v-model:value="a.type" :options="inboundType" placeholder="type" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="a.price" placeholder="price" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="a.amount" placeholder="amount" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="a.total" disabled placeholder="total" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="a.note" placeholder="note" />
                </n-gi>
              </n-grid>
              <n-icon class="mt-1" size="24px" @click="inboundFeeList.splice(index, 1)">
                <Delete16Filled />
              </n-icon>
            </div>
          </div>
        </div>
      </n-card>
      <n-card :bordered="false" class="mt-4" embedded title="💴 出库费">
        <div>
          <div style="display: flex; align-items: flex-end; justify-content: end"
            >总计: {{ outboundTotal }}</div
          >
          <n-grid :cols="6" x-gap="12">
            <n-gi class="textStyle" span="2"> 类别 </n-gi>
            <n-gi class="textStyle"> 单价 </n-gi>
            <n-gi class="textStyle"> 数量 </n-gi>
            <n-gi class="textStyle"> 总计 </n-gi>
            <n-gi class="textStyle"> 备注 </n-gi>
          </n-grid>

          <div v-for="(b, index) in outboundFeeList" :key="b.key" class="d-flex align-center mb-1">
            <div style="display: flex">
              <n-grid :cols="6" x-gap="12">
                <n-gi span="2">
                  <n-select v-model:value="b.type" :options="outboundType" placeholder="type" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="b.price" placeholder="price" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="b.amount" placeholder="amount" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="b.total" disabled placeholder="total" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="b.note" placeholder="note" />
                </n-gi>
              </n-grid>
              <n-icon class="mt-1" size="24px" @click="outboundFeeList.splice(index, 1)">
                <Delete16Filled />
              </n-icon>
            </div>
          </div>
        </div>
      </n-card>
      <n-card :bordered="false" class="mt-4" embedded title="💴 操作费">
        <div>
          <div style="display: flex; align-items: flex-end; justify-content: end"
            >总计: {{ operateTotal }}</div
          >
          <n-grid :cols="6" x-gap="12">
            <n-gi class="textStyle" span="2"> 类别 </n-gi>
            <n-gi class="textStyle"> 单价 </n-gi>
            <n-gi class="textStyle"> 数量 </n-gi>
            <n-gi class="textStyle"> 总计 </n-gi>
            <n-gi class="textStyle"> 备注 </n-gi>
          </n-grid>

          <div v-for="(b, index) in operateFeeList" :key="b.key" class="d-flex align-center mb-1">
            <div style="display: flex">
              <n-grid :cols="6" x-gap="12">
                <n-gi span="2">
                  <n-select v-model:value="b.type" :options="operateType" placeholder="type" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="b.price" placeholder="price" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="b.amount" placeholder="amount" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="b.total" disabled placeholder="total" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="b.note" placeholder="note" />
                </n-gi>
              </n-grid>
              <n-icon class="mt-1" size="24px" @click="operateFeeList.splice(index, 1)">
                <Delete16Filled />
              </n-icon>
            </div>
          </div>
        </div>
      </n-card>
      <n-card :bordered="false" class="mt-4" embedded title="💴 特殊操作费">
        <div>
          <div style="display: flex; align-items: flex-end; justify-content: end"
            >总计: {{ specialOperateTotal }}</div
          >
          <n-grid :cols="6" x-gap="12">
            <n-gi class="textStyle" span="2"> 类别 </n-gi>
            <n-gi class="textStyle"> 单价 </n-gi>
            <n-gi class="textStyle"> 数量 </n-gi>
            <n-gi class="textStyle"> 总计 </n-gi>
            <n-gi class="textStyle"> 备注 </n-gi>
          </n-grid>

          <div
            v-for="(b, index) in specialOperateFeeList"
            :key="b.key"
            class="d-flex align-center mb-1"
          >
            <div style="display: flex">
              <n-grid :cols="6" x-gap="12">
                <n-gi span="2">
                  <n-select
                    v-model:value="b.type"
                    :options="specialOperationType"
                    placeholder="type"
                  />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="b.price" placeholder="price" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="b.amount" placeholder="amount" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="b.total" disabled placeholder="total" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="b.note" placeholder="note" />
                </n-gi>
              </n-grid>
              <n-icon class="mt-1" size="24px" @click="specialOperateFeeList.splice(index, 1)">
                <Delete16Filled />
              </n-icon>
            </div>
          </div>
        </div>
      </n-card>
      <n-card :bordered="false" class="mt-4" embedded title="💴 物流费">
        <div>
          <div style="display: flex; align-items: flex-end; justify-content: end"
            >总计: {{ deliveryTotal }}</div
          >
          <n-grid :cols="8" x-gap="12">
            <n-gi class="textStyle" span="2"> 方式 </n-gi>
            <n-gi class="textStyle" span="2"> 类别 </n-gi>
            <n-gi class="textStyle"> 单价 </n-gi>
            <n-gi class="textStyle"> 数量 </n-gi>
            <n-gi class="textStyle"> 总计 </n-gi>
            <n-gi class="textStyle"> 备注 </n-gi>
          </n-grid>

          <div v-for="(b, index) in deliveryFeeList" :key="b.key" class="d-flex align-center mb-1">
            <div style="display: flex">
              <n-grid :cols="8" x-gap="12">
                <n-gi span="2">
                  <n-select v-model:value="b.method" :options="allDelivery" placeholder="method" />
                </n-gi>
                <n-gi span="2">
                  <n-select
                    v-model:value="b.type"
                    :options="
                      b.method === '快递'
                        ? expressDelivery
                        : b.method === '直送'
                        ? directDelivery
                        : [{ label: '', value: '' }]
                    "
                    placeholder="type"
                  />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="b.price" placeholder="price" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="b.amount" placeholder="amount" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="b.total" disabled placeholder="total" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="b.note" placeholder="note" />
                </n-gi>
              </n-grid>
              <n-icon class="mt-1" size="24px" @click="deliveryFeeList.splice(index, 1)">
                <Delete16Filled />
              </n-icon>
            </div>
          </div>
        </div>
      </n-card>
      <n-card :bordered="false" class="mt-4" embedded title="💴 耗材费">
        <div>
          <div style="display: flex; align-items: flex-end; justify-content: end"
            >总计: {{ consumablesTotal }}</div
          >
          <n-grid :cols="6" x-gap="12">
            <n-gi class="textStyle" span="2"> 类别 </n-gi>
            <n-gi class="textStyle"> 单价 </n-gi>
            <n-gi class="textStyle"> 数量 </n-gi>
            <n-gi class="textStyle"> 总计 </n-gi>
            <n-gi class="textStyle"> 备注 </n-gi>
          </n-grid>

          <div v-for="(a, index) in consumablesList" :key="a.key" class="d-flex align-center mb-1">
            <div style="display: flex">
              <n-grid :cols="6" x-gap="12">
                <n-gi span="2">
                  <n-input v-model:value="a.type" placeholder="type" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="a.price" placeholder="price" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="a.amount" placeholder="amount" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="a.total" disabled placeholder="total" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="a.note" placeholder="note" />
                </n-gi>
              </n-grid>
              <n-icon class="mt-1" size="24px" @click="consumablesList.splice(index, 1)">
                <Delete16Filled />
              </n-icon>
            </div>
          </div>
        </div>
      </n-card>
    </div>
    <n-space style="float: right">
      <n-button secondary type="warning" @click="handleSubmit">保存</n-button>
    </n-space>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, watch } from 'vue';
  import { $ref } from 'vue/macros';
  import { generateOptionFromArray, safeSumBy } from '@/store/utils/utils';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import {
    addSettlement,
    getSettlement,
    updateSettlement,
  } from '@/api/dataLayer/common/SettlementType';
  import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
  import Delete16Filled from '@vicons/fluent/es/Delete16Filled';
  import { assign } from 'lodash';
  import dayjs from 'dayjs';

  interface Props {
    currentData?: any[];
  }
  let loading = $ref(false);

  const inboundType = generateOptionFromArray(['卸货费', '分拣费', '散箱入库', '托盘入库', '其他']);
  const outboundType = generateOptionFromArray([
    '散箱出库',
    '散箱换单出库',
    '托盘出库',
    '自提出库',
    '其他',
  ]);
  const operateType = generateOptionFromArray([
    '打托费',
    '大标签费',
    '小标签费',
    '清点费',
    '换单',
    '其他',
  ]);
  const specialOperationType = generateOptionFromArray(['上架费', '装箱', '其他']);
  const expressDelivery = generateOptionFromArray(['DPD', 'DHL', 'GLS', 'UPS']);
  const directDelivery = generateOptionFromArray(['DTM2', 'HAJ1', '90451', 'WRO5']);
  const allDelivery = generateOptionFromArray(['快递', '直送', '卡派', '其他']);

  const prop = defineProps<Props>();
  let counter = 0;
  let inboundFeeList = reactive([]);
  let outboundFeeList = reactive([]);
  let operateFeeList = reactive([]);
  let specialOperateFeeList = reactive([]);
  let deliveryFeeList = reactive([]);
  let consumablesList = reactive([]);
  let inboundTotal = $ref('');
  let outboundTotal = $ref('');
  let deliveryTotal = $ref('');
  let operateTotal = $ref('');
  let specialOperateTotal = $ref('');
  let consumablesTotal = $ref('');
  let defaultList = {
    type: '',
    price: '',
    amount: '',
    total: '',
    note: '',
  };
  let defaultDeliveryList = {
    method: '',
    type: '',
    price: '',
    amount: '',
    total: '',
    note: '',
  };
  let currentInfo = $ref([]);

  onMounted(async () => {
    loading = true;
    await reload();
    loading = false;
  });
  function createDefaultList() {
    const obj = deepClone(defaultList);
    obj.key = counter++;
    return obj;
  }

  async function reload() {
    currentInfo = (await getSettlement()).find((it) => it.ticketId === prop.currentData.ticketId);
    if (currentInfo) {
      inboundFeeList = assign(inboundFeeList, currentInfo?.inbound);
      outboundFeeList = assign(outboundFeeList, currentInfo?.outbound);
      operateFeeList = assign(operateFeeList, currentInfo?.operate);
      specialOperateFeeList = assign(specialOperateFeeList, currentInfo?.specialOperate);
      deliveryFeeList = assign(deliveryFeeList, currentInfo?.delivery);
      consumablesList = assign(consumablesList, currentInfo?.consumables);
    }
  }

  function createDefaultDeliveryList() {
    const obj = deepClone(defaultDeliveryList);
    obj.key = counter++;
    return obj;
  }

  function deepClone(obj) {
    let newObj = {};
    for (const key in obj) {
      newObj[key] = obj[key];
    }
    return newObj;
  }

  watch(
    [
      inboundFeeList,
      outboundFeeList,
      operateFeeList,
      specialOperateFeeList,
      deliveryFeeList,
      consumablesList,
    ],
    ([inbound, outbound, operate, specialOperate, delivery, consumables]) => {
      //
      inbound.forEach((it) => {
        it.total = it.price * it.amount;
      });
      const emptyInbound = inbound.filter(
        (it) => it.type === '' && it.price === '' && it.amount === ''
      ).length;
      inboundTotal = safeSumBy(inbound, 'total');
      if (emptyInbound === 0) {
        inbound.push(createDefaultList());
        inboundFeeList = inbound;
      } else {
        inboundFeeList = inbound;
      }
      //
      outbound.forEach((it) => {
        it.total = it.price * it.amount;
      });
      outboundTotal = safeSumBy(outbound, 'total');
      const emptyOutbound = outbound.filter(
        (it) => it.type === '' && it.price === '' && it.amount === ''
      ).length;
      if (emptyOutbound === 0) {
        outbound.push(createDefaultList());
        outboundFeeList = outbound;
      } else {
        outboundFeeList = outbound;
      }
      //
      operate.forEach((it) => {
        it.total = it.price * it.amount;
      });
      operateTotal = safeSumBy(operate, 'total');
      const emptyOperate = operate.filter(
        (it) => it.type === '' && it.price === '' && it.amount === ''
      ).length;
      if (emptyOperate === 0) {
        operate.push(createDefaultList());
        operateFeeList = operate;
      } else {
        operateFeeList = operate;
      }
      //
      specialOperate.forEach((it) => {
        it.total = it.price * it.amount;
      });
      specialOperateTotal = safeSumBy(specialOperate, 'total');
      const emptySpecialOperate = specialOperate.filter(
        (it) => it.type === '' && it.price === '' && it.amount === ''
      ).length;
      if (emptySpecialOperate === 0) {
        specialOperate.push(createDefaultList());
        specialOperateFeeList = specialOperate;
      } else {
        specialOperateFeeList = specialOperate;
      }
      //
      delivery.forEach((it) => {
        it.total = it.price * it.amount;
      });
      deliveryTotal = safeSumBy(delivery, 'total');
      const emptyExpress = delivery.filter(
        (it) => it.type === '' && it.price === '' && it.amount === ''
      ).length;
      if (emptyExpress === 0) {
        delivery.push(createDefaultDeliveryList());
        deliveryFeeList = delivery;
      } else {
        deliveryFeeList = delivery;
      }
      //
      consumables.forEach((it) => {
        it.total = it.price * it.amount;
      });
      consumablesTotal = safeSumBy(consumables, 'total');
      const emptyConsumables = consumables.filter(
        (it) => it.type === '' && it.price === '' && it.amount === ''
      ).length;
      if (emptyConsumables === 0) {
        consumables.push(createDefaultList());
        consumablesList = consumables;
      } else {
        consumablesList = consumables;
      }
    },
    {
      deep: true,
      immediate: true,
    }
  );

  const emit = defineEmits(['saved']);

  async function handleSubmit() {
    loading = true;
    inboundFeeList = inboundFeeList.splice(0, inboundFeeList.length - 1);
    outboundFeeList = outboundFeeList.splice(0, outboundFeeList.length - 1);
    operateFeeList = operateFeeList.splice(0, operateFeeList.length - 1);
    specialOperateFeeList = specialOperateFeeList.splice(0, specialOperateFeeList.length - 1);
    deliveryFeeList = deliveryFeeList.splice(0, deliveryFeeList.length - 1);
    consumablesList = consumablesList.splice(0, consumablesList.length - 1);

    const res = {
      customerId: prop?.currentData?.customerId ?? '',
      ticketId: prop?.currentData?.ticketId ?? '',
      containerId: prop?.currentData?.containerId ?? '',
      inboundTotal: inboundTotal,
      inbound: inboundFeeList,
      outboundTotal: outboundTotal,
      outbound: outboundFeeList,
      operateTotal: operateTotal,
      operate: operateFeeList,
      specialOperateTotal: specialOperateTotal,
      specialOperate: specialOperateFeeList,
      deliveryTotal: deliveryTotal,
      delivery: deliveryFeeList,
      consumablesTotal: consumablesTotal,
      consumables: consumablesList,
      totalPrice:
        inboundTotal +
        outboundTotal +
        operateTotal +
        specialOperateTotal +
        deliveryTotal +
        consumablesTotal,
    };
    const notifyDetail = prop.currentData;
    notifyDetail.finalStatus = '已结算';

    await safeScope(async () => {
      if (currentInfo) {
        res.updateTimestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
        await updateSettlement(currentInfo.id, res);
      } else {
        res.createTimestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
        await addSettlement(res);
        await NotifyDetailManager.edit(notifyDetail, notifyDetail.id);
      }
      emit('saved');
    });
    loading = false;
  }
</script>

<style lang="less" scoped>
  .textStyle {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
