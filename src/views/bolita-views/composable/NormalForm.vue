<script setup lang="ts">
  import {
    convertFormFieldToSchema,
    FormField,
  } from '@/views/bolita-views/composable/form-field-type';
  import { FormSchema, useForm } from '@/components/Form';
  import { reactive, ref, watchEffect } from 'vue';

  const form = ref<any>(null);

  interface NormalFormProps {
    formFields: (Promise<FormField> | FormField)[];
    showButtons?: boolean;
    showGroupHeader?: boolean;
    defaultValueModel?: any;
  }

  const props = withDefaults(defineProps<NormalFormProps>(), {
    showButtons: true,
    showGroupHeader: true,
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

  const schemas: FormSchema[] = $computed(() => {
    return realSchemas.map(convertFormFieldToSchema).map((it) => {
      if (props?.defaultValueModel?.[it.field]) {
        it.defaultValue = props?.defaultValueModel?.[it.field];
      }
      return it;
    });
  });

  const [register, { submit }] = useForm({});
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
    @register="register"
    :label-width="80"
    :layout="'Horizontal'"
    :grid-props="{ cols: schemas.length > 8 ? 2 : 1 }"
    @submit="handleSubmit"
    @reset="handleReset"
  >
    <template #extra>
      <slot></slot>
    </template>
    <slot name="extraSubmitButton" :submit="submit"></slot>
    <slot name="extraCancelButton" :cancel="cancel"></slot>
    <slot name="extraContent"></slot>
  </BasicForm>
</template>

<style scoped lang="less"></style>
