<script setup lang="ts">
  import {
    convertFormFieldToSchema,
    FormField,
  } from '@/views/bolita-views/composable/form-field-type';
  import { FormSchema, useForm } from '@/components/Form';

  interface NormalFormProps {
    formFields: FormField[];
    schemas?: FormSchema[];
    defaultValueModel?: any;
  }
  const props = defineProps<NormalFormProps>();

  const schemas = $computed(() => {
    return [...(props?.schemas ?? []), ...props.formFields.map(convertFormFieldToSchema)].map(
      (it) => {
        if (props?.defaultValueModel?.[it.field]) {
          it.defaultValue = props?.defaultValueModel?.[it.field];
        }
        return it;
      }
    );
  });

  const [register, {}] = useForm({
    gridProps: { cols: 1 },
    labelWidth: 80,
    layout: 'vertical',
    submitButtonText: '下一步',
    schemas,
  });
  const emit = defineEmits(['submit']);

  function handleSubmit(values: Recordable) {
    emit('submit', values);
  }

  function handleReset(value: Recordable) {
    console.log(value);
  }
</script>

<template>
  <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset" />
</template>

<style scoped lang="less"></style>
