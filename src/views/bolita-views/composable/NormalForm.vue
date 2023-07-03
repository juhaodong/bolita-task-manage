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
    gridProps: { cols: schemas.length > 8 ? 2 : 1 },
    labelWidth: 80,
    layout: 'Horizontal',
    submitButtonText: '保存',
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
  <BasicForm ref="form" @register="register" @submit="handleSubmit" @reset="handleReset">
    <template #extraContent>
      <slot name="extraContent"></slot>
    </template>
    <slot name="extraSubmitButton" :submit="submit"></slot>
    <slot name="extraCancelButton" :cancel="cancel"></slot>
  </BasicForm>
</template>

<style scoped lang="less"></style>
