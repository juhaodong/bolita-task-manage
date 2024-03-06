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
  import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();
  const schemas: FormFields = [
    {
      label: '客户ID',
      field: 'customerName',
    },
    {
      label: '柜号',
      field: 'containerId',
    },
    {
      label: '票号',
      field: 'ticketId',
    },
    {
      label: '国家',
      field: 'country',
    },
    {
      label: '件数',
      field: 'number',
      required: false,
    },
    {
      label: '总实重',
      field: 'weight',
      required: false,
    },
    {
      label: '总体积',
      field: 'volume',
      required: false,
    },
    {
      label: '运单号',
      field: 'deliveryIdIn',
      required: false,
    },
    {
      label: 'FBA/快递单号',
      field: 'FBADeliveryCode',
      required: false,
    },
    {
      label: '出库方式',
      field: 'operation',
      required: false,
    },
    {
      label: 'PO',
      field: 'PO',
      required: false,
    },
    {
      label: 'FC/送货地址',
      field: 'FCAddress',
      required: false,
    },
    {
      label: '换单文件',
      field: 'changeOrderFiles',
      required: false,
    },
    {
      label: '托数',
      field: 'trayNum',
      required: false,
    },
    {
      label: '备注/库位',
      field: 'note/address',
      required: false,
    },
    {
      label: 'Ref',
      field: 'Ref',
      required: false,
    },
    {
      label: '运费报价',
      field: 'freightQuotation',
      required: false,
    },
    {
      label: '结算',
      field: 'settlement',
      required: false,
    },
    {
      label: '分拣标识',
      field: 'sign',
      required: false,
    },
    {
      label: '托数(长*宽*高*数)',
      field: 'totalTrayNum',
      required: false,
    },
    {
      label: '城市',
      field: 'city',
      required: false,
    },
    {
      label: '街道',
      field: 'street',
      required: false,
    },
    {
      label: '门牌号',
      field: 'houseNumber',
      required: false,
    },
    {
      label: '收件人',
      field: 'recipient',
      required: false,
    },
    {
      label: '联系电话',
      field: 'phone',
      required: false,
    },
    {
      label: '是否需要预约',
      field: 'needReservation',
      required: false,
    },
    {
      label: '包装',
      field: 'package',
      required: false,
    },
    {
      label: '品名',
      field: 'productName',
      required: false,
    },
    {
      label: '备注',
      field: 'addressNote',
      required: false,
    },
  ];

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    loading = true;
    values.alreadyChanged = 1;
    console.log(values, 'values');
    await safeScope(async () => {
      if (prop?.model?.id) {
        await NotifyDetailManager.editInternal(values, prop.model.id);
      } else {
        await NotifyDetailManager.addInternal(values);
      }
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
