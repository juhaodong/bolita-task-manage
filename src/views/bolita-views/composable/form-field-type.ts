import { ComponentType, FormSchema } from '@/components/Form';
import { generateOptionFromArray } from '@/utils/utils';
import { DeliveryMethod, outBoundDeliveryMethods } from '@/api/deliveryMethod';
import { taskTypes } from '@/api/task/task-types';
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
export function getDeliveryMethodSelection(useDeliveryCode = false): FormField[] {
  return [
    {
      field: 'deliveryMethod',
      label: '配送方式',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(outBoundDeliveryMethods),
      },
      required: false,
    },
    {
      field: 'otherDeliveryName',
      label: '其他配送方式名称',
      component: 'NInput',
      displayCondition(value) {
        return value.deliveryMethod === DeliveryMethod.Others;
      },
      required: true,
    },
    {
      field: 'deliveryCode',
      label: '物流单号',
      component: 'NInput',
      displayCondition() {
        return useDeliveryCode;
      },
      required: true,
    },
  ];
}
export const deliveryMethodSelection: FormField[] = getDeliveryMethodSelection();
export function formFieldBuilder() {
  const fieldForm: FormField[] = [];
  const add = (field: FormField) => {
    fieldForm.push(field);
  };
  const addAll = (fields: FormField[]) => {
    fieldForm.push(...fields);
  };
  const build = () => {
    return fieldForm;
  };
  return {
    add,
    addAll,
    build,
  };
}
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

export const formFieldTaskTypeSelection: FormField = {
  label: '操作类型',
  field: 'taskType',
  component: 'NSelect',
  componentProps: {
    options: generateOptionFromArray(taskTypes),
  },
};

export function convertFieldToColumn(field: FormField): BasicColumn {
  return {
    title: field.label,
    key: field.field,
  };
}
export const formFieldSortLabel: FormField = {
  field: 'sortLabel',
  label: '分拣ID',
};
export const formFieldBoxNo: FormField = {
  field: 'boxNo',
  label: '箱号',
};
export const formFieldSku: FormField = {
  field: 'SKU',
  label: 'SKU',
};
export const formFieldContainerNo: FormField = {
  field: 'containerNo',
  label: '货柜号',
};
