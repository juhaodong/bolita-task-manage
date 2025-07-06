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
      <Draggable
        v-model="currentHeaderList"
        animation="300"
        item-key="id"
        @end="onDragEnd"
      >
        <template #item="{ element }">
          <n-tag
            :type="element.tagType"
            class="ml-2 mt-2"
            round
            size="large"
            @click="deletedTag(element)"
          >
            {{ element.title }}
          </n-tag>
        </template>
      </Draggable>
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
  import { useUserStore } from '@/store/modules/user';
  import Draggable from 'vuedraggable';

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
  }
  function deletedTag(item) {
    currentHeaderList = currentHeaderList.filter((it) => it.title !== item.title);
  }

  function onDragEnd() {
    // The currentHeaderList is already updated by v-model
    // No additional action needed here
  }
  let groupInfo = $ref({});
  async function reload() {
    allHeaderList = await getTableHeaderItemList();
    groupInfo = await getTableHeaderGroupItemList(prop.type);
    currentHeaderList = JSON.parse(groupInfo.headerItemJson);
  }
  async function save() {
    if (groupInfo) {
      groupInfo.tableHeaderItemIds = currentHeaderList ? currentHeaderList.map((it) => it.id) : [];
      groupInfo.headerItemJson = JSON.stringify(currentHeaderList);
    } else {
      groupInfo = {
        name: prop.type,
        userId: useUserStore().info.id,
        tableHeaderItemIds: currentHeaderList.map((it) => it.id),
        headerItemJson: JSON.stringify(currentHeaderList),
      };
    }
    await addOrUpdateTableHeaderGroupItem(groupInfo);
    emit('saved');
  }
</script>

<style lang="less" scoped></style>
