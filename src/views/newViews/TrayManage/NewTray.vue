<template>
  <n-card class="proCard">
    <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { ref } from 'vue';
  import { listUser, PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';
  import { FormFields } from '@/api/dataLayer/common/GeneralModel';
  import { getDatePickerFormField } from '@/api/dataLayer/fieldDefination/common';

  interface Props {
    model?: any;
  }

  defineProps<Props>();

  let customerList = ref<any[]>([]);

  async function init() {
    customerList.value = (await listUser(PermissionEnums.Customer)).result.map((it) => ({
      label: it.realName,
      value: it.id,
    }));
  }

  init();
  const schemas: FormFields = [
    {
      label: '退回托盘数量',
      field: 'backTrayNumber',
    },
    getDatePickerFormField('returnTime', '退回时间'),
    {
      label: '备注',
      field: 'note',
      required: false,
    },
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: any) {
    emit('submit', values);
  }
</script>

<style lang="less" scoped></style>
