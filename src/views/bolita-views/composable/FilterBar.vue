<script setup lang="ts">
  import {
    convertFormFieldToSchema,
    FormField,
  } from '@/views/bolita-views/composable/form-field-type';
  import { FormSchema, useForm } from '@/components/Form';
  import { ref } from 'vue';

  const form = ref<any>(null);

  interface NormalFormProps {
    formFields: FormField[];
    showButtons?: boolean;
    schemas?: FormSchema[];
    defaultValueModel?: any;
  }

  const props = withDefaults(defineProps<NormalFormProps>(), {
    showButtons: true,
  });

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

  const [register, { submit }] = useForm({
    labelWidth: 80,
    layout: 'inline',
    submitButtonText: '搜索',
    showActionButtonGroup: props.showButtons,
    schemas,
  });
  const emit = defineEmits(['submit', 'cancel']);

  function handleSubmit(values: Recordable) {
    emit('submit', values);
  }

  function cancel() {
    console.log(form.value.formModel);
    emit('cancel', form.value.formModel);
  }

  function handleReset(value: Recordable) {
    console.log(value);
  }
</script>

<template>
  <filter-form ref="form" @register="register" @submit="handleSubmit" @reset="handleReset">
    <slot name="extraContent"></slot>
    <slot name="extraSubmitButton" :submit="submit"></slot>
    <slot name="extraCancelButton" :cancel="cancel"></slot>
  </filter-form>
</template>

<style scoped lang="less"></style>
