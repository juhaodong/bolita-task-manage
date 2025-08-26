<script lang="ts" setup>
  import { getFileNameAndTypeForFirebaseLink } from '@/store/utils/utils';
  import { DeleteOutlined, FileTextOutlined, LinkOutlined } from '@vicons/antd';
  import { downloadFile } from '@/store/plugins/firebase';
  import { computed, ref } from 'vue';

  const emit = defineEmits(['deleteFile']);
  const showImagePreview = ref(false);
  const previewImageUrl = ref('');

  interface Props {
    filesUrl?: any;
    disableClick?: boolean;
    showButton?: boolean;
  }
  const props = defineProps<Props>();

  function deleteFile(files) {
    emit('deleteFile', files);
  }

  function previewImage(url) {
    previewImageUrl.value = url;
    showImagePreview.value = true;
  }

  const currentFiles = computed(() => {
    let res = [];
    if (props.filesUrl) {
      res = props.filesUrl.split(',');
    }
    return res;
  });
</script>

<template>
  <n-grid
    v-if="currentFiles?.length > 0"
    :x-gap="12"
    :y-gap="12"
    cols="1 s:2 m:2 l:3 xl:3 2xl:3"
    responsive="screen"
  >
    <n-grid-item v-for="f in currentFiles" :key="f">
      <n-card hoverable>
        <template #cover>
          <div class="card-cover">
            <img
              v-if="getFileNameAndTypeForFirebaseLink(f).type === 'image'"
              :src="f"
              style="
                width: 100%;
                height: 150px;
                object-fit: cover;
                cursor: pointer;
                border-radius: 4px 4px 0 0;
              "
              @click="previewImage(f)"
            />
            <div v-else class="file-icon-container">
              <n-icon size="48">
                <file-text-outlined />
              </n-icon>
              <div class="mt-4">{{ getFileNameAndTypeForFirebaseLink(f).type }}</div>
            </div>
          </div>
        </template>
        <div class="card-actions">
          <n-button :disabled="disableClick" icon-placement="right" @click="downloadFile(f)"
            >下载
            <template #icon>
              <n-icon> <link-outlined /> </n-icon>
            </template>
          </n-button>
          <n-button
            v-if="showButton"
            :disabled="disableClick"
            icon-placement="right"
            @click="deleteFile(f)"
            >删除
            <template #icon>
              <n-icon> <delete-outlined /> </n-icon>
            </template>
          </n-button>
        </div>
      </n-card>
    </n-grid-item>
  </n-grid>
  <div v-else class="py-16">
    <n-empty description="暂时没有附件" />
  </div>

  <!-- Image Preview Modal -->
  <n-modal v-model:show="showImagePreview" preset="card" style="width: auto; max-width: 90%">
    <div style="text-align: center">
      <img :src="previewImageUrl" style="max-width: 100%; max-height: 80vh" />
    </div>
    <div style="text-align: center; margin-top: 16px">
      <n-button @click="showImagePreview = false">关闭</n-button>
    </div>
  </n-modal>
</template>

<style lang="less" scoped>
  .card-cover {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 150px;
    background-color: #f5f5f5;
    border-radius: 4px 4px 0 0;
  }

  .file-icon-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100%;
    color: #666;
  }

  .file-name {
    margin: 8px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-actions {
    display: flex;
    justify-content: center;
    margin-top: 8px;
  }
</style>
