<script lang="ts" setup>
  import { NotifyManager } from '@/api/dataLayer/modules/notify/notify-api';
  import { watchEffect } from 'vue';
  import { WarehouseManager } from '@/api/dataLayer/modules/user/user';

  interface Props {
    notifyId: string;
  }

  const props = defineProps<Props>();
  const emit = defineEmits(['close', 'refresh', 'save']);

  let notifyDetail: any | null = $ref(null);
  let warehouseInfo: any | null = $ref(null);

  async function reload() {
    if (props.notifyId != null) {
      notifyDetail = await NotifyManager.getById(props.notifyId);
      warehouseInfo = await WarehouseManager.getById(notifyDetail.warehouseId);
      console.log(warehouseInfo, 'detail');
      emit('refresh');
    }
  }

  watchEffect(async () => {
    await reload();
  });
</script>

<template>
  <div class="mt-8">
    <n-descriptions :columns="2" bordered label-placement="left" v-if="warehouseInfo">
      <n-descriptions-item :span="2" label="ID">{{ warehouseInfo.id }}</n-descriptions-item>

      <n-descriptions-item :span="2" label="地址">{{ warehouseInfo.address }}</n-descriptions-item>
      <n-descriptions-item label="仓库名称"> {{ warehouseInfo.companyName }}</n-descriptions-item>
      <n-descriptions-item label="邮编">{{ warehouseInfo.area }}</n-descriptions-item>
      <n-descriptions-item label="国家">{{ warehouseInfo.country }}</n-descriptions-item>
      <n-descriptions-item label="备注">{{ warehouseInfo.note }}</n-descriptions-item>
    </n-descriptions>
  </div>
</template>

<style lang="less" scoped></style>
