import { ComponentType, FormSchema } from '@/components/Form';
import { generateOptionFromArray } from '@/utils/utils';
import { DeliveryMethod, deliveryMethods } from '@/api/deliveryMethod';

export type FormField = {
  field: string;
  label: string;
  componentProps?: object;
  required: boolean;
  component?: ComponentType;
  defaultValue?: any;
  displayCondition?: (formValue: any) => boolean;
};

export const deliveryMethodSelection: FormField[] = [
  {
    field: 'deliveryMethod',
    label: '配送方式',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(deliveryMethods),
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
      console.log(value);
      return value.deliveryMethod === DeliveryMethod.Others;
    },
    required: true,
  },
];

export function convertFormFieldToSchema(formField: FormField): FormSchema {
  const type = formField?.component ?? 'NInput';
  const verb = ['NInput', 'NInputNumber'].includes(type) ? '输入' : '选择';
  const shouldUseNumber = ['NInputNumber', 'NDatePicker'].includes(type);
  const extraType = shouldUseNumber ? { type: 'number' } : {};
  const rule = Object.assign(extraType, {
    required: formField.required,
    message: '请' + verb + formField.label,
    trigger: ['blur'],
  });
  return {
    component: type,
    componentProps: Object.assign(
      {
        placeholder: '请' + verb + formField.label,
      },
      formField.componentProps
    ),
    defaultValue: formField.defaultValue,
    field: formField.field,
    label: formField.label,
    displayCondition: formField?.displayCondition,
    rules: formField.required ? [rule] : [],
  };
}
