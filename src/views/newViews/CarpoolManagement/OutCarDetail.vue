<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
    </loading-frame>
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { FormFields, safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { OutWarehouseManager } from '@/api/dataLayer/modules/OutWarehouseCar/OutWarehouseModel';

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();
  const schemas: FormFields = [
    {
      label: '渠道',
      field: 'channel',
    },
    {
      label: '约车类型',
      field: 'carType',
    },
    {
      label: '客户编号',
      field: 'customerId',
    },
    {
      label: '订单号',
      field: 'orderId',
    },
    {
      label: '托数(XP/FP)',
      field: 'trayNumber',
    },
    {
      label: '箱数Kartons',
      field: 'boxNumber',
    },
    {
      label: '可堆叠',
      field: 'stackable',
    },
    {
      label: '是否需要卸货设备',
      field: 'needEquipment',
    },
    {
      label: '提货地址',
      field: 'pickingAddress',
    },
    {
      label: '送货地址',
      field: 'sendingAddress',
    },
    {
      label: '取货日期+时点',
      field: 'pickingDate',
    },
    {
      label: '送货日期+时点',
      field: 'sendingDate',
    },
    {
      label: '物流平台订单号',
      field: 'platformOrderId',
    },
    // {
    //   label: '运营对外报价',
    //   field: 'offerPrice',
    // },
    {
      label: 'POD',
      field: 'POD',
    },
    {
      label: 'cbm/尺寸/重量',
      field: 'size',
    },
    {
      label: '需求',
      field: 'demand',
    },
    {
      label: '询价需求',
      field: 'priceDemand',
    },
    {
      label: '是否有送仓文件',
      field: 'warehouseDeliveryFile',
    },
    {
      label: '物流公司',
      field: 'logisticsCompany',
    },
    // {
    //   label: '成本底价',
    //   field: 'costPrice',
    // },
    // {
    //   label: '物流建议报价',
    //   field: 'logisticsPrice',
    // },
    {
      label: '备注',
      field: 'note',
    },
  ].map((it) => {
    it.required = false;
    return it;
  });

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    console.log(prop.model, 'model');
    loading = true;
    await safeScope(async () => {
      if (prop?.model?.id) {
        await OutWarehouseManager.editInternal(values, prop.model.id);
      } else {
        await OutWarehouseManager.addInternal(values);
      }
      emit('saved');
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
