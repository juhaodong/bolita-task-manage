<template>
  <n-card class="proCard">
    <n-select
      v-if="checkEditType"
      v-model:value="selectedType"
      :options="UserTypeByArray"
      class="mb-4"
    />
    <n-tree
      :data="data"
      :default-checked-keys="selectedPower"
      :default-expanded-keys="defaultExpandedKeys"
      :selectable="false"
      block-line
      cascade
      checkable
      @update:checked-keys="updateCheckedKeys"
    />
    <n-button @click="savePower">保存</n-button>
  </n-card>
</template>
<script lang="ts" setup>
  import { powerList, UserTypeByArray } from '@/views/newViews/UserManage/columns';
  import { TreeOption } from 'naive-ui';
  import { $ref } from 'vue/macros';
  import { UserManager } from '@/api/dataLayer/modules/user/user';
  import { computed } from 'vue';
  import { setPowerType } from '@/api/dataLayer/common/power';

  interface Prop {
    auth?: any;
  }
  let selectedType = $ref('');
  const props = defineProps<Prop>();
  const data = $ref(powerList);
  let selectedList = $ref([]);
  const checkEditType = computed(() => {
    return props.auth.length <= 0;
  });
  function updateCheckedKeys(keys: Array<string | number>, options: Array<TreeOption | null>) {
    selectedList = options;
  }
  const selectedPower = computed(() => {
    if (props.auth.authPower) {
      return props.auth.authPower.filter((it) => !it?.children).map((it) => it.key) ?? [];
    } else {
      return [];
    }
  });
  const defaultExpandedKeys = computed(() => {
    if (props.auth.authPower) {
      return props.auth.authPower.filter((it) => it?.children).map((it) => it.key) ?? [];
    } else {
      return [];
    }
  });
  const emit = defineEmits(['saved']);
  async function savePower() {
    if (checkEditType.value) {
      await setPowerType(selectedType, selectedList);
    } else {
      const realInfo = props.auth;
      realInfo.authPower = selectedList;
      await UserManager.edit(realInfo, realInfo.id);
    }
    emit('saved');
  }
</script>

<style lang="less" scoped></style>
