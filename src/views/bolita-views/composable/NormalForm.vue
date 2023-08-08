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
    showGroupHeader?: boolean;
    defaultValueModel?: any;
  }

  const props = withDefaults(defineProps<NormalFormProps>(), {
    showButtons: true,
    showGroupHeader: true,
  });

  const schemas: FormSchema[] = $computed(() => {
    return props.formFields.map(convertFormFieldToSchema).map((it) => {
      if (props?.defaultValueModel?.[it.field]) {
        it.defaultValue = props?.defaultValueModel?.[it.field];
      }
      return it;
    });
  });

  const [register, { submit }] = useForm({
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
  <BasicForm
    :show-group-header="showGroupHeader"
    ref="form"
    :show-action-button-group="showButtons"
    :submit-button-text="'保存'"
    :schemas="schemas"
    :label-width="80"
    :layout="'Horizontal'"
    @register="register"
    :grid-props="{ cols: schemas.length > 8 ? 2 : 1 }"
    @submit="handleSubmit"
    @reset="handleReset"
  >
    <slot name="extraContent"></slot>
    <slot name="extraSubmitButton" :submit="submit"></slot>
    <slot name="extraCancelButton" :cancel="cancel"></slot>
  </BasicForm>
</template>

<style scoped lang="less"></style>
