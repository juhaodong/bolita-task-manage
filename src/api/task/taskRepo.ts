import { TaskType } from '@/api/task/task-types';
import {
  filesUpload,
  FormField,
  formFieldBoxNo,
  formFieldBuilder,
  formFieldContainerNo,
  formFieldSku,
  formFieldSortLabel,
} from '@/views/bolita-views/composable/form-field-type';
import { formFieldUnitSelection } from '@/api/model/common/BoxOrTray';
import { generateOptionFromArray } from '@/utils/utils';
import { yesOrNo } from '@/api/operationType';
import { sizeFormField } from '@/api/model/common/SizeFormField';
import { outBoundFormField } from '@/api/deliveryMethod';
import { formFieldTargetCountrySelection } from '@/api/model/common/TargetCountry';
import { AddressType } from '@/api/model/common/AddressType';
import { fbaDict, formFieldFBACodeSelection, generateFbaAddress } from '@/api/model/common/FBACode';
import { deliveryAddressDetail } from '@/api/model/common/addressGroup';

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
    builder.add(formFieldFBACodeSelection);
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
  builder.add({
    field: 'note',
    label: '备注',
  });
  return builder.build();
}
