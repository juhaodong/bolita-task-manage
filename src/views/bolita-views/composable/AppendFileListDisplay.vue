<script lang="ts" setup>
  import { getFileNameAndTypeForFirebaseLink } from '@/store/utils/utils';
  import { FileTextOutlined, LinkOutlined } from '@vicons/antd';
  import { downloadFile } from '@/store/plugins/firebase';

  defineProps({ filesUrl: Array, disableClick: null });
</script>

<template>
  <n-list v-if="filesUrl?.length > 0" hoverable>
    <n-list-item v-for="f in filesUrl" :key="f">
      <template #prefix>
        <n-icon size="18">
          <file-text-outlined />
        </n-icon>
      </template>
      {{ getFileNameAndTypeForFirebaseLink(f).name }}
      <template #suffix>
        <n-button :disabled="disableClick" icon-placement="right" @click="downloadFile(f)"
          >下载
          <template #icon>
            <n-icon> <link-outlined /> </n-icon>
          </template>
        </n-button>
      </template>
    </n-list-item>
  </n-list>
  <div v-else class="py-16">
    <n-empty description="暂时没有附件" />
  </div>
</template>

<style lang="less" scoped></style>
