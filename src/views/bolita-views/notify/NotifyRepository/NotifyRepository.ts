import { convertFieldToColumn, FormField } from '@/views/bolita-views/composable/form-field-type';
import { formFieldUnitSelection } from '@/api/model/common/BoxOrTray';
import { getTargetAddressSelectionGroup } from '@/api/model/common/addressGroup';
import { NotifyType } from '@/api/notify/notify-api';
import { formFieldTaskTypeSelection } from '@/api/dataLayer/fieldDefination/form-field-sort-label';

export function getNeededColumnByNotifyType(notifyType: NotifyType | null) {
  return getNeededFieldByNotifyType(notifyType)
    .filter((it) => it?.meta != 'detail')
    .map(convertFieldToColumn);
}

export function getNeededFieldByNotifyType(notifyType: NotifyType | null): any[] {
  const boxField: FormField[] =
    notifyType == NotifyType.TrayOrBox
      ? [
          {
            label: '快递单号',
            field: 'trackingCode',
          },
        ]
      : [];
  return [
    {
      label: '分拣标识',
      field: 'sortCode',
    },
    ...boxField,
    formFieldUnitSelection,
    {
      label: '数量',
      field: 'count',
    },
    {
      label: '长',
      field: 'length',
    },
    {
      label: '宽',
      field: 'width',
    },
    {
      label: '高',
      field: 'height',
    },
    {
      label: '实重kg',
      field: 'actualWeight',
    },
    {
      label: '体积',
      field: 'volume',
    },
    {
      label: 'SKU',
      field: 'sku',
      required: false,
    },
    formFieldTaskTypeSelection,
    ...getTargetAddressSelectionGroup(),
    {
      label: '操作备注',
      field: 'operationNote',
      required: false,
    },
  ];
}

export function getTaskColumns() {
  return [
    {
      label: '分拣标识',
      field: 'sortCode',
    },
    {
      label: '数量',
      field: 'count',
    },
    {
      label: '长',
      field: 'length',
    },
    {
      label: '宽',
      field: 'width',
    },
    {
      label: '高',
      field: 'height',
    },
    {
      label: '实重kg',
      field: 'actualWeight',
    },
    formFieldTaskTypeSelection,
    { label: 'FBA', field: 'fbaCode' },
  ].map(convertFieldToColumn);
}
