<template>
  <n-card class="proCard">
    <n-tree :data="data" :selectable="false" block-line cascade checkable />
  </n-card>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { powerList } from '@/views/newViews/UserManage/columns';

  export default defineComponent({
    setup() {
      return {
        data: powerList,
      };
    },
  });
</script>

<style lang="less" scoped></style>
