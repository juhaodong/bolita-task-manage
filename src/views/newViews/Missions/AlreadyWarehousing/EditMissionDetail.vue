<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <normal-form :default-value-model="model" :form-fields="allSchemas" @submit="handleSubmit" />
    </loading-frame>
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { generateOptionFromArray } from '@/store/utils/utils';
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
  import dayjs from 'dayjs';

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();
  const normalSchemas = [
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
    {
      label: '客户',
      field: 'customerName',
      required: false,
      disableCondition: () => {
        return prop.model?.id;
      },
      displayCondition: () => {
        return prop.model?.id;
      },
    },
    {
      label: '柜号',
      field: 'containerId',
      disableCondition: () => {
        return prop.model?.id;
      },
      displayCondition: () => {
        return prop.model?.id;
      },
    },
    {
      label: '票号',
      field: 'ticketId',
      disableCondition: () => {
        return prop.model?.id;
      },
      displayCondition: () => {
        return prop.model?.id;
      },
    },
    {
      label: '国家',
      field: 'country',
    },
    {
      label: '预计件数',
      field: 'number',
    },
    {
      label: '预计托数',
      field: 'trayNum',
    },
    {
      label: '实际到达托数',
      field: 'arrivedTrayNum',
    },

    {
      label: '实际到达件数',
      field: 'arrivedContainerNum',
    },
    {
      label: '总实重',
      field: 'weight',
    },
    {
      label: '总体积',
      field: 'volume',
    },
    {
      label: '尺寸',
      field: 'size',
    },
    {
      label: '包装',
      field: 'packing',
    },
    {
      label: '客户备注',
      field: 'normalNote',
    },
  ].map((it) => {
    it.group = '基本信息';
    it.required = false;
    return it;
  });
  const inventorySchemas = [
    {
      label: 'FBA单号',
      field: 'fbaDeliveryCode',
    },
    {
      label: 'po',
      field: 'po',
    },
    {
      label: 'FC',
      field: 'fcAddress',
    },
    {
      label: '送货地址',
      field: 'address',
    },
    {
      label: '邮编',
      field: 'postcode',
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
  ].map((it) => {
    it.group = '仓库信息';
    it.required = false;
    return it;
  });
  const otherSchemas = [
    {
      label: '品名',
      field: 'productName',
    },
    {
      label: 'UN号',
      field: 'unNumber',
    },
    {
      label: '收件人',
      field: 'recipient',
    },
    {
      label: '电话',
      field: 'phone',
    },
    {
      label: '邮箱',
      field: 'email',
    },
    {
      label: '尾板',
      field: 'tailgate',
    },
  ].map((it) => {
    it.group = '大件信息';
    it.required = false;
    return it;
  });

  const allSchemas = [...normalSchemas, ...inventorySchemas, ...otherSchemas];

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
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
    let allItemInfo = allSchemas.filter((x) => x.field);
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
