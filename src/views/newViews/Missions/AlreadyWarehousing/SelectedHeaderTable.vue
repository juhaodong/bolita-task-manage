<template>
  <n-card className="proCard">
    <n-card :bordered="false" class="mt-4" embedded title="💴 待使用字段">
      <n-tag
        v-for="(item, index) in waitForUseList"
        :key="index"
        :type="item.userByHeader ? 'success' : 'default'"
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
  import _, { differenceWith } from 'lodash';

  interface Props {
    allColumns?: any;
  }
  const emit = defineEmits(['saved']);
  let allHeaderList = $ref([]);
  let currentHeaderList = $ref([]);
  const prop = defineProps<Props>();
  const waitForUseList = computed(() => {
    const res = prop.allColumns.slice(1).map((x) => {
      return { title: x.title, key: x.key };
    });
    return differenceWith(res, currentHeaderList, _.isEqual);
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
  async function reload() {
    allHeaderList = prop.allColumns.slice(1);
    currentHeaderList = await getTableHeader('missions');
    console.log(currentHeaderList, 'list');
  }
  async function save() {
    currentHeaderList = currentHeaderList.map((it) => {
      return { title: it.title, key: it.key };
    });
    await setTableHeader('missions', currentHeaderList);
    emit('saved');
  }
</script>

<style lang="less" scoped></style>
