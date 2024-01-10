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
  import { FormFields, safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { CarpoolManager } from '@/api/dataLayer/modules/logistic/carpool';
  import { CarStatus } from '@/views/newViews/OutboundPlan/columns';
  import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outboundDetail';
  import { safeSumBy } from '@/store/utils/utils';

  interface Props {
    model?: any;
    mergedOutIds?: any[];
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();

  const emit = defineEmits(['saved']);

  const schemas: FormFields = [
    {
      field: 'note',
      label: '备注',
      required: false,
    },
    {
      field: 'note',
      label: '备注',
      required: false,
    },
    {
      field: 'note',
      label: '备注',
      required: false,
    },
    {
      field: 'note',
      label: '备注',
      required: false,
    },
    {
      field: 'note',
      label: '备注',
      required: false,
    },
    {
      field: 'note',
      label: '备注',
      required: false,
    },
    {
      field: 'note',
      label: '备注',
      required: false,
    },
    {
      field: 'note',
      label: '备注',
      required: false,
    },
    {
      field: 'note',
      label: '备注',
      required: false,
    },
    {
      field: 'note',
      label: '备注',
      required: false,
    },
    {
      field: 'note',
      label: '备注',
      required: false,
    },
  ];

  async function handleSubmit(values: any) {
    loading = true;
    await safeScope(async () => {
      console.log(values, 'values');
      if (prop?.model?.id) {
        await CarpoolManager.editInternal(values, prop.model.id);
      } else {
        if (prop.mergedOutIds) {
          const currentList: any[] = [];
          for (const checkedRow of prop.mergedOutIds) {
            currentList.push(await OutBoundDetailManager.getById(checkedRow));
          }
          console.log(currentList, 'List');
          values.totalTray = safeSumBy(currentList, 'trayNum');
          values.totalNumber = safeSumBy(currentList, 'number');
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
