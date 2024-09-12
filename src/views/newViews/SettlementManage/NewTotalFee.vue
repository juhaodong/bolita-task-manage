<template>
  <div class="mt-8">
    <div>
      <n-grid :cols="6" item-responsive>
        <n-grid-item class="font-bold" span="2">
          客户:{{ currentData?.customer.customerName }}
        </n-grid-item>
        <n-grid-item
          class="font-bold"
          span="2"
          style="display: flex; justify-content: center; align-items: center"
        >
          柜号:{{ currentData?.containerId }}
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
                  <n-select
                    v-model:value="a.settlementType"
                    :options="inboundType"
                    placeholder="settlementType"
                  />
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
                  <n-select
                    v-model:value="b.settlementType"
                    :options="outboundType"
                    placeholder="settlementType"
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
                  <n-select
                    v-model:value="b.settlementType"
                    :options="operateType"
                    placeholder="settlementType"
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
                    v-model:value="b.settlementType"
                    :options="specialOperationType"
                    placeholder="settlementType"
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
                  <n-select v-model:value="b.mode" :options="allDelivery" placeholder="method" />
                </n-gi>
                <n-gi span="2">
                  <n-select
                    v-model:value="b.settlementType"
                    :options="
                      b.method === '快递'
                        ? expressDelivery
                        : b.method === '直送'
                        ? directDelivery
                        : [{ label: '', value: '' }]
                    "
                    placeholder="settlementType"
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
                  <n-input v-model:value="a.settlementType" placeholder="settlementType" />
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
      <n-card v-if="taskSettlementInfo" :bordered="false" class="mt-4" embedded title="📕 附件">
        <n-button type="info" @click="uploadFiles">检查文件</n-button>
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
  import Delete16Filled from '@vicons/fluent/es/Delete16Filled';
  import { assign } from 'lodash';
  import { useUploadDialog } from '@/store/modules/uploadFileState';
  import {
    addOrUpdateSettlement,
    getSettlementByTaskId,
  } from '@/api/newDataLayer/TaskListSettlement/TaskListSettlement';
  import { addOrUpdateSettlementItem } from '@/api/newDataLayer/TaskListSettlementItem/TaskListSettlementItem';

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
    name: '',
    settlementType: '',
    price: '',
    amount: '',
    total: '',
    note: '',
    mode: '',
  };
  let defaultDeliveryList = {
    name: '',
    method: '',
    settlementType: '',
    price: '',
    amount: '',
    total: '',
    note: '',
    mode: '',
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

  let taskSettlementInfo = $ref([]);

  async function reload() {
    taskSettlementInfo = (await getSettlementByTaskId(prop.currentData.id))[0];
    currentInfo = taskSettlementInfo?.settlementItems ?? [];
    console.log(taskSettlementInfo, 'info');
    if (currentInfo) {
      inboundFeeList = assign(
        inboundFeeList,
        currentInfo.filter((it) => it.name === 'inbound')
      );
      outboundFeeList = assign(
        outboundFeeList,
        currentInfo.filter((it) => it.name === 'outbound')
      );
      operateFeeList = assign(
        operateFeeList,
        currentInfo.filter((it) => it.name === 'operate')
      );
      specialOperateFeeList = assign(
        specialOperateFeeList,
        currentInfo.filter((it) => it.name === 'specialOperate')
      );
      deliveryFeeList = assign(
        deliveryFeeList,
        currentInfo.filter((it) => it.name === 'delivery')
      );
      consumablesList = assign(
        consumablesList,
        currentInfo.filter((it) => it.name === 'consumables')
      );
    }
  }

  async function uploadFiles() {
    const upload = useUploadDialog();
    const files = await upload.upload(taskSettlementInfo['problemFiles']);
    if (files.checkPassed) {
      taskSettlementInfo['problemFiles'] = files.files;
      taskSettlementInfo.customerId = taskSettlementInfo.customer.id;
      taskSettlementInfo.bolitaTaskId = prop.currentData.id;
      await addOrUpdateSettlement(taskSettlementInfo);
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
        it.name = 'inbound';
        it.total = it.price * it.amount;
      });
      const emptyInbound = inbound.filter(
        (it) => it.settlementType === '' && it.price === '' && it.amount === ''
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
        it.name = 'outbound';
        it.total = it.price * it.amount;
      });
      outboundTotal = safeSumBy(outbound, 'total');
      const emptyOutbound = outbound.filter(
        (it) => it.settlementType === '' && it.price === '' && it.amount === ''
      ).length;
      if (emptyOutbound === 0) {
        outbound.push(createDefaultList());
        outboundFeeList = outbound;
      } else {
        outboundFeeList = outbound;
      }
      //
      operate.forEach((it) => {
        it.name = 'operate';
        it.total = it.price * it.amount;
      });
      operateTotal = safeSumBy(operate, 'total');
      const emptyOperate = operate.filter(
        (it) => it.settlementType === '' && it.price === '' && it.amount === ''
      ).length;
      if (emptyOperate === 0) {
        operate.push(createDefaultList());
        operateFeeList = operate;
      } else {
        operateFeeList = operate;
      }
      //
      specialOperate.forEach((it) => {
        it.name = 'specialOperate';
        it.total = it.price * it.amount;
      });
      specialOperateTotal = safeSumBy(specialOperate, 'total');
      const emptySpecialOperate = specialOperate.filter(
        (it) => it.settlementType === '' && it.price === '' && it.amount === ''
      ).length;
      if (emptySpecialOperate === 0) {
        specialOperate.push(createDefaultList());
        specialOperateFeeList = specialOperate;
      } else {
        specialOperateFeeList = specialOperate;
      }
      //
      delivery.forEach((it) => {
        it.name = 'delivery';
        it.total = it.price * it.amount;
      });
      deliveryTotal = safeSumBy(delivery, 'total');
      const emptyExpress = delivery.filter(
        (it) => it.settlementType === '' && it.price === '' && it.amount === ''
      ).length;
      if (emptyExpress === 0) {
        delivery.push(createDefaultDeliveryList());
        deliveryFeeList = delivery;
      } else {
        deliveryFeeList = delivery;
      }
      //
      consumables.forEach((it) => {
        it.name = 'consumables';
        it.total = it.price * it.amount;
      });
      consumablesTotal = safeSumBy(consumables, 'total');
      const emptyConsumables = consumables.filter(
        (it) => it.settlementType === '' && it.price === '' && it.amount === ''
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
    let inboundList = inboundFeeList.splice(0, inboundFeeList.length - 1);
    let outboundList = outboundFeeList.splice(0, outboundFeeList.length - 1);
    let operateList = operateFeeList.splice(0, operateFeeList.length - 1);
    let specialOperateList = specialOperateFeeList.splice(0, specialOperateFeeList.length - 1);
    let deliveryList = deliveryFeeList.splice(0, deliveryFeeList.length - 1);
    let allConsumablesList = consumablesList.splice(0, consumablesList.length - 1);
    console.log(inboundFeeList, outboundFeeList, '321');
    const result = {
      status: '已结算',
      ticketId: prop.currentData.ticketId,
      inboundFee: inboundTotal ?? 0,
      outboundFee: outboundTotal ?? 0,
      operateFee: operateTotal ?? 0,
      specialOperateFee: specialOperateTotal ?? 0,
      deliveryFee: deliveryTotal ?? 0,
      consumablesFee: consumablesTotal ?? 0,
      problemFiles: '',
      bolitaTaskId: prop.currentData.id,
      customerId: prop.currentData.customer.id,
    };
    if (taskSettlementInfo) {
      result.id = taskSettlementInfo.id;
    }
    const res = await addOrUpdateSettlement(result);

    let allItemList = [
      ...inboundList,
      ...outboundList,
      ...operateList,
      ...specialOperateList,
      ...deliveryList,
      ...allConsumablesList,
    ];
    allItemList.forEach((it) => {
      it.settlementId = res.data.id;
    });
    console.log(allItemList, 'allItemList');
    let quest = [];
    for (const item of allItemList) {
      quest.push(addOrUpdateSettlementItem(item));
    }
    await Promise.all(quest);
    emit('saved');
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
