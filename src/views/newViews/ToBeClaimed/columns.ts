import { DataTableColumns } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';

export const columns: DataTableColumns<ToBeClaimedModel> = [
  timeColumn('warehousingTime', '入库时间'),
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
    key: 'receivingWarehouse',
    width: 100,
  },
  {
    title: '外箱标识',
    key: 'containerLogo',
    width: 100,
  },
  {
    title: '图片',
    key: 'img',
  },
  {
    title: '认领状态',
    key: 'claimStatus',
  },
  {
    title: '认领客户ID',
    key: 'claimCustomId',
  },
  {
    title: '在库天数',
    key: 'storageDays',
  },
  timeColumn('discardTime', '废弃时间点'),
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
  containerLogo: string;
  img: string;
  claimStatus: string;
  claimCustomId: number;
  storageDays: number;
  discardTime: string;
  storeAddress: string;
};
