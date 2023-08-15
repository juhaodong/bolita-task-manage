<script setup lang="ts">
  import {
    convertFormFieldToSchema,
    FormField,
  } from '@/views/bolita-views/composable/form-field-type';
  import { FormSchema, useForm } from '@/components/Form';
  import { reactive, ref, watchEffect } from 'vue';
  import { FormFields } from '@/api/dataLayer/common/GeneralModel';

  const form = ref<any>(null);

  interface NormalFormProps {
    formFields: FormFields;
    showButtons?: boolean;
    schemas?: FormSchema[];
    defaultValueModel?: any;
  }

  const props = withDefaults(defineProps<NormalFormProps>(), {
    showButtons: true,
  });
  const realSchemas: any[] = reactive([]);
  watchEffect(async () => {
    realSchemas.length = 0;
    const res = [];
    for (const it of props.formFields) {
      res.push(await it);
    }
    realSchemas.push(...res);
  });
  const schemas: FormField[] = $computed(() => {
    return realSchemas.map(convertFormFieldToSchema).map((it) => {
      if (props?.defaultValueModel?.[it.field]) {
        it.defaultValue = props?.defaultValueModel?.[it.field];
      }
      it.componentProps.placeholder = it.componentProps.placeholder
        .replace('请输入', '')
        .replace('请选择', '');
      it.componentProps.size = 'small';
      return it;
    });
  });

  const [register, { submit }] = useForm({
    labelWidth: 80,
    layout: 'inline',
    submitButtonText: '搜索',
    showActionButtonGroup: props.showButtons,
  });
  const emit = defineEmits(['submit', 'cancel', 'clear']);

  function handleSubmit(values: Recordable) {
    emit('submit', values);
  }

  function cancel() {
    console.log(form.value.formModel);
    emit('cancel', form.value.formModel);
  }

  function handleReset(value: Recordable) {
    console.log(value);
    emit('clear');
  }
</script>

<template>
  <filter-form
    ref="form"
    @register="register"
    :schemas="schemas"
    @submit="handleSubmit"
    @reset="handleReset"
  >
    <slot></slot>
    <slot name="extraSubmitButton" :submit="submit"></slot>
    <slot name="extraCancelButton" :cancel="cancel"></slot>
  </filter-form>
</template>

<style scoped lang="less"></style>
