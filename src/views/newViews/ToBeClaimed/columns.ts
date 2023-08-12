import { DataTableColumns, NImage, NSpace } from 'naive-ui';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';
import dayjs from 'dayjs';
import { addDoc, collection, orderBy, query } from 'firebase/firestore';
import { db, executeQuery, getFileListUrl } from '@/store/plugins/firebase';
import { resultError, resultSuccess } from '@/store/request/_util';
import { h } from 'vue';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { deliveryMethodSelection } from '@/api/dataLayer/fieldDefination/common';

export const columns: DataTableColumns<ToBeClaimedModel> = [
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
    render(record) {
      return h(NSpace, [
        ...record?.['img'].map((it) => {
          return h(NImage, {
            src: it,
            width: 36,
            height: 36,
          });
        }),
      ]);
    },
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

export async function createNewClaim(model) {
  try {
    model.img = await getFileListUrl(model.img);
    model.createTimestamp = dayjs().valueOf();
    model.claimStatus = ClaimStatus.Waiting;
    await addDoc(collection(db, path), model);
    return resultSuccess('');
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function loadAllClaim() {
  return await executeQuery(query(collection(db, path), orderBy('createTimestamp', 'desc')));
}

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
