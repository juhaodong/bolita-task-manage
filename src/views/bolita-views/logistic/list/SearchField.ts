import { FormSchema } from '@/components/Form';
import { salesNameList } from '@/api/sales';
import dayjs from 'dayjs';
import { deliveryMethods } from '@/api/dataLayer/modules/deliveryMethod';
import { generateOptionFromArray } from '@/store/utils/utils';
import { notifyStatusList, notifyType } from '@/api/dataLayer/modules/notify/notify-api';
import { warehouseList } from '@/api/warehouse';

export const searchField: FormSchema[] = [
  {
    field: 'salesName',
    component: 'NSelect',
    label: '负责人',
    componentProps: {
      placeholder: '请选择负责人',
      options: salesNameList.map((it) => {
        return {
          value: it,
          label: it,
        };
      }),
      onUpdateValue: (e: any) => {
        console.log(e);
      },
    },
  },
  {
    field: 'planArriveDate',
    component: 'NDatePicker',
    label: '预约时间',
    defaultValue: dayjs().valueOf(),
    componentProps: {
      type: 'date',
      clearable: true,
      onUpdateValue: (e: any) => {
        console.log(e);
      },
    },
  },
  {
    field: 'deliveryMethod',
    component: 'NSelect',
    label: '物流渠道',
    componentProps: {
      placeholder: '请选择物流渠道',
      options: deliveryMethods.map((it) => {
        return {
          value: it,
          label: it,
        };
      }),
      onUpdateValue: (e: any) => {
        console.log(e);
      },
    },
  },
  {
    field: 'arriveMedia',
    component: 'NSelect',
    label: '到货类型',
    componentProps: {
      placeholder: '请选择到货类型',
      options: generateOptionFromArray(notifyType),
      onUpdateValue: (e: any) => {
        console.log(e);
      },
    },
  },

  {
    field: 'customerId',
    component: 'NInput',
    label: '客户代码',
    componentProps: {
      placeholder: '请输入客户代码',
    },
  },
  {
    field: 'arriveWarehouseName',
    component: 'NSelect',
    label: '到货仓库',
    componentProps: {
      placeholder: '请选择到货仓库',
      options: warehouseList.map((it) => {
        return {
          value: it,
          label: it,
        };
      }),
      onUpdateValue: (e: any) => {
        console.log(e);
      },
    },
  },
  {
    field: 'status',
    component: 'NSelect',
    label: '状态',
    componentProps: {
      placeholder: '状态',
      options: notifyStatusList.map((it) => {
        return {
          value: it,
          label: it,
        };
      }),
      onUpdateValue: (e: any) => {
        console.log(e);
      },
    },
  },
];
