<template>
  <n-card v-if="notifyId" size="small" style="max-width: 800px">
    <n-page-header>
      <template #title> 到货预报详情</template>
    </n-page-header>
    <n-grid x-gap="12" cols="5">
      <n-gi span="3">
        <n-descriptions
          bordered
          :column="2"
          size="small"
          title="基础信息"
          class="mt-8"
          label-placement="top"
        >
          <n-descriptions-item label="预报ID">
            {{ notifyId }}
          </n-descriptions-item>
          <n-descriptions-item label="到货仓库ID">
            {{ notifyDetail?.arriveWarehouseId }}
          </n-descriptions-item>
          <n-descriptions-item label="到货类型">
            {{ notifyDetail?.arriveMedia }}
          </n-descriptions-item>

          <n-descriptions-item label="已到货/总箱数">
            {{ notifyDetail?.arrivedCount }}/{{ notifyDetail?.totalCount }}
          </n-descriptions-item>
          <n-descriptions-item label="预计到仓时间">
            {{ dayjs(notifyDetail?.planArriveDateTime).format('YYYY-MM-DD HH:mm') }}
          </n-descriptions-item>
          <n-descriptions-item label="状态">
            {{ notifyDetail?.status }}
          </n-descriptions-item>
          <n-descriptions-item label="备注">
            {{ notifyDetail?.note }}
          </n-descriptions-item>
        </n-descriptions>
        <n-descriptions
          class="mt-8"
          v-if="notifyDetail?.arriveMedia === ArriveMediaTypes.Container"
          bordered
          :column="2"
          size="small"
          title="货柜信息"
          label-placement="top"
        >
          <n-descriptions-item label="预报ID">
            {{ arriveDetail?.containerNo }}
          </n-descriptions-item>
          <n-descriptions-item label="车牌号">
            {{ arriveDetail?.carNo }}
          </n-descriptions-item>
          <n-descriptions-item label="货柜尺寸">
            {{ arriveDetail?.containerSize }}
          </n-descriptions-item>
          <n-descriptions-item label="货柜类型">
            {{ arriveDetail?.containerType }}
          </n-descriptions-item>
        </n-descriptions>
      </n-gi>
      <n-gi span="2">
        <n-h4>变动时间线</n-h4>

        <n-timeline>
          <n-timeline-item
            :key="log.id"
            v-for="log in changeLog"
            :type="log.type"
            :title="log.title"
            :content="log.content"
            :time="log.time"
          >
            <template #header>
              <div class="flex items-center">
                <n-text strong>
                  {{ log.title }}
                </n-text>
                <div class="flex-grow"></div>
                <div>
                  <n-text depth="2">
                    {{ log.content }}
                  </n-text>
                </div>
              </div>
            </template>
            <div class="mt-4">{{ log.note || '暂无留言' }} </div>
            <div class="px-2 py-2 mt-4">
              <n-image-group>
                <n-space>
                  <n-image
                    width="72"
                    src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg"
                  />
                  <n-image
                    width="72"
                    src="https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg"
                  />
                </n-space>
              </n-image-group>
            </div>
          </n-timeline-item>
        </n-timeline>
      </n-gi>
    </n-grid>
  </n-card>
</template>

<script setup>
  import { ArriveMediaTypes, getNotifyById } from '@/api/notify/list';
  import { watchEffect } from 'vue';
  import dayjs from 'dayjs';

  const props = defineProps({ notifyId: String });
  let notifyDetail = $ref(null);

  watchEffect(async () => {
    if (props.notifyId != null) {
      notifyDetail = await getNotifyById(props.notifyId);
      console.log(notifyDetail);
    }
  });
  const changeLog = $computed(() => {
    return notifyDetail?.changeLogs.map((it) => ({
      id: it.id,
      time: dayjs(it.timestamp).format('YYYY-MM-DD HH:mm:ss'),
      type: 'info',
      title: '操作人:' + it.userId,
      content: it.fromStatus + '->' + it.toStatus,
      note: it.note,
    }));
  });
  const arriveDetail = $computed(() => {
    return notifyDetail?.arriveDetail;
  });
</script>

<style scoped></style>
