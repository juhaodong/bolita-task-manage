<script setup lang="ts">
  import { BasicTable, TableAction } from '@/components/Table';
  import { computed, h, reactive, ref, watchEffect } from 'vue';
  import { ArriveMediaTypes, getNotifyById, NotifyStatus } from '@/api/notify/notify-api';
  import { NButton } from 'naive-ui';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { handleRequest, toastSuccess } from '@/utils/utils';
  import {
    addNotifyDetail,
    deleteDetailForNotify,
    getTasksForNotify,
  } from '@/api/notify/notify-detail';

  let notifyDetail: any | null = $ref(null);
  const columns = computed(() => {
    const boxField =
      arriveMedia == ArriveMediaTypes.Box ? [{ title: '物流追踪号', key: 'trackingCode' }] : [];
    const trayField =
      arriveMedia == ArriveMediaTypes.Tray
        ? [
            { title: '托盘号（选填）', key: 'trayCode' },
            { title: '托盘长度', key: 'trayLength' },
            { title: '托盘宽度', key: 'trayWidth' },
            { title: '托盘高度', key: 'trayHeight' },
          ]
        : [];
    return [
      {
        title: '到货状态',
        key: 'arrived',
        render(row) {
          return h('div', [
            h(
              NButton,
              {
                type: (row.arrivedCount ?? 0) >= row.count ? 'success' : 'default',
                disabled: notifyDetail?.status !== NotifyStatus.WaitFroArrive,
                onClick() {},
              },
              (row.arrivedCount ?? 0) + '/' + row.count
            ),
          ]);
        },
      },
      { title: '分拣码', key: 'sortCode' },
      ...boxField,
      ...trayField,
      { title: '实重', key: 'actualWeight' },
      { title: '体积', key: 'volume' },
      { title: '长', key: 'length' },
      { title: '宽', key: 'width' },
      { title: '高', key: 'height' },
      { title: 'SKU', key: 'sku' },
    ];
  });

  const addFormField = computed(() => {
    const boxField: FormField[] =
      arriveMedia == ArriveMediaTypes.Box
        ? [
            {
              label: '物流追踪号',
              field: 'trackingCode',
            },
          ]
        : [];
    const trayField =
      arriveMedia == ArriveMediaTypes.Tray
        ? [
            { label: '托盘号（选填）', field: 'trayCode', required: false },
            { label: '托盘长度', field: 'trayLength' },
            { label: '托盘宽度', field: 'trayWidth' },
            { label: '托盘高度', field: 'trayHeight' },
          ]
        : [];
    return [
      { label: '分拣码', field: 'sortCode' },
      { label: '件数', field: 'count' },
      ...boxField,
      ...trayField,
      { label: '实重', field: 'actualWeight' },
      { label: '体积', field: 'volume' },
      { label: '长', field: 'length' },
      { label: '宽', field: 'width' },
      { label: '高', field: 'height' },
      { label: 'SKU', field: 'sku' },
    ];
  });

  const totalRecordCount = computed(() => {
    return notifyDetail?.taskList?.reduce((sum, i) => sum + parseInt(i.count), 0) ?? 0;
  });
  const arriveMedia: ArriveMediaTypes | null = $computed(() => {
    return notifyDetail?.arriveMedia;
  });
  watchEffect(async () => {
    await reload();
  });
  async function reload() {
    if (props.notifyId != null) {
      notifyDetail = await getNotifyById(props.notifyId);
    }
  }
  interface Props {
    notifyId: string;
  }
  const props = defineProps<Props>();
  const actionColumn = reactive({
    width: 100,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '删除',
            popConfirm: {
              title: '您是否确定删除此条记录?',
              async confirm() {
                const res = await deleteDetailForNotify(record.id, props.notifyId);
                await handleRequest(res, () => {
                  tableReload();
                  reload();
                  toastSuccess('删除成功');
                });
              },
            },
          },
        ],
        select: (key) => {
          window['$message'].info(`您点击了，${key} 按钮`);
        },
      });
    },
  });
  let showAdd = $ref(false);
  const loadDataTable = async () => {
    return await getTasksForNotify(props.notifyId);
  };
  const actionRef: null | any = ref(null);

  function tableReload() {
    actionRef.value?.reload();
  }

  const canGoNext = computed(() => {
    return (
      totalRecordCount.value == notifyDetail?.totalCount &&
      notifyDetail?.taskList.length == notifyDetail?.sortingLabelCount
    );
  });
  async function addNewDetailNotify(detailInfo) {
    const res = await addNotifyDetail(detailInfo, props.notifyId);
    await handleRequest(res, () => {
      toastSuccess('添加成功');
      showAdd = false;
      tableReload();
      reload();
    });
  }

  const emit = defineEmits(['next']);
</script>

<template>
  <n-space vertical>
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      :scroll-x="1090"
    >
      <template #tableTitle>
        <n-space>
          <n-button @click="showAdd = true" type="primary"> 添加预报详情 </n-button>
          <n-button> 批量导入 </n-button>
        </n-space>
      </template>
      <template #toolbar> </template>
    </BasicTable>
    <n-space>
      <n-tag
        size="large"
        :type="totalRecordCount == notifyDetail?.totalCount ? 'success' : 'warning'"
      >
        总件数: {{ totalRecordCount }}/{{ notifyDetail?.totalCount }}
      </n-tag>
      <n-tag
        size="large"
        :type="
          notifyDetail?.taskList.length == notifyDetail?.sortingLabelCount ? 'success' : 'warning'
        "
      >
        分拣码数量: {{ notifyDetail?.taskList.length }}/{{ notifyDetail?.sortingLabelCount }}
      </n-tag>
      <n-button @click="emit('next')" :disabled="!canGoNext" type="success"> 下一步 </n-button>
    </n-space>
  </n-space>

  <n-modal preset="dialog" title="添加预报详情" v-model:show="showAdd">
    <n-card>
      <normal-form :form-fields="addFormField" @submit="addNewDetailNotify" />
    </n-card>
  </n-modal>
</template>

<style scoped lang="less"></style>
