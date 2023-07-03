import { ComponentType, FormSchema } from '@/components/Form';
import { generateOptionFromArray } from '@/utils/utils';
import { canHaveLogisticMethods, DeliveryMethod, deliveryMethods } from '@/api/deliveryMethod';
import { yesOrNo } from '@/api/operationType';
import { taskTypes } from '@/api/task/task-types';
import { AddressType } from '@/api/model/common/AddressType';
import { fbaDict, generateFbaAddress } from '@/api/model/common/FBACode';

export type FormField = {
  field: string;
  label: string;
  componentProps?: object;
  labelMessage?: string;
  required?: boolean;
  component?: ComponentType;
  defaultValue?: any;
  displayCondition?: (formValue: any) => boolean;
  disableCondition?: (formValue: any) => boolean;
  onFormUpdate?: (formValue: any) => void;
};

export function getFilesUploadFormField(key = 'files', required = true): FormField {
  return {
    field: key,
    label: '附件',
    component: 'NUpload',
    componentProps: {
      multiple: true,
    },
    required: required,
  };
}

export const filesUpload: FormField = getFilesUploadFormField();
export function getCheckFormField(warehouseList): FormField[] {
  return [
    {
      field: 'warehouseId',
      label: '执行仓库',
      component: 'NSelect',
      componentProps: {
        options: warehouseList,
      },
    },
    { field: 'note', label: '备注', required: false },
    getFilesUploadFormField('files', false),
  ];
}
export function getDeliveryMethodSelection(onlyWithLogistic = false): FormField[] {
  return [
    {
      field: 'deliveryMethod',
      label: '配送方式',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(
          onlyWithLogistic ? canHaveLogisticMethods : deliveryMethods
        ),
      },
      required: true,
    },
    {
      field: 'otherDeliveryName',
      label: '其他配送方式名称',
      component: 'NInput',
      componentProps: {
        options: generateOptionFromArray(deliveryMethods),
      },
      displayCondition(value) {
        return value.deliveryMethod === DeliveryMethod.Others;
      },
      required: true,
    },
  ];
}
export const deliveryMethodSelection: FormField[] = getDeliveryMethodSelection();

export const commonDeliveryFields: FormField[] = [
  {
    field: 'deliveryAddress',
    label: '送货地址',
    componentProps: {
      type: 'textarea',
    },
    required: true,
    disableCondition(model) {
      return model?.addressType === AddressType.AMZ;
    },
    onFormUpdate(value) {
      if (value?.fbaCode) {
        value['deliveryAddress'] = generateFbaAddress(fbaDict[value.fbaCode]);
        console.log(value);
      }
    },
  },
  {
    field: 'needPrice',
    label: '需要确认报价',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(yesOrNo),
    },
  },
];

export function convertFormFieldToSchema(formField: FormField): FormSchema {
  const type = formField?.component ?? 'NInput';
  const verb = ['NInput', 'NInputNumber'].includes(type) ? '输入' : '选择';
  const shouldUseNumber = ['NInputNumber', 'NDatePicker'].includes(type);
  const required = formField?.required ?? true;
  const extraType = shouldUseNumber ? { type: 'number' } : {};
  let rule: any = Object.assign(extraType, {
    required: required,
    message: '请' + verb + formField.label,
    trigger: ['blur'],
  });
  if (type === 'NUpload') {
    rule = {
      required: required,
      message: '请' + verb + formField.label,
      trigger: ['blur'],
      validator: (rule: { message: string; required: boolean }, value: any) => {
        if (rule.required) {
          return value?.length > 0 || Error(rule.message);
        } else {
          return true;
        }
      },
    };
  }
  return {
    component: type,
    componentProps: Object.assign(
      {
        placeholder: '请' + verb + formField.label,
      },
      formField.componentProps
    ),
    labelMessage: formField.labelMessage,
    defaultValue: formField.defaultValue,
    field: formField.field,
    label: formField.label,
    displayCondition: formField?.displayCondition,
    rules: required ? [rule] : [],
    disableCondition: formField?.disableCondition,
    onFormUpdate: formField?.onFormUpdate,
  };
}

export const formFieldTaskTypeSelection: FormField = {
  label: '操作类型',
  field: 'taskType',
  component: 'NSelect',
  componentProps: {
    options: generateOptionFromArray(taskTypes),
  },
};
