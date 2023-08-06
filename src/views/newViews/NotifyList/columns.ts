import { DataTableColumns } from 'naive-ui';
import {
  deleteNotify,
  InBoundStatus,
  NotifyModel,
} from '@/views/newViews/NotifyList/api/notify-api';
import { standardDateFormat, timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { h, reactive } from 'vue';
import { TableAction } from '@/components/Table';
import { PermissionEnums } from '@/api/user/baseUser';

export const columns: DataTableColumns<NotifyModel> = [
  {
    title: '入库ID',
    key: 'id',
  },
  timeColumn(),
  {
    title: '客户ID',
    key: 'customerId',
  },
  {
    title: '业务员',
    key: 'salesName',
  },
  {
    title: '仓库',
    key: 'warehouseName',
  },
  {
    title: '货柜号',
    key: 'containerNo',
  },
  {
    title: '总数量',
    key: 'boxCount',
  },
  timeColumn('planArriveDateTime', '预计到达时间'),
  timeColumn('reserveTime', '预约仓位', standardDateFormat),
  {
    title: '入库数量',
    key: 'totalCount',
  },
  {
    title: '入库状态',
    key: 'inStatus',
  },
  {
    title: '入库类型',
    key: 'notifyType',
  },
  {
    title: '货柜类型',
    key: 'containerType',
  },
  {
    title: '出库状态',
    key: 'outStatus',
  },
  {
    title: '备注',
    key: 'note',
  },
  {
    title: '交流',
    key: 'warehouseNote',
  },
  {
    title: '结算情况',
    key: 'cashStatus',
  },
];

export function getActionColumn(reload) {
  return reactive({
    title: '可用动作',
    key: 'action',
    render(record) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '删除',
            popConfirm: {
              title: '是否确定删除此预报？',
              async confirm() {
                await deleteNotify(record.id);
                reload();
              },
            },
            ifShow: () => {
              return record.inStatus == InBoundStatus.Wait;
            },
            auth: [PermissionEnums.Manager, PermissionEnums.Customer, PermissionEnums.Technical],
          },
        ],
      });
    },
  });
}
