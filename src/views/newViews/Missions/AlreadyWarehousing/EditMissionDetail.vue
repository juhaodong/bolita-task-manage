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
  import { generateOptionFromArray } from '@/store/utils/utils';
  import {
    allDeliveryMethod,
    allOutboundMethod,
  } from '@/views/newViews/Missions/AlreadyWarehousing/columns';
  import dayjs from 'dayjs';
  import { useUserStore } from '@/store/modules/user';
  import { updateOutboundForecast } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import { getOutboundForecastById } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();
  const schemas: FormFields = [
    {
      label: '客户ID',
      field: 'customerName',
      required: false,
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
      label: '托数',
      field: 'trayNum',
      required: false,
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
      label: 'FBA单号',
      field: 'FBADeliveryCode',
      required: false,
    },
    {
      label: '出库方式',
      field: 'outboundMethod',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(allOutboundMethod),
      },
    },
    {
      label: '物流渠道',
      field: 'deliveryMethod',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(allDeliveryMethod),
      },
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
      label: '库内操作',
      field: 'operateInStorage',
      required: false,
    },
    {
      label: '托数',
      field: 'trayNum',
      required: false,
    },
    {
      label: '备注/库位',
      field: 'warehouseId',
      required: false,
    },
    {
      label: '分拣标识',
      field: 'sign',
      required: false,
    },
    {
      label: '工业品托数',
      field: 'industrialTrayNum',
      required: false,
    },
    {
      label: '品名',
      field: 'productName',
      required: false,
    },
    {
      label: 'UN号',
      field: 'UNNumber',
      required: false,
    },
    {
      label: '收件人',
      field: 'recipient',
      required: false,
    },
    {
      label: '电话',
      field: 'phone',
      required: false,
    },
    {
      label: '邮箱',
      field: 'email',
      required: false,
    },
    {
      label: '地址1',
      field: 'address1',
      required: false,
    },
    {
      label: '地址2',
      field: 'address2',
      required: false,
    },
    {
      label: '工业品国家',
      field: 'industrialCountry',
      required: false,
    },
    {
      label: '工业品城市',
      field: 'industrialCity',
      required: false,
    },
    {
      label: '是否需要预约',
      field: 'needReserve',
      required: false,
    },
    {
      label: '工业品备注',
      field: 'industrialNote',
      required: false,
    },
  ];

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    console.log(prop.model, 'model');
    loading = true;
    values.alreadyChanged = 1;
    let inStorageTime = prop.model?.storageTime ? prop.model?.storageTime : [];
    if (values.outboundMethod === '存仓' && prop.model?.outboundMethod !== '存仓') {
      values.inStatus = '存仓';
      inStorageTime.push({ storageTime: dayjs().format('YYYY-MM-DD HH:mm:ss') });
      values.storageTime = inStorageTime;
      if (prop.model?.outboundId) {
        let outboundInfo = await getOutboundForecastById(prop.model?.outboundId);
        outboundInfo.inStatus = '异常';
        await updateOutboundForecast(prop.model?.outboundId, outboundInfo);
      }
    } else if (values.outboundMethod !== '存仓' && prop.model?.outboundMethod === '存仓') {
      const lastTimeInfo = inStorageTime.pop();
      if (!lastTimeInfo.outBoundTime) {
        lastTimeInfo.outBoundTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
        lastTimeInfo.totalStorageTime = dayjs(lastTimeInfo.outBoundTime).diff(
          lastTimeInfo.storageTime,
          'hour'
        );
        inStorageTime.push(lastTimeInfo);
      }
      values.inStatus = '入库待出库';
      values.storageTime = inStorageTime;
    }
    if (prop.model?.inStatus === '等待审核' || prop.model?.inStatus === '等待提交') {
      if (values.changeOrderFiles === '否') {
        values.inStatus = '等待审核';
      }
      if (values.changeOrderFiles === '是') {
        values.inStatus = '等待提交';
      }
    }

    const userInfo = useUserStore().info;
    let res = prop.model?.timeLine ? prop.model?.timeLine : [];
    res.unshift({
      operator: userInfo?.realName,
      detailTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      note: '修改了具体信息',
    });
    values.timeLine = res;
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
