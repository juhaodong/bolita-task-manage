<template>
  <n-card className="proCard">
    <n-card :bordered="false" class="mt-4" embedded title="💴 待使用字段">
      <n-tag
        v-for="(item, index) in waitForUseList"
        :key="index"
        :type="item.tagType"
        class="ml-2 mt-2"
        round
        size="large"
        @click="selectedTag(item, index)"
      >
        {{ item.title }}
      </n-tag>
    </n-card>
    <n-card :bordered="false" class="mt-4" embedded title="💴 正在使用字段">
      <n-tag
        v-for="(item, index) in currentHeaderList"
        :key="index"
        :type="item.tagType"
        class="ml-2 mt-2"
        round
        size="large"
        @click="deletedTag(item, index)"
      >
        {{ item.title }}
      </n-tag>
    </n-card>
    <n-space style="float: right">
      <n-button secondary type="warning" @click="save">保存</n-button>
    </n-space>
  </n-card>
</template>
<script lang="ts" setup>
  import { computed, onMounted } from 'vue';
  import { $ref } from 'vue/macros';
  import _, { differenceWith, sortBy } from 'lodash';
  import { getTableHeaderItemList } from '@/api/newDataLayer/Header/Header';
  import {
    addOrUpdateTableHeaderGroupItem,
    getTableHeaderGroupItemList,
  } from '@/api/newDataLayer/Header/HeaderGroup';

  interface Props {
    allColumns?: any;
    type?: any;
  }
  const emit = defineEmits(['saved']);
  let allHeaderList = $ref([]);
  let currentHeaderList = $ref([]);
  const prop = defineProps<Props>();
  const waitForUseList = computed(() => {
    let res = [];
    if (prop.type === 'taskList') {
      res = differenceWith(
        allHeaderList.filter((it) => it.description === 'taskList'),
        currentHeaderList,
        _.isEqual
      );
    } else if (prop.type === 'operation') {
      res = differenceWith(
        allHeaderList.filter((it) => it.description === 'operation'),
        currentHeaderList,
        _.isEqual
      );
      res = sortBy(res, 'sort');
      return res;
    } else if (prop.type === 'containerForecast') {
      res = differenceWith(
        allHeaderList.filter((it) => it.description === 'containerForecast'),
        currentHeaderList,
        _.isEqual
      );
    }
    res = sortBy(res, 'sort');
    return res;
  });
  onMounted(async () => {
    await reload();
  });
  async function selectedTag(item) {
    currentHeaderList.push(item);
    currentHeaderList = sortBy(currentHeaderList, 'sort');
  }
  function deletedTag(item) {
    currentHeaderList = currentHeaderList.filter((it) => it.title !== item.title);
    currentHeaderList = sortBy(currentHeaderList, 'sort');
  }
  let groupInfo = $ref({});
  async function reload() {
    allHeaderList = await getTableHeaderItemList();
    groupInfo = await getTableHeaderGroupItemList(prop.type);
    currentHeaderList = sortBy(groupInfo.tableHeaderItems, 'sort');
  }
  async function save() {
    groupInfo.tableHeaderItemIds = currentHeaderList.map((it) => it.id);
    await addOrUpdateTableHeaderGroupItem(groupInfo);
    emit('saved');
  }
</script>

<style lang="less" scoped></style>
