<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <normal-form :form-fields="schemas" @submit="handleSubmit" />
    </loading-frame>
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { OutBoundPlanManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';
  import { PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';
  import { usePermission } from '@/hooks/web/usePermission';

  const { hasPermission } = usePermission();

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();

  const schemas: FormField[] = [
    {
      field: 'trayChange',
      label: '托盘置换',
      disableCondition() {
        return hasPermission([
          PermissionEnums.CustomerService,
          PermissionEnums.CustomerManage,
          PermissionEnums.Logistic,
          PermissionEnums.Sales,
          PermissionEnums.Cash,
        ]);
      },
    },
    {
      field: 'warehouseNote',
      label: '仓库备注',
    },
  ].map((it: FormField) => {
    it.required = false;
    return it;
  });

  const emit = defineEmits(['saved']);

  async function handleSubmit(values) {
    loading = true;
    if (prop.model) {
      await safeScope(async () => {
        await OutBoundPlanManager.editInternal(values, prop.model);
        emit('saved', values);
      });
    } else {
      emit('saved', values);
    }

    loading = false;
  }
</script>

<style lang="less" scoped></style>
