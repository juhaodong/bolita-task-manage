<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @reset="handleReset" @submit="handleSubmit">
      <template #statusSlot="{ model, field }">
        <n-input v-model:value="model[field]" />
      </template>
    </BasicForm>
    <div class="my-2"></div>
    <BasicTable
      ref="actionRef"
      :actionColumn="actionColumn"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      :scroll-x="1090"
      @update:checked-row-keys="onCheckedRow"
    >
      <template #tableTitle>
        <n-button type="primary" @click="addTable">
          <template #icon>
            <n-icon>
              <PlusOutlined />
            </n-icon>
          </template>
          新建
        </n-button>
      </template>

      <template #toolbar>
        <n-button type="primary" @click="reloadTable">刷新数据</n-button>
      </template>
    </BasicTable>

    <n-modal v-model:show="showModal" :show-icon="false" preset="dialog" title="新建索赔">
      <new-damage-claim-form @submit="createNewDamageClaim" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  // import { useMessage } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm } from '@/components/Form';
  import { columns } from './columns';
  import { PlusOutlined } from '@vicons/antd';
  import { useRouter } from 'vue-router';
  import NewDamageClaimForm from '@/views/bolita-views/damageClaim/DamageClaimFormPage/NewDamageClaimForm.vue';
  import { creatDamageClaim, getDamageClaimList } from '@/api/damageClaim/list';
  import { handleRequest } from '@/utils/utils';

  const router = useRouter();
  const formRef: any = ref(null);
  // const message = useMessage();
  const actionRef = ref();

  const showModal = ref(false);
  const formBtnLoading = ref(false);
  const formParams = reactive({
    name: '',
    address: '',
    date: null,
  });

  const params = ref({
    pageSize: 5,
    name: 'xiaoMa',
  });

  const actionColumn = reactive({
    width: 220,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '详情',
            onClick: handleEdit.bind(null, record),
            ifShow: () => {
              return true;
            },
            auth: ['basic_list'],
          },
          {
            label: '审核',
            onClick: handleDelete.bind(null, record),
            // 根据业务控制是否显示 isShow 和 auth 是并且关系
            ifShow: () => {
              return record.status == '审核中';
            },
            // 根据权限控制是否显示: 有权限，会显示，支持多个
            auth: ['basic_list'],
          },
        ],
        dropDownActions: [
          {
            label: '编辑',
            onClick: handleEdit.bind(null, record),
            ifShow: () => {
              return true;
            },
            auth: ['basic_list'],
          },
          {
            label: '取消预报',
          },
        ],
        select: (key) => {
          window['$message'].info(`您点击了，${key} 按钮`);
        },
      });
    },
  });

  function addTable() {
    showModal.value = true;
  }

  const loadDataTable = async () => {
    return await getDamageClaimList({});
  };

  function onCheckedRow(rowKeys) {
    console.log(rowKeys);
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  async function createNewDamageClaim(info) {
    const res = await creatDamageClaim(info);
    await handleRequest(res, () => {
      showModal.value = false;
      reloadTable();
    });
  }

  function confirmForm(e) {
    e.preventDefault();
    formBtnLoading.value = true;
    formRef.value.validate((errors) => {
      if (!errors) {
        window['$message'].success('新建成功');
        setTimeout(() => {
          showModal.value = false;
          reloadTable();
        });
      } else {
        window['$message'].error('请填写完整信息');
      }
      formBtnLoading.value = false;
    });
  }

  function handleEdit(record: Recordable) {
    console.log('点击了编辑', record);
    router.push({ name: 'basic-info', params: { id: record.id } });
  }

  function handleDelete() {
    window['$message'].info('点击了审核');
  }

  function handleSubmit(values: Recordable) {
    console.log(values);
    reloadTable();
  }

  function handleReset(values: Recordable) {
    console.log(values);
  }
</script>

<style lang="less" scoped></style>
