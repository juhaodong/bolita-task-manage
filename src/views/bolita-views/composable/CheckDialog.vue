<script setup lang="ts">
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { useCheckDialog } from '@/store/modules/checkDialogState';
  import { computed } from 'vue';

  import { getCheckFormField } from '@/api/dataLayer/fieldDefination/form-field-sort-label';

  const checkDialog = useCheckDialog();
  const field = computed(() => getCheckFormField(checkDialog.warehouses));
</script>

<template>
  <n-modal :show="checkDialog.show" @close="checkDialog.close()">
    <n-card :title="checkDialog.title" style="max-width: 700px">
      <normal-form
        :form-fields="field"
        @cancel="checkDialog.cancel"
        @submit="checkDialog.confirm"
        :show-buttons="false"
      >
        <template #extraSubmitButton="{ submit }">
          <n-button @click="submit" type="success">通过审核</n-button>
        </template>
        <template #extraCancelButton="{ cancel }">
          <n-button @click="cancel" type="error">拒绝</n-button>
        </template>
      </normal-form>
    </n-card>
  </n-modal>
</template>

<style scoped lang="less"></style>
