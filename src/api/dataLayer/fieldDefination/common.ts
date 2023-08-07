import { generateOptionFromArray } from '@/store/utils/utils';
import { DeliveryMethod, deliveryMethod } from '@/api/dataLayer/modules/deliveryMethod';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

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
      field: 'deliveryCode',
      label: '物流单号',
      required: false,
    },
  ];
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
