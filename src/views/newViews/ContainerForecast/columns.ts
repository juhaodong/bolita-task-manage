import { DataTableColumns } from 'naive-ui';
import {
  selectedIdColumn,
  statusColumnEasy,
  timeColumn,
} from '@/views/bolita-views/composable/useableColumns';
import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export const columns: DataTableColumns<any> = [
  timeColumn('planArriveDateTime', '预计入库日期'),
  {
    title: '预计时间',
    key: 'inHouseTime',
  },
  selectedIdColumn('柜号', '/missions/missionDetail', 'containerNo'),
  // {
  //   title: '柜号',
  //   key: 'containerNo',
  // },
  {
    title: '客户ID',
    key: 'customerName',
  },
  {
    title: '仓库',
    key: 'warehouseId',
  },
  {
    title: '数量',
    key: 'arrivedCount',
  },
  statusColumnEasy({
    title: '状态',
    key: 'inStatus',
  }),
  {
    title: '操作人',
    key: 'unloadPerson',
  },
  {
    title: '业务员',
    key: 'salesName',
  },
  {
    title: '备注',
    key: 'note',
  },
  statusColumnEasy({
    title: '结算状态',
    key: 'containerFinalStatus',
  }),
];

export const filters: FormField[] = [
  {
    label: '入库ID',
    field: 'id',
  },
  {
    label: '柜号',
    field: 'containerNo',
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

export const reservationTimeList = ['9:00', '11:00', '13:00', '15:00'];
