<template>
  <n-card class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset" />
  </n-card>
</template>
<script setup lang="ts">
  import { FormSchema, useForm } from '@/components/Form';

  const props = defineProps({
    userInfo: Object,
    isNew: Boolean,
  });

  const schemas: FormSchema[] = [
    {
      field: 'username',
      component: 'NInput',
      label: '用户名',
      defaultValue: props.userInfo?.username,
      componentProps: {
        placeholder: '请输入用户名',
        disabled: !props.isNew,
      },
      rules: [{ required: true, message: '请输入用户名', trigger: ['blur'] }],
    },
    {
      field: 'realName',
      component: 'NInput',
      label: '用户姓名',
      defaultValue: props.userInfo?.realName,
      componentProps: {
        placeholder: '请输入用户姓名',
      },
      rules: [{ required: true, message: '请输入用户姓名', trigger: ['blur'] }],
    },
    {
      field: 'password',
      component: 'NInput',
      label: '密码',
      defaultValue: props.userInfo?.password,
      componentProps: {
        placeholder: '请输入密码',
      },
      rules: [{ required: true, message: '请输入密码', trigger: ['blur'] }],
    },
  ];

  const [register, {}] = useForm({
    gridProps: { cols: 1 },
    labelWidth: 80,
    layout: 'vertical',
    submitButtonText: props.isNew ? '新建' : '编辑',
    schemas,
  });
  const emit = defineEmits(['submit']);

  function handleSubmit(values: Recordable) {
    emit('submit', values);
    console.log(values);
  }

  function handleReset(value: Recordable) {
    console.log(value);
  }
</script>

<style scoped lang="less"></style>
