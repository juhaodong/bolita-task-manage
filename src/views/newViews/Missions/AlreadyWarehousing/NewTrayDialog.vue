<template>
  <div class="mt-8">
    <div v-if="!loading">
      <n-card :bordered="false" class="mt-4" embedded title="💴 托盘">
        <div>
          <n-grid :cols="4" x-gap="12">
            <n-gi class="textStyle"> FP </n-gi>
            <n-gi class="textStyle"> XP </n-gi>
            <n-gi class="textStyle"> KI </n-gi>
            <n-gi class="textStyle"> KT </n-gi>
          </n-grid>
          <n-grid :cols="4" x-gap="12">
            <n-gi> <n-input v-model:value="FPAmount" placeholder="数量" /> </n-gi>
            <n-gi> <n-input v-model:value="XPAmount" placeholder="数量" /> </n-gi>
            <n-gi> <n-input v-model:value="KIAmount" placeholder="数量" /> </n-gi>
            <n-gi> <n-input v-model:value="KTAmount" placeholder="数量" /> </n-gi>
          </n-grid>
        </div>
        <div class="mt-8">
          <n-grid :cols="3" x-gap="12">
            <n-gi class="textStyle"> 类别 </n-gi>
            <n-gi class="textStyle"> 数量 </n-gi>
            <n-gi class="textStyle"> 规格 </n-gi>
          </n-grid>

          <div v-for="(a, index) in trayList" :key="a.key" class="d-flex align-center mb-1">
            <div style="display: flex">
              <n-grid :cols="3" x-gap="12">
                <n-gi>
                  <n-select v-model:value="a.trayType" :options="trayType" placeholder="类别" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="a.amount" placeholder="数量" />
                </n-gi>
                <n-gi>
                  <n-input v-model:value="a.size" placeholder="规格" />
                </n-gi>
              </n-grid>
              <n-icon class="mt-1" size="24px" @click="trayList.splice(index, 1)">
                <Delete16Filled />
              </n-icon>
            </div>
          </div>
        </div>
        <div style="display: flex">
          <div> FP: {{ totalFP }} </div>
          <div class="ml-4"> XP: {{ totalXP }} </div>
          <div class="ml-4"> KI: {{ totalKI }} </div>
          <div class="ml-4"> KT: {{ totalKT }} </div>
        </div>
      </n-card>
    </div>
    <n-space style="float: right">
      <n-button :disabled="saveStatus" secondary type="warning" @click="handleSubmit"
        >保存</n-button
      >
    </n-space>
  </div>
</template>
<script lang="ts" setup>
  import { computed, onMounted, reactive, watch } from 'vue';
  import { $ref } from 'vue/macros';
  import { generateOptionFromArray, safeSumBy } from '@/store/utils/utils';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import Delete16Filled from '@vicons/fluent/es/Delete16Filled';
  import { assign } from 'lodash';
  import { addOrUpdateTaskTrayItem } from '@/api/newDataLayer/TrayItem/TrayItem';
  import { addOrUpdateTask } from '@/api/newDataLayer/TaskList/TaskList';

  interface Props {
    currentData?: any[];
  }
  let loading = $ref(false);

  const trayType = generateOptionFromArray(['FP', 'XP', 'KI', 'KT']);

  const prop = defineProps<Props>();
  let counter = 0;
  let trayList = reactive([]);
  let FPAmount = $ref(0);
  let XPAmount = $ref(0);
  let KIAmount = $ref(0);
  let KTAmount = $ref(0);
  let totalFP = $ref(null);
  let totalXP = $ref(null);
  let totalKI = $ref(null);
  let totalKT = $ref(null);
  let defaultList = {
    trayType: '',
    amount: '',
    size: '',
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
    console.log(prop.currentData, 'currentData');
    const currentInfo = prop.currentData.trayItems;
    if (currentInfo) {
      trayList = assign(trayList, currentInfo);
    }
  }

  const saveStatus = computed(() => {
    return (
      parseFloat(FPAmount) !== totalFP ||
      parseFloat(XPAmount) !== totalXP ||
      parseFloat(KIAmount) !== totalKI ||
      parseFloat(KTAmount) !== totalKT
    );
  });

  function deepClone(obj) {
    let newObj = {};
    for (const key in obj) {
      newObj[key] = obj[key];
    }
    return newObj;
  }

  watch(
    [trayList],
    ([tray]) => {
      //
      const emptyInbound = tray.filter(
        (it) => it.trayType === '' && it.amount === '' && it.size === ''
      ).length;
      if (emptyInbound === 0) {
        tray.push(createDefaultList());
        trayList = tray;
      } else {
        trayList = tray;
      }
      totalFP = safeSumBy(
        trayList.filter((a) => a.trayType === 'FP'),
        'amount'
      );
      totalXP = safeSumBy(
        trayList.filter((a) => a.trayType === 'XP'),
        'amount'
      );
      totalKI = safeSumBy(
        trayList.filter((a) => a.trayType === 'KI'),
        'amount'
      );
      totalKT = safeSumBy(
        trayList.filter((a) => a.trayType === 'KT'),
        'amount'
      );
    },
    {
      deep: true,
      immediate: true,
    }
  );

  const emit = defineEmits(['save']);

  async function handleSubmit() {
    loading = true;
    await safeScope(async () => {
      const res = prop.currentData;
      let trayType = '';
      if (parseFloat(totalFP) > 0) {
        trayType = trayType + 'FP/';
      }
      if (parseFloat(totalKI) > 0) {
        trayType = trayType + 'KI/';
      }
      if (parseFloat(totalXP) > 0) {
        trayType = trayType + 'XP/';
      }
      if (parseFloat(totalKT) > 0) {
        trayType = trayType + 'XP/';
      }
      res.trayType = trayType;
      res.customerId = res.customer.id;
      res.inventoryId = res.inventory.id;
      await addOrUpdateTask(res);
      const currentList = trayList.filter((it) => it.amount);
      let quest = [];
      for (const item of currentList) {
        quest.push(
          addOrUpdateTaskTrayItem({
            ...item,
            bolitaTaskId: prop.currentData.id,
          })
        );
      }
      await Promise.all(quest);
      emit('save');
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
