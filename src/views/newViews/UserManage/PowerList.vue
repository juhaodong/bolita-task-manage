<template>
  <n-card class="proCard">
    <n-select
      v-if="checkEditType"
      v-model:value="selectedType"
      :options="UserTypeByArray"
      class="mb-4"
    />
    <n-tree
      v-if="(!checkEditType || selectedType !== '') && !loading"
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
  import { computed, ref, watch } from 'vue';
  import { getUserTypePowerList, setPowerType } from '@/api/dataLayer/common/power';

  interface Prop {
    auth?: any;
  }
  let selectedType = ref('');
  let userTypePowerKeysList = $ref([]);
  const props = defineProps<Prop>();
  const data = $ref(powerList);
  let selectedList = $ref([]);
  const checkEditType = computed(() => {
    return props.auth.length <= 0;
  });
  function updateCheckedKeys(keys: Array<string | number>, options: Array<TreeOption | null>) {
    selectedList = options;
  }

  let loading = $ref(false);

  async function setTimeSleep() {
    loading = true;
    await setTimeout(() => {}, 50);
    loading = false;
  }

  watch(
    selectedType,
    async (value) => {
      userTypePowerKeysList = await getUserTypePowerList(value);
      await setTimeSleep();
    },
    { immediate: true, deep: true }
  );
  const selectedPower = computed(() => {
    if (props.auth.authPower) {
      return props.auth.authPower.filter((it) => !it?.children).map((it) => it.key) ?? [];
    } else {
      return userTypePowerKeysList.filter((it) => !it?.children).map((it) => it.key) ?? [];
    }
  });
  const defaultExpandedKeys = computed(() => {
    if (props.auth.authPower) {
      return props.auth.authPower.filter((it) => it?.children).map((it) => it.key) ?? [];
    } else {
      return userTypePowerKeysList.filter((it) => it?.children).map((it) => it.key) ?? [];
    }
  });
  const emit = defineEmits(['saved']);
  async function savePower() {
    if (checkEditType.value) {
      await setPowerType(selectedType.value, selectedList);
    } else {
      const realInfo = props.auth;
      realInfo.authPower = selectedList;
      await UserManager.edit(realInfo, realInfo.id);
    }
    emit('saved');
  }
</script>

<style lang="less" scoped></style>
