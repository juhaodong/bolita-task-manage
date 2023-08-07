import { generateOptionFromArray } from '@/store/utils/utils';
import { DeliveryMethod, outBoundDeliveryMethods } from '@/api/dataLayer/modules/deliveryMethod';
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
