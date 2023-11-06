import { generateOptionFromArray } from '@/store/utils/utils';
import { DeliveryMethod, deliveryMethod } from '@/api/dataLayer/modules/deliveryMethod';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { usePermission } from '@/hooks/web/usePermission';
import dayjs from 'dayjs';
import { CustomerManager } from '@/api/dataLayer/modules/user/user';
import { keyBy } from 'lodash-es';
import { storage } from '@/store/utils/Storage';
import { CUSTOMER_ID } from '@/store/mutation-types';
import { useUserStore } from '@/store/modules/user';

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

export function getDeliveryMethodSelection(dm = deliveryMethod): FormField[] {
  return [
    {
      field: 'deliveryMethod',
      label: '出库方式',
      component: 'NSelect',
      required: false,
      componentProps: {
        options: generateOptionFromArray(dm),
      },
    },
    {
      field: 'otherDeliveryName',
      label: '其他出库方式名称',
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
  const { isCustomer } = usePermission();
  const customers = await CustomerManager.load();
  const customerDict = keyBy(customers, 'id');
  const customerList = customers.map((it) => ({
    label: it.customerName,
    value: it.id,
  }));
  return {
    field: 'customerId',
    label: '客户',
    component: 'NSelect',
    componentProps: {
      options: customerList,
    },
    defaultValue: isCustomer() ? storage.get(CUSTOMER_ID) : null,
    disableCondition() {
      console.log(storage.get(CUSTOMER_ID));
      return isCustomer();
    },
    onFormUpdate(value) {
      if (value?.customerId) {
        value['warehouseId'] = customerDict[value?.customerId]?.warehouseId;
      }
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
export function getDatePickerFormField(key = 'date', title = '日期', powerList = []): FormField {
  return {
    field: key,
    component: 'NDatePicker',
    disableCondition() {
      const AccountPowerList = useUserStore()?.info?.powerList;
      if (powerList.length < 1) {
        return false;
      } else {
        return !AccountPowerList.includes(powerList);
      }
    },
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
