import { ComponentType, FormSchema } from '@/components/Form';

export type FormField = {
  field: string;
  label: string;
  componentProps?: object;
  required: boolean;
  component?: ComponentType;
  defaultValue?: any;
};

export function convertFormFieldToSchema(formField: FormField): FormSchema {
  const type = formField?.component ?? 'NInput';
  const verb = ['NInput', 'NInputNumber'].includes(type) ? '输入' : '选择';
  const extraType = type.includes('Number') ? { type: 'number' } : {};
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
    rules: formField.required ? [rule] : [],
  };
}
