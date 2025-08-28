import { isArray, isFunction, isNullOrUnDef, isObject, isString } from '@/store/is';
import type { ComputedRef, Ref } from 'vue';
import { unref } from 'vue';
import type { FormSchema } from '../types/form';
import { set } from 'lodash-es';

interface UseFormValuesContext {
  defaultFormModel: Ref<any>;
  getSchema: ComputedRef<FormSchema[]>;
  formModel: Recordable;
}
export function useFormValues({ defaultFormModel, getSchema, formModel }: UseFormValuesContext) {
  // 加工 form values
  function handleFormValues(values: Recordable) {
    if (!isObject(values)) {
      return {};
    }
    const res: Recordable = {};
    for (const item of Object.entries(values)) {
      let [, value] = item;
      const [key] = item;
      if (
        !key ||
        (isArray(value) && value.length === 0) ||
        isFunction(value) ||
        isNullOrUnDef(value)
      ) {
        continue;
      }
      // 删除空格
      if (isString(value)) {
        value = value.trim();
      }
      set(res, key, value);
    }
    return res;
  }

  //初始化默认值
  function initDefault() {
    const schemas = unref(getSchema);
    const obj: Recordable = {};

    // Clear all existing values in formModel that are not in the current schema
    Object.keys(formModel).forEach((key) => {
      const schemaItem = schemas.find((item) => item.field === key);
      if (!schemaItem) {
        formModel[key] = null;
      }
    });

    // Set values based on current schema
    schemas.forEach((item) => {
      const { defaultValue, field } = item;
      if (!isNullOrUnDef(defaultValue)) {
        obj[field] = defaultValue;
        formModel[field] = defaultValue;
      } else {
        // Clear the value in formModel if defaultValue is null or undefined
        formModel[field] = null;
      }
    });

    console.log(obj, 'obj');
    defaultFormModel.value = obj;
  }

  return { handleFormValues, initDefault };
}
