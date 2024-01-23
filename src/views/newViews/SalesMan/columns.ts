import { DataTableColumns, NTag } from 'naive-ui';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { h } from 'vue';

export const columns: DataTableColumns<SalesMan> = [
  {
    title: '用户名',
    key: 'userName',
  },
  {
    title: '名称',
    key: 'realName',
  },
  {
    title: '登录名',
    key: 'loginName',
  },
  {
    title: '密码',
    key: 'password',
  },
  {
    title: '仓库',
    key: 'warehouse',
    render(row) {
      const tags = row?.warehouseId.map((tagKey) => {
        return h(
          NTag,
          {
            style: {
              marginRight: '6px',
            },
            type: 'info',
            bordered: false,
          },
          {
            default: () => tagKey,
          }
        );
      });
      return tags;
    },
  },
  timeColumn(),
];

export const filters: FormField[] = [
  {
    label: '用户名',
    field: 'userName',
  },
  {
    label: '名称',
    field: 'realName',
  },
  {
    label: '登录名',
    field: 'loginName',
  },
  {
    label: '密码',
    field: 'password',
  },
];
