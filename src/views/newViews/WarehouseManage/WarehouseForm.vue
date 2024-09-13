<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <normal-form
        v-if="step === 1"
        :default-value-model="model"
        :form-fields="schemas"
        @submit="handleSubmit"
      />
      <div v-else>
        <div v-for="(a, index) in inventoryInfoList" :key="a.key" class="d-flex align-center mb-1">
          <div style="display: flex">
            <n-grid :cols="3" x-gap="12">
              <n-gi>
                <n-select
                  v-model:value="a.useTimeSpan"
                  :options="generateOptionFromTimeArray(timeArrays)"
                  placeholder="时段"
                />
              </n-gi>
              <n-gi>
                <n-input v-model:value="a.useAmount" placeholder="仓位" />
              </n-gi>
            </n-grid>
            <n-icon class="mt-1" size="24px" @click="inventoryInfoList.splice(index, 1)">
              <Delete16Filled />
            </n-icon>
          </div>
        </div>
        <n-button @click="saved">保存</n-button>
      </div>
    </loading-frame>
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { FormFields, safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { generateOptionFromTimeArray } from '@/store/utils/utils';
  import { timeArrays } from '@/api/newDataLayer/Common/Common';
  import { $ref } from 'vue/macros';
  import { onMounted, reactive, watch } from 'vue';
  import Delete16Filled from '@vicons/fluent/es/Delete16Filled';
  import { addOrUpdateInventory } from '@/api/newDataLayer/Warehouse/Warehouse';
  import { assign } from 'lodash';

  interface Props {
    model?: any;
  }

  let step = $ref(1);

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();

  let defaultList = {
    useTimeSpan: '',
    useAmount: '',
  };

  let counter = 0;
  let inventoryInfoList = reactive([]);
  watch(
    [inventoryInfoList],
    ([timeInfo]) => {
      const emptyInfo = timeInfo.filter(
        (it) => it.useTimeSpan === '' && it.useAmount === ''
      ).length;
      if (emptyInfo === 0) {
        timeInfo.push(createDefaultList());
        inventoryInfoList = timeInfo;
      } else {
        inventoryInfoList = timeInfo;
      }
    },
    {
      deep: true,
      immediate: true,
    }
  );

  function createDefaultList() {
    const obj = deepClone(defaultList);
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
  const schemas: FormFields = [
    {
      label: 'id',
      field: 'id',
      disableCondition: () => {
        return prop.model?.id;
      },
      displayCondition: () => {
        return prop.model?.id;
      },
    },
    {
      label: '仓库ID',
      field: 'name',
    },
    {
      label: '公司名称',
      field: 'companyName',
    },
    {
      label: '国家',
      field: 'country',
      defaultValue: '',
      required: false,
    },
    {
      label: '地址',
      field: 'address',
      defaultValue: '',
      required: false,
    },
    {
      label: '面积',
      field: 'area',
      defaultValue: '',
      required: false,
    },
  ];

  const emit = defineEmits(['saved']);
  let currentInfo = $ref(null);

  onMounted(() => {
    if (prop.model) {
      const allUseAmount = prop.model.useAmount.split(',');
      const allUseTimeSpan = prop.model.useTimeSpan;
      const res = allUseTimeSpan.map((item, index) => ({
        useTimeSpan: item,
        useAmount: allUseAmount[index],
      }));
      inventoryInfoList = assign(inventoryInfoList, res);
    }
  });

  async function saved() {
    loading = true;
    inventoryInfoList = inventoryInfoList.filter((it) => it.useTimeSpan && it.useAmount);
    currentInfo.useTimeSpan = inventoryInfoList.map((it) => it.useTimeSpan).join(',');
    currentInfo.useAmount = inventoryInfoList.map((it) => it.useAmount).join(',');
    await safeScope(async () => {
      await addOrUpdateInventory(currentInfo);
      emit('saved');
    });
    loading = false;
  }

  async function handleSubmit(values: any) {
    currentInfo = values;
    step = 2;
  }
</script>

<style lang="less" scoped></style>
