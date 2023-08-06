import { TaskType } from '@/api/task/task-types';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { formFieldUnitSelection } from '@/api/model/common/BoxOrTray';
import { generateOptionFromArray } from '@/utils/utils';
import { yesOrNo } from '@/api/operationType';
import { sizeFormField } from '@/api/model/common/SizeFormField';
import { outBoundFormField } from '@/api/deliveryMethod';
import { formFieldTargetCountrySelection } from '@/api/model/common/TargetCountry';
import { AddressType } from '@/api/model/common/AddressType';
import { fbaCode, fbaDict, generateFbaAddress } from '@/api/model/common/FBACode';
import { deliveryAddressDetail } from '@/api/model/common/addressGroup';
import { statusColumn, timeColumn } from '@/views/bolita-views/composable/useableColumns';
import {
  filesUpload,
  formFieldBoxNo,
  formFieldBuilder,
  formFieldContainerNo,
  formFieldSku,
  formFieldSortLabel,
} from '@/api/dataLayer/fieldDefination/form-field-sort-label';

export function getFormFieldForTaskType(taskType: TaskType, customerField: FormField) {
  const builder = formFieldBuilder();
  builder.addAll([
    {
      field: 'notifyId',
      label: '入库ID',
      required: false,
    },
    customerField,
    formFieldSortLabel,
    formFieldBoxNo,
    formFieldSku,
  ]);

  if ([TaskType.Transfer, TaskType.AmazonTray, TaskType.NormalTray].includes(taskType)) {
    builder.add(formFieldContainerNo);
    builder.add(filesUpload);
  }
  if (taskType == TaskType.OneForSend) {
    builder.add(formFieldUnitSelection);
  }
  builder.addAll([
    {
      field: 'boxCount',
      label: '数量',
    },
    ...sizeFormField,
  ]);
  if ([TaskType.NormalTray, TaskType.AmazonTray].includes(taskType)) {
    builder.addAll([
      {
        field: 'trayCount',
        label: '托数',
      },
      {
        field: 'needChangeTray',
        label: '是否换托盘',
        component: 'NSelect',
        componentProps: {
          options: generateOptionFromArray(yesOrNo),
        },
      },
    ]);
  }
  builder.setGroup('物流信息');
  if ([TaskType.OneForSend, TaskType.Transfer, TaskType.Return].includes(taskType)) {
    builder.addAll([
      outBoundFormField,
      {
        field: 'deliveryNo',
        label: '物流单号',
      },
    ]);
  }
  builder.addAll([
    formFieldTargetCountrySelection,
    {
      label: '邮编',
      field: 'postCode',
      disableCondition(model) {
        return model?.addressType === AddressType.AMZ;
      },
      onFormUpdate(value) {
        if (value?.fbaCode) {
          value['postCode'] = fbaDict[value.fbaCode].postCode;
        }
      },
    },
  ]);
  if (TaskType.AmazonTray === taskType) {
    builder.add({
      label: 'FBA Code',
      field: 'fbaCode',
      component: 'NSelect',
      componentProps: {
        options: fbaCode.map((it) => ({
          label: it.code + '(' + it.countryCode + ')',
          value: it.code,
        })),
      },
    });
  }
  if ([TaskType.Transfer, TaskType.AmazonTray, TaskType.Return].includes(taskType)) {
    builder.addAll([
      { label: 'FBA', field: 'fba' },
      { label: 'PO', field: 'po' },
    ]);
  }
  if (taskType === TaskType.AmazonTray) {
    builder.add({
      field: 'deliveryAddress',
      label: '送货地址',
      componentProps: {
        type: 'textarea',
      },
      required: true,
      disableCondition() {
        return true;
      },
      onFormUpdate(value) {
        if (value?.fbaCode) {
          value['deliveryAddress'] = generateFbaAddress(fbaDict[value.fbaCode]);
        }
      },
    });
  } else {
    builder.addAll(deliveryAddressDetail);
  }
  if ([TaskType.AmazonTray, TaskType.NormalTray].includes(taskType)) {
    builder.add({
      field: 'needPrice',
      label: '需要确认报价',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(yesOrNo),
      },
    });
  }

  builder.add({
    field: 'note',
    label: '备注',
  });
  return builder.build();
}

export function getFormColumnForTaskType(taskType: TaskType) {
  const builder = formFieldBuilder();
  builder.addAll([
    {
      field: 'id',
      label: '出库ID',
      required: false,
    },
    {
      field: 'notifyId',
      label: '入库ID',
      required: false,
    },
    {
      label: '仓库ID',
      field: 'warehouseId',
    },
    { label: '客户', field: 'customerId' },
    formFieldSortLabel,
    formFieldBoxNo,
    formFieldSku,
  ]);

  if ([TaskType.Transfer, TaskType.AmazonTray, TaskType.NormalTray].includes(taskType)) {
    builder.add(formFieldContainerNo);
    builder.add(filesUpload);
  }
  builder.addAll([
    {
      field: 'boxCount',
      label: '数量',
    },
  ]);
  if ([TaskType.NormalTray, TaskType.AmazonTray].includes(taskType)) {
    builder.addAll([
      {
        field: 'trayCount',
        label: '托数',
      },
    ]);
  }
  builder.setGroup('物流信息');
  if ([TaskType.OneForSend, TaskType.Transfer, TaskType.Return].includes(taskType)) {
    builder.addAll([
      outBoundFormField,
      {
        field: 'deliveryNo',
        label: '物流单号',
      },
    ]);
  }
  builder.addAll([
    formFieldTargetCountrySelection,
    {
      label: '邮编',
      field: 'postCode',
      disableCondition(model) {
        return model?.addressType === AddressType.AMZ;
      },
      onFormUpdate(value) {
        if (value?.fbaCode) {
          value['postCode'] = fbaDict[value.fbaCode].postCode;
        }
      },
    },
  ]);
  if (TaskType.AmazonTray === taskType) {
    builder.add({
      label: 'FBA Code',
      field: 'fbaCode',
      component: 'NSelect',
      componentProps: {
        options: fbaCode.map((it) => ({
          label: it.code + '(' + it.countryCode + ')',
          value: it.code,
        })),
      },
    });
  }
  if ([TaskType.Transfer, TaskType.AmazonTray, TaskType.Return].includes(taskType)) {
    builder.addAll([
      { label: 'FBA', field: 'fba' },
      { label: 'PO', field: 'po' },
    ]);
  }
  if (taskType === TaskType.AmazonTray) {
    builder.add({
      field: 'deliveryAddress',
      label: '送货地址',
    });
  } else {
    builder.add({
      field: 'deliveryAddress',
      label: '送货地址',
    });
  }
  builder.add({
    ...statusColumn,
    field: 'status',
    label: '状态',
  });
  builder.add({
    ...timeColumn('createTimestamp'),
    field: 'createTimestamp',
    label: '创建时间',
  });
  builder.add({
    ...timeColumn('finishTimestamp'),
    field: 'finishTimestamp',
    label: '完成时间',
  });
  builder.add({
    field: 'note',
    label: '备注',
  });
  return builder.toColumn();
}
