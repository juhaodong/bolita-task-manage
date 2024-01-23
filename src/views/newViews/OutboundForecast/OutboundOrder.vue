<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <div id="print">
        <div>
          <div> {{ fbaCode }}-{{ refCode }}</div>
          <div>
            {{ amzId }} <span style="float: right">{{ pickDate }}</span>
          </div>
        </div>
        <n-data-table :bordered="false" :columns="columns" :data="data" />
        <div style="float: right">出库方式: {{ deliveryMethod }}</div>
      </div>
      <div class="mt-10">
        <n-button v-print="'#print'" type="default">打印</n-button>
        <n-button
          :color="fbaCode && refCode && amzId && pickDate ? 'green' : ''"
          style="float: right"
          type="default"
          @click="handleSubmit"
          >确认</n-button
        >
      </div>
    </loading-frame>
  </n-card>
</template>
<script lang="ts" setup>
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { NTag } from 'naive-ui';
  import { h } from 'vue';

  interface Props {
    data?: any;
    deliveryMethod?: any;
    fbaCode?: any;
    refCode?: any;
    pickDate?: any;
    amzId?: any;
  }
  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();

  const columns = [
    {
      title: '客户ID',
      key: 'customerName',
      render(row) {
        return h(
          NTag,
          {
            color: { borderColor: row.customerColor },
          },
          {
            default: () => row.customerName,
          }
        );
      },
    },
    {
      title: '货柜号',
      key: 'containerId',
      render(row) {
        return h(
          NTag,
          {
            color: { borderColor: row.containColor },
          },
          {
            default: () => row.containerId,
          }
        );
      },
    },
    {
      title: '票号',
      key: 'ticketId',
    },
    {
      title: 'FBA号',
      key: 'FBA/DeliveryCode',
    },
    {
      title: '数量',
      key: 'number',
    },
    {
      title: '货物位置',
      key: 'warehouseId',
    },
  ];

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    loading = true;
    await safeScope(async () => {
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
