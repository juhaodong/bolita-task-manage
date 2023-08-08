import { DataTableColumns } from 'naive-ui';
import {
  colorColumn,
  formatColumn,
  joinDisplayColumn,
} from '@/views/bolita-views/composable/useableColumns';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { generateOptionFromArray, safeParseInt } from '@/store/utils/utils';
import { InBoundStatus, notifyType } from '@/api/dataLayer/modules/notify/notify-api';
import dayjs from 'dayjs';

export const stayDaysColumn = formatColumn('arriveTime', '存放天数', (record) => {
  const time = record['arriveTime'];
  if (!time) {
    return '等待入库中';
  } else {
    return dayjs(time).toNow(true);
  }
});
export const columns: DataTableColumns<NotifyDetailInfoModel> = [
  {
    title: '入库ID',
    key: 'notifyId',
  },
  {
    title: '客户ID',
    key: 'customerId',
  },
  {
    title: '票号',
    key: 'ticketId',
  },
  {
    title: '箱号',
    key: 'containerId',
  },
  {
    title: '产品SKU',
    key: 'productSKU',
  },
  formatColumn(
    'trayNum',
    '托数',
    (record) => record['instorageTrayNum'] + '/' + safeParseInt(record['trayNum'])
  ),
  formatColumn(
    'containerNum',
    '箱数',
    (record) => record['instorageContainerNum'] + '/' + safeParseInt(record['containerNum'])
  ),
  joinDisplayColumn('containerStandards', '外箱规格', ['length', 'width', 'height'], '*'),
  {
    title: '重量kg',
    key: 'weightKg',
  },
  {
    title: '体积',
    key: 'volume',
  },
  colorColumn('inStatus', '入库状态', (record) => {
    const sumCount = safeParseInt(record.trayNum) + safeParseInt(record.containerNum);
    const arrivedCount =
      safeParseInt(record.arrivedTrayNum) + safeParseInt(record.arrivedContainerNum);
    if (arrivedCount == 0) {
      return InBoundStatus.Wait;
    }
    return sumCount == arrivedCount ? InBoundStatus.All : InBoundStatus.Partial;
  }),
  {
    title: '出库状态',
    key: 'outStatus',
  },
  {
    title: '运单号',
    key: 'waybillId',
  },
  {
    title: '目的国',
    key: 'targetCountry',
  },
  {
    title: 'FBACode',
    key: 'fbaCode',
  },
  {
    title: 'FBA号',
    key: 'FBANo',
  },
  {
    title: 'PO',
    key: 'PO',
  },
  {
    title: '收件地址',
    key: 'deliveryAddress',
  },
  {
    title: '物流方式',
    key: 'deliveryMethod',
  },
  {
    title: '库位',
    key: 'storeAddress',
  },
  stayDaysColumn,
  {
    title: '货物名称',
    key: 'productName',
  },
  {
    title: '包装',
    key: 'package',
  },
];

export type NotifyDetailInfoModel = {
  id: number;
  customerId: number;
  ticketId: number;
  containerId: number;
  productSKU: string;
  trayNum: number;
  containerNum: number;
  length: string;
  width: string;
  height: string;
  containerStandards: string;
  weightKg: string;
  volume: string;
  inboundStatus: string;
  outStatus: string;
  waybillId: number;
  targetCountry: string;
  fbaCode: string;
  shippingAddress: string;
  logisticsMethods: string;
  storeAddress: string;
  storageDays: string;
  productName: string;
  package: string;
};

export const filters: FormField[] = [
  {
    label: '入库ID',
    field: 'notifyId',
  },
  {
    label: '票号',
    field: 'ticketId',
  },
  {
    label: '仓库',
    field: 'warehouseName',
  },
  {
    label: '入库状态',
    field: 'inStatus',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(Object.values(InBoundStatus)),
    },
  },
  {
    label: '入库类型',
    field: 'notifyType',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(notifyType),
    },
  },
  {
    label: 'FBACode',
    field: 'fbaCode',
  },
  {
    label: '箱号',
    field: 'containerId',
  },
  {
    label: '产品SKU',
    field: 'productSKU',
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
    label: '物流方式',
    field: 'deliveryWay',
  },
];
