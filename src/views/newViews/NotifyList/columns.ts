import { DataTableColumns } from 'naive-ui';
import { deleteNotify, NotifyModel } from '@/views/newViews/NotifyList/api/notify-api';
import { standardDateFormat, timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { h, reactive } from 'vue';
import { TableAction } from '@/components/Table';
import Delete28Filled from '@vicons/fluent/es/Delete28Filled';
import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';
import { Folder32Filled } from '@vicons/fluent';
import { Hammer, Home } from '@vicons/ionicons5';
import { CurrencyEuro } from '@vicons/carbon';

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
    key: 'totalCount',
  },
  timeColumn('planArriveDateTime', '预计到达时间'),
  timeColumn('reserveTime', '预约仓位', standardDateFormat),
  {
    title: '入库数量',
    key: 'arrivedCount',
    render(record) {
      const display = record.arrivedCount + '/' + record.totalCount;
      return h('div', display);
    },
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

export function getActionColumn(reload: any) {
  return reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '删除',
            icon: Delete28Filled,
            popConfirm: {
              title: '是否确定删除此预报？',
              async confirm() {
                await deleteNotify(record.id);
                reload();
              },
            },
          },
          {
            label: '修改',
            icon: DocumentEdit16Filled,
            popConfirm: {
              title: '是否确定删除此预报？',
              async confirm() {
                await deleteNotify(record.id);
                reload();
              },
            },
          },
          {
            label: '附件',
            icon: Folder32Filled,
            popConfirm: {
              title: '是否确定删除此预报？',
              async confirm() {
                await deleteNotify(record.id);
                reload();
              },
            },
          },
          {
            label: 'CMR',
          },
          {
            label: '问题图片',
          },
          {
            label: '操作',
            icon: Hammer,
          },
          {
            label: '查看仓库信息',
            icon: Home,
          },
          {
            label: '费用',
            icon: CurrencyEuro,
          },
        ],
      });
    },
  });
}
