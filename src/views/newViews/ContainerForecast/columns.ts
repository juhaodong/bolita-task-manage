import { DataTableColumns } from 'naive-ui';
import {
  selectedIdColumn,
  statusColumnEasy,
  statusColumnSelect,
  timeColumn,
} from '@/views/bolita-views/composable/useableColumns';
import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { generateOptionFromArray, generateOptionFromTimeArray } from '@/store/utils/utils';
import { notifyStatusList } from '@/api/newDataLayer/Notify/Notify';
import { timeArrays } from '@/api/newDataLayer/Common/Common';
import {
  allInStatusNotifyList,
  asyncCustomerByFilter,
  asyncStorageByFilter,
} from '@/api/dataLayer/common/common';

export const columns: DataTableColumns<any> = [
  timeColumn('planArriveDateTime', '预计入库日期'),
  {
    title: '预计时间',
    key: 'inHouseTime',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromTimeArray(timeArrays),
    },
  },
  selectedIdColumn('柜号', '/missions/missionDetail', 'containerNo'),
  asyncCustomerByFilter(),
  asyncStorageByFilter(),
  {
    title: '数量',
    key: 'arrivedCount',
  },
  statusColumnSelect({
    title: '状态',
    key: 'inStatus',
    list: generateOptionFromArray(allInStatusNotifyList),
  }),
  {
    title: '操作人',
    key: 'unloadPerson',
  },
  {
    title: '用户名',
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
    field: 'customer.customerName',
  },
  {
    label: '用户名',
    field: 'salesName',
  },
  {
    label: '仓库',
    field: 'inventory.id',
  },
  {
    label: '状态',
    field: 'inStatus',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(notifyStatusList),
    },
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
