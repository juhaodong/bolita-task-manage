import { FormSchema } from '@/components/Form';

import dayjs from 'dayjs';
import { generateOptionFromArray } from '@/store/utils/utils';
import { notifyType } from '@/api/dataLayer/modules/notify/notify-api';

export const searchField: FormSchema[] = [
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
];
