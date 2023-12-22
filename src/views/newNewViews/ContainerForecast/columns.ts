import { DataTableColumns } from 'naive-ui';
import { idColumn, timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export const columns: DataTableColumns<any> = [
  timeColumn('uploadDate', '日期'),
  idColumn('入库ID', '/notify/detail'),
  {
    title: '柜号',
    key: 'containerNo',
  },
  {
    title: '客户ID',
    key: 'customerName',
  },
  {
    title: '仓库',
    key: 'warehouseId',
  },
  timeColumn('planArriveDateTime', '预约时间'),
  {
    title: '数量',
    key: 'containerNum',
  },
  {
    title: '状态',
    key: 'status',
  },
  {
    title: '出库方式',
    key: 'deliveryMethod',
  },
  {
    title: '操作人',
    key: 'operator',
  },
  {
    title: '业务员',
    key: 'salesName',
  },
  {
    title: '备注',
    key: 'note',
  },
];

export const filters: FormField[] = [
  {
    label: '入库ID',
    field: 'id',
  },
  {
    label: '柜号',
    field: 'customerName',
  },
  {
    label: '客户ID',
    field: 'customerName',
  },
  {
    label: '业务员',
    field: 'salesName',
  },
  {
    label: '仓库',
    field: 'warehouseId',
  },
  {
    label: '状态',
    field: 'status',
  },
];

export enum AllOptions {
  SSH9101 = '9101-SSH',
  GW8802 = '8802-GW',
  ZLQQ8804 = '8804-ZLQQ',
  GBL8805 = '8805-天津GBL',
  KYA8806 = '8806-KYA',
  Normal6301 = '6301',
  OY8401 = '8401-欧亚',
  Normal9401 = '9401',
  Normal9801 = '9801',
  HY9601 = '9601-华宇',
  TSD5401 = '5401-TSD',
  HY = 'HY',
  DSL = '大森林',
  Normal4101 = '4101',
  CMC = 'CMC',
}

export const ContainerForecastManager = initModel({
  collectionName: 'ContainerForecast',
  init(value): any {
    return value;
  },
  idPrefix: 'P',
});
