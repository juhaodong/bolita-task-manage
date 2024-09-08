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
      key-field="itemKey"
      label-field="label"
      @update:checked-keys="updateCheckedKeys"
    />
    <n-button @click="savePower">保存</n-button>
  </n-card>
</template>
<script lang="ts" setup>
  import { UserTypeByArray } from '@/views/newViews/UserManage/columns';
  import { TreeOption } from 'naive-ui';
  import { $ref } from 'vue/macros';
  import { computed, onMounted, ref, watch } from 'vue';
  import { flatChildrenById, getPowerItemsList } from '@/api/newDataLayer/Power/PowerItems';
  import { addOrUpdatePowerType, getPowerTypeByKey } from '@/api/newDataLayer/Power/Power';
  import { addOrUpdateUser } from '@/api/newDataLayer/User/User';

  interface Prop {
    auth?: any;
  }
  let selectedType = ref('');
  let userTypePowerKeysList = $ref([]);
  let powerType = ref({});
  const props = defineProps<Prop>();
  let data = $ref([]);
  let selectedList = $ref([]);
  const checkEditType = computed(() => {
    return props.auth.length <= 0;
  });
  function updateCheckedKeys(keys: Array<string | number>, options: Array<TreeOption | null>) {
    console.log(options, 'options');
    selectedList = options;
  }

  let loading = $ref(false);

  async function setTimeSleep() {
    loading = true;
    await setTimeout(() => {}, 50);
    loading = false;
  }

  onMounted(async () => {
    data = await getPowerItemsList();
    console.log(data, 'data');
  });

  watch(
    selectedType,
    async (value) => {
      powerType.value = await getPowerTypeByKey(value);
      console.log(powerType.value, 'value');
      userTypePowerKeysList = powerType.value?.list;
      await setTimeSleep();
    },
    { immediate: true, deep: true }
  );
  const selectedPower = computed(() => {
    if (props.auth.powerTypeItems) {
      return (
        props.auth.powerTypeItems
          .filter((it) => it?.children.length === 0)
          .map((it) => it.itemKey) ?? []
      );
    } else {
      return (
        userTypePowerKeysList.filter((it) => it?.children.length === 0).map((it) => it.itemKey) ??
        []
      );
    }
  });
  const defaultExpandedKeys = computed(() => {
    if (props.auth.powerTypeItems) {
      return (
        props.auth.powerTypeItems.filter((it) => it?.children.length > 0).map((it) => it.itemKey) ??
        []
      );
    } else {
      return (
        userTypePowerKeysList.filter((it) => it?.children.length > 0).map((it) => it.itemKey) ?? []
      );
    }
  });
  const emit = defineEmits(['saved']);
  async function savePower() {
    if (checkEditType.value) {
      const res = UserTypeByArray.find((it) => it.value === selectedType.value);
      const obj = {
        name: res.label,
        typeKey: res.value,
        powerTypeItemIds:
          selectedList.length > 0
            ? selectedList.map((it) => it.id)
            : powerType.value.list.map((it) => it.id),
      };
      if (powerType.value.id) {
        obj.id = powerType.value.id;
      }
      await addOrUpdatePowerType(obj);
    } else {
      const realInfo = props.auth;
      realInfo.powerTypeItemIds = flatChildrenById(selectedList);
      await addOrUpdateUser(realInfo);
    }
    emit('saved');
  }
</script>

<style lang="less" scoped></style>
