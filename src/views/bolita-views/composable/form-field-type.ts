import { ComponentType, FormSchema } from '@/components/Form';
import { BasicColumn } from '@/components/Table';

export type FormField = {
  field: string;
  label: string;
  componentProps?: object;
  labelMessage?: string;
  required?: boolean;
  component?: ComponentType;
  defaultValue?: any;
  group?: string;
  meta?: any;
  render?: (record: any) => void;
  displayCondition?: (formValue: any) => boolean;
  disableCondition?: (formValue: any) => boolean;
  onFormUpdate?: (formValue: any) => void;
};

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
    group: formField?.group,
  };
}

export function convertFieldToColumn(field: FormField): BasicColumn {
  return {
    title: field.label,
    key: field.field,
  };
}
