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
  import { asyncUserCustomer, generateOptionFromArray } from '@/store/utils/utils';
  import {
    allDeliveryMethod,
    allOutboundMethod,
  } from '@/views/newViews/Missions/AlreadyWarehousing/columns';
  import { useUserStore } from '@/store/modules/user';
  import {
    addOrUpdateOutboundForecast,
    getOutboundForecastById,
  } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';
  import { addOrUpdateTaskTimeLine } from '@/api/newDataLayer/TimeLine/TimeLine';
  import { keys } from 'lodash';
  import { addOrUpdateTask } from '@/api/newDataLayer/TaskList/TaskList';

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();
  const schemas: FormFields = [
    {
      label: 'id',
      field: 'id',
      required: false,
      disableCondition: () => {
        return prop.model?.id;
      },
      displayCondition: () => {
        return prop.model?.id;
      },
    },
    asyncUserCustomer(prop.model.customerId),
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
      label: '预计托数',
      field: 'trayNum',
      required: false,
    },
    {
      label: '实际到达托数',
      field: 'arrivedTrayNum',
      required: false,
    },
    {
      label: '预计件数',
      field: 'number',
      required: false,
    },
    {
      label: '实际到达件数',
      field: 'arrivedContainerNum',
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
      field: 'fbaDeliveryCode',
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
      label: 'po',
      field: 'po',
      required: false,
    },
    {
      label: 'FC/送货地址',
      field: 'fcAddress',
      required: false,
    },
    {
      label: '换单文件',
      field: 'changeOrderFiles',
      component: 'NSelect',
      componentProps: {
        options: [
          { label: '是', value: '是' },
          { label: '否', value: '否' },
        ],
      },
    },
    {
      label: '库内操作',
      field: 'operateInStorage',
      component: 'NSelect',
      componentProps: {
        options: [
          { label: '是', value: '是' },
          { label: '否', value: '否' },
        ],
      },
    },
    {
      label: '仓库备注',
      field: 'note',
      required: false,
    },
    {
      label: '库位',
      field: 'warehouseLocation',
      required: false,
    },
    {
      label: '送货备注',
      field: 'transportationNote',
      required: false,
    },
    {
      label: '操作备注',
      field: 'operationNote',
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
      field: 'unNumber',
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
    const waitEdit = prop.model;
    loading = true;
    values.alreadyChanged = 1;
    let userInfo = useUserStore().info;
    if (values.outboundMethod === '存仓' && prop.model?.outboundMethod !== '存仓') {
      values.inStatus = '存仓';
      await addOrUpdateTaskTimeLine({
        useType: 'storage',
        bolitaTaskId: values.id,
        operator: userInfo?.realName,
        detailTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
        note: '转为存仓',
      });
      if (prop.model?.outboundId) {
        let outboundInfo = await getOutboundForecastById(prop.model?.outboundId);
        outboundInfo.inStatus = '异常';
        await addOrUpdateOutboundForecast(outboundInfo);
      }
    } else if (values.outboundMethod !== '存仓' && prop.model?.outboundMethod === '存仓') {
      await addOrUpdateTaskTimeLine({
        useType: 'storage',
        bolitaTaskId: values.id,
        operator: userInfo?.realName,
        detailTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
        note: '存仓转出',
      });
      values.inStatus = '入库待出库';
    }
    if (prop.model?.inStatus === '等待审核' || prop.model?.inStatus === '等待提交') {
      if (values.changeOrderFiles === '否') {
        values.inStatus = '等待审核';
      }
      if (values.changeOrderFiles === '是') {
        values.inStatus = '等待提交';
      }
    }
    const valuesKeys = keys(values);
    let editLabel = [];
    let allItemInfo = schemas.filter((x) => x.field);
    for (const valuesKey of valuesKeys) {
      if (values[valuesKey] !== prop.model[valuesKey]) {
        const res = allItemInfo.find((it) => it.field === valuesKey) ?? '';
        if (res) {
          editLabel.push(res.label + '(' + waitEdit[valuesKey] + '->' + values[valuesKey] + ')');
        }
      }
    }
    await addOrUpdateTaskTimeLine({
      useType: 'normal',
      bolitaTaskId: values.id,
      operator: userInfo?.realName,
      detailTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      note: '修改了 ' + editLabel.join(','),
    });
    await safeScope(async () => {
      await addOrUpdateTask(Object.assign(waitEdit, values));
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
