import { generateOptionFromArray } from '@/store/utils/utils';
import { DeliveryMethod, deliveryMethod } from '@/api/dataLayer/modules/deliveryMethod';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { listUser, PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';
import { usePermission } from '@/hooks/web/usePermission';
import dayjs from 'dayjs';

export function getFilesUploadFormField(
  key = 'files',
  required = true,
  uploadTemplate: any = null
): FormField {
  return {
    field: key,
    label: '附件',
    component: 'NUpload',
    componentProps: {
      multiple: true,
      uploadTemplate,
    },
    required: required,
  };
}

export function getCheckFormField(): FormField[] {
  return [
    { field: 'note', label: '备注', required: false },
    getFilesUploadFormField('files', false),
  ];
}

export function getDeliveryMethodSelection(): FormField[] {
  return [
    {
      field: 'deliveryMethod',
      label: '配送方式',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(deliveryMethod),
      },
    },
    {
      field: 'otherDeliveryName',
      label: '其他配送方式名称',
      displayCondition(value) {
        return value.deliveryMethod === DeliveryMethod.Others;
      },
    },
    {
      field: 'waybillId',
      label: '物流单号',
      required: false,
    },
  ];
}

export async function asyncCustomerFormField(): Promise<FormField> {
  const { hasPermission } = usePermission();
  const customerList = (await listUser(PermissionEnums.Customer)).result.map((it) => ({
    label: it.realName,
    value: it.id,
  }));
  return {
    field: 'customerId',
    label: '客户',
    component: 'NSelect',
    componentProps: {
      options: customerList,
    },
    displayCondition() {
      return !hasPermission([PermissionEnums.Customer]);
    },
  };
}

export const deliveryMethodSelection: FormField[] = getDeliveryMethodSelection();

export function formFieldBuilder() {
  const fieldForm: FormField[] = [];
  let group = '基本信息';
  const add = (field: FormField) => {
    field.group = group;
    fieldForm.push(field);
  };
  const addAll = (fields: FormField[]) => {
    fields.forEach(add);
  };
  const setGroup = (newGroup: string) => {
    group = newGroup;
  };
  const build = () => {
    return fieldForm;
  };

  const toColumn = () => {
    return fieldForm.map((it) => ({
      render: it.render,
      title: it.label,
      key: it.field,
      meta: it.meta,
    }));
  };

  return {
    add,
    addAll,
    build,
    setGroup,
    toColumn,
  };
}

export function getDatePickerFormField(key = 'date', title = '日期'): FormField {
  return {
    field: key,
    component: 'NDatePicker',
    label: title,
    defaultValue: dayjs().valueOf(),
    componentProps: {
      type: 'date',
      clearable: true,
    },
  };
}
export const salesFormField = {
  field: 'salesName',
  label: '业务员',
  required: false,
};
export const noteFormField = {
  field: 'note',
  label: '备注',
  required: false,
};
