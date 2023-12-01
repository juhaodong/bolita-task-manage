<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
    </loading-frame>
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { CarpoolManager } from '@/api/dataLayer/modules/logistic/carpool';
  import { schemas } from '../columns';
  import { CarStatus } from '@/views/newViews/OutboundPlan/columns';
  import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outboundDetail';

  interface Props {
    model?: any;
    mergedOutIds?: any[];
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    loading = true;
    await safeScope(async () => {
      if (prop?.model?.id) {
        await CarpoolManager.editInternal(values, prop.model.id);
      } else {
        if (prop.mergedOutIds) {
          const currentList: any[] = [];
          for (const checkedRow of prop.mergedOutIds) {
            currentList.push(await OutBoundDetailManager.getById(checkedRow));
          }
          const id = await CarpoolManager.addInternal({}, currentList);
          for (const checkedRow of prop.mergedOutIds) {
            await OutBoundDetailManager.editInternal(
              {
                carpoolId: id,
                carStatus: CarStatus.Booked,
              },
              checkedRow
            );
          }
          await CarpoolManager.editInternal(values, id);
        }
      }
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
