import { ComponentType, FormSchema } from '@/components/Form';
import { generateOptionFromArray } from '@/utils/utils';
import { canHaveLogisticMethods, DeliveryMethod, deliveryMethods } from '@/api/deliveryMethod';

export type FormField = {
  field: string;
  label: string;
  componentProps?: object;
  labelMessage?: string;
  required?: boolean;
  component?: ComponentType;
  defaultValue?: any;
  displayCondition?: (formValue: any) => boolean;
};

export function getFilesUploadFormField(key = 'files'): FormField {
  return {
    field: key,
    label: '附件',
    component: 'NUpload',
    componentProps: {
      multiple: true,
    },
    required: true,
  };
}
export const filesUpload: FormField = getFilesUploadFormField();
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
  };
}
