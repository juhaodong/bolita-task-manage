import { DataTableColumns, NImage, NSpace } from 'naive-ui';
import { statusColumnEasy, timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { h } from 'vue';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import {
  asyncCustomerFormField,
  deliveryMethodSelection,
  getFilesUploadFormField,
} from '@/api/dataLayer/fieldDefination/common';
import { FormFields, initModel } from '@/api/dataLayer/common/GeneralModel';
import { asyncInventoryFormField } from '@/api/dataLayer/modules/user/user';
import { stayDaysColumn } from '@/views/newViews/NotifyDetail/columns';
import dayjs from 'dayjs';

export const columns: DataTableColumns<ToBeClaimedModel> = [
  {
    type: 'selection',
    disabled(row: any) {
      return row?.claimStatus != ClaimStatus.Waiting;
    },
  },
  timeColumn(),
  {
    title: '物流渠道',
    key: 'deliveryMethod',
    width: 75,
  },
  {
    title: '物流单号',
    key: 'deliveryId',
    width: 75,
  },
  {
    title: '收货仓库',
    key: 'warehouseId',
  },
  {
    title: '外箱标识',
    key: 'containerLogo',
  },
  {
    title: '图片',
    key: 'img',
    render(record) {
      return h(NSpace, [
        ...(record?.['img']?.map((it) => {
          return h(NImage, {
            src: it,
            width: 36,
            height: 36,
          });
        }) ?? []),
      ]);
    },
  },
  statusColumnEasy({
    title: '认领状态',
    key: 'claimStatus',
  }),
  {
    title: '认领客户ID',
    key: 'customerId',
  },
  stayDaysColumn,
  timeColumn('discardTime', '废弃时间点'),
  {
    title: '处理结果',
    key: 'result',
  },
  {
    title: '库位',
    key: 'storeAddress',
  },
];

export type ToBeClaimedModel = {
  warehousingTime: string;
  deliveryMethod: string;
  deliveryId: number;
  receivingWarehouse: string;
  containerMark: string;
  img: string[];
  claimStatus: string;
  claimCustomId: number;
  storageDays: number;
  discardTime: string;
  storeAddress: string;
};

export enum ClaimStatus {
  Waiting = '待认领',
  Claimed = '已认领',
  Destroyed = '废弃',
}

const path = 'claimedGoods';

export const ClaimManager = initModel({
  collectionName: path,
  init(value): any {
    value.arriveTime = dayjs().valueOf();
    value.claimStatus = ClaimStatus.Waiting;
    return value;
  },
});

export const filters: FormField[] = [
  ...deliveryMethodSelection,
  {
    label: '认领客户ID',
    field: 'claimCustomId',
  },
  {
    label: '外箱标识',
    field: 'containerLogo',
  },
  {
    field: 'NotifyStartDateTime',
    component: 'NDatePicker',
    label: '入库开始时间',
    componentProps: {
      type: 'date',
      clearable: true,
    },
  },
  {
    field: 'NotifyEndDateTime',
    component: 'NDatePicker',
    label: '入库结束时间',
    componentProps: {
      type: 'date',
      clearable: true,
    },
  },
  {
    label: '认领状态',
    field: 'claimStatus',
  },
];

export const schemas: FormFields = [
  {
    field: 'deliveryId',
    label: '物流单号',
  },
  asyncInventoryFormField(),
  {
    field: 'containerMark',
    label: '外箱标识',
    required: false,
  },
  getFilesUploadFormField('img', false),
  {
    label: '处理结果',
    field: 'result',
  },
  {
    field: 'storeAddress',
    label: '库位',
    required: false,
  },
];
export const claimSchemas: FormFields = [asyncCustomerFormField()];
