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
  import {
    channelTypeList,
    updateExternalVehicle,
    vehicleTypeList,
  } from '@/api/newDataLayer/CarManage/ExternalVehicle';
  import { NDatePicker } from 'naive-ui';
  import dayjs from 'dayjs';

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();
  const schemas: FormFields = [
    {
      label: '客户编号',
      field: 'customerName',
      disableCondition() {
        return true;
      },
    },
    {
      label: '日期',
      field: 'orderDate',
      component: NDatePicker,
      componentProps: {
        type: 'date',
        clearable: true,
      },
      disableCondition() {
        return true;
      },
    },
    {
      label: '渠道',
      field: 'channelType',
      component: 'NSelect',
      componentProps: {
        options: channelTypeList,
      },
    },
    {
      label: '约车类型',
      field: 'vehicleType',
      component: 'NSelect',
      componentProps: {
        options: vehicleTypeList,
      },
    },
    {
      label: '订单号',
      field: 'orderNumber',
    },
    {
      label: '托数(XP/FP)',
      field: 'trayCount',
    },
    {
      label: '箱数Kartons',
      field: 'boxCount',
    },
    {
      label: '可堆叠',
      field: 'stackable',
    },
    {
      label: '是否需要卸货设备',
      field: 'unloadingEquipmentRequired',
    },
    {
      label: '提货地址',
      field: 'pickupAddress',
      componentProps: {
        type: 'textarea',
      },
    },
    {
      label: '送货地址',
      field: 'deliveryAddress',
      componentProps: {
        type: 'textarea',
      },
    },
    {
      label: '取货日期+时点',
      field: 'pickupDate',
      component: 'NDatePicker',
      componentProps: {
        type: 'datetime',
        clearable: true,
        timePickerProps: {
          minutes: [0, 15, 30, 45],
          seconds: [0],
        },
      },
    },
    {
      label: '送货日期+时点',
      field: 'deliveryDate',
      component: 'NDatePicker',
      componentProps: {
        type: 'datetime',
        clearable: true,
        timePickerProps: {
          minutes: [0, 15, 30, 45],
          seconds: [0],
        },
      },
    },
    {
      label: '物流平台订单号',
      field: 'logisticsOrderNumber',
    },
    {
      label: '运营对外报价',
      field: 'publicQuotation',
    },
    {
      label: 'cbm/尺寸/重量',
      field: 'dimensions',
    },
    {
      label: '需求',
      field: 'requirements',
    },
    {
      label: '询价需求',
      field: 'inquiryRequirements',
    },
    {
      label: '是否有送仓文件',
      field: 'hasWarehouseDocuments',
    },
    {
      label: '物流公司',
      field: 'logisticsCompany',
    },
    {
      label: '成本底价',
      field: 'baseCost',
    },
    {
      label: '物流建议报价',
      field: 'suggestedQuotation',
    },
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
    const currentObj = Object.assign({}, prop.model, values);
    await safeScope(async () => {
      currentObj.pickupDate = dayjs(currentObj.pickupDate).format('YYYY-MM-DD HH:mm:ss');
      currentObj.deliveryDate = dayjs(currentObj.pickupDate).format('YYYY-MM-DD HH:mm:ss');
      await updateExternalVehicle(currentObj);
      emit('saved');
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
