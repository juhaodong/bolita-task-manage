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
  import { getTableHeader, setTableHeader } from '@/api/dataLayer/common/TableHeader';
  import _, { differenceWith, sortBy } from 'lodash';
  import {
    allTitleGroup,
    containerForecastTitleGroup,
    operationTitleGroup,
  } from '@/api/dataLayer/common/TitleGroup';

  interface Props {
    allColumns?: any;
    type?: any;
  }
  const emit = defineEmits(['saved']);
  let allHeaderList = $ref([]);
  let currentHeaderList = $ref([]);
  const prop = defineProps<Props>();
  const waitForUseList = computed(() => {
    if (prop.type === 'mission' || prop.type === 'carDetail') {
      return differenceWith(allTitleGroup, currentHeaderList, _.isEqual);
    } else if (prop.type === 'operation') {
      return differenceWith(operationTitleGroup, currentHeaderList, _.isEqual);
    } else if (prop.type === 'containerForecast') {
      return differenceWith(containerForecastTitleGroup, currentHeaderList, _.isEqual);
    }
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
  async function reload() {
    allHeaderList = prop.allColumns.slice(1);
    currentHeaderList = await getTableHeader(prop.type);
  }
  async function save() {
    await setTableHeader(prop.type, currentHeaderList);
    emit('saved');
  }
</script>

<style lang="less" scoped></style>
