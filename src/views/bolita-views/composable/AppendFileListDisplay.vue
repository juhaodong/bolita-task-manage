<script lang="ts" setup>
  import { getFileNameAndTypeForFirebaseLink } from '@/store/utils/utils';
  import { DeleteOutlined, FileTextOutlined, LinkOutlined } from '@vicons/antd';
  import { downloadFile } from '@/store/plugins/firebase';
  import { computed } from 'vue';

  const emit = defineEmits(['deleteFile']);

  function deleteFile(files) {
    emit('deleteFile', files);
  }
  const currentFiles = computed(() => {
    let res = [];
    if (props.filesUrl) {
      res = props.filesUrl.split(',');
    }
    return res;
  });

  const props = defineProps({ filesUrl: Array, disableClick: null });
</script>

<template>
  <n-list v-if="currentFiles?.length > 0" hoverable>
    <n-list-item v-for="f in currentFiles" :key="f">
      <template #prefix>
        <n-icon size="18">
          <file-text-outlined />
        </n-icon>
      </template>
      {{ getFileNameAndTypeForFirebaseLink(f).name }}
      <template #suffix>
        <div style="display: flex">
          <n-button :disabled="disableClick" icon-placement="right" @click="downloadFile(f)"
            >下载
            <template #icon>
              <n-icon> <link-outlined /> </n-icon>
            </template>
          </n-button>
          <n-button :disabled="disableClick" icon-placement="right" @click="deleteFile(f)"
            >删除
            <template #icon>
              <n-icon> <delete-outlined /> </n-icon>
            </template>
          </n-button>
        </div>
      </template>
    </n-list-item>
  </n-list>
  <div v-else class="py-16">
    <n-empty description="暂时没有附件" />
  </div>
</template>

<style lang="less" scoped></style>
