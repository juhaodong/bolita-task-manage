<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="reset">
      <template #statusSlot="{ model, field }">
        <n-input v-model:value="model[field]" />
      </template>
    </BasicForm>
    <div class="my-2"></div>
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      @update:checked-row-keys="onCheckedRow"
      :scroll-x="1090"
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

    <n-modal v-model:show="showModal" :show-icon="false" preset="dialog" title="新建用户">
      <new-user-form
        :is-new="isNew"
        :user-info="currentUserInfo"
        @submit="handleCreateFromSubmit"
      />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  // import { useMessage } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form';
  import { columns } from './columns';
  import { PlusOutlined } from '@vicons/antd';
  import { createUser, listUser, PermissionEnums, updateUser } from '@/api/user/baseUser';
  import NewUserForm from '@/views/bolita-views/user/newUserForm/NewUserForm.vue';
  import { handleRequest } from '@/utils/utils';
  import { $ref } from 'vue/macros';

  const schemas: FormSchema[] = [
    {
      field: 'id',
      component: 'NInput',
      label: '仓库ID',
      componentProps: {
        placeholder: '请输入仓库ID',
      },
    },
  ];
  let isNew = $ref(false);
  let currentUserInfo: any = $ref(null);

  const actionRef = ref();
  const showModal = ref(false);

  let searchCondition: any = $ref(null);

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
            label: '编辑',
            onClick: handleEdit.bind(null, record),
            ifShow: () => {
              return true;
            },
            auth: ['basic_list'],
          },
        ],
      });
    },
  });

  const [register, {}] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 80,
    schemas,
  });

  function addTable() {
    isNew = true;
    currentUserInfo = null;
    showModal.value = true;
  }

  const loadDataTable = async () => {
    const { result } = await listUser(PermissionEnums.Operator, searchCondition?.id);
    return result;
  };

  function onCheckedRow(rowKeys) {
    console.log(rowKeys);
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  function reset() {
    searchCondition = null;
    reloadTable();
  }
  function handleEdit(record: Recordable) {
    isNew = false;
    showModal.value = true;
    currentUserInfo = record;
    console.log('点击了编辑', record);
  }

  function handleSubmit(values: Recordable) {
    searchCondition = values;
    console.log(values);
    reloadTable();
  }

  async function handleCreateFromSubmit(value) {
    if (isNew) {
      const res = await createUser(
        value.username,
        value.realName,
        value.password,
        PermissionEnums.Warehouse
      );
      await handleRequest(res, (r) => {
        console.log(r);
        showModal.value = false;
        reloadTable();
      });
    } else {
      const res = await updateUser(Object.assign({}, currentUserInfo, value));
      await handleRequest(res, (r) => {
        console.log(r);
        showModal.value = false;
        reloadTable();
      });
    }
  }
</script>

<style lang="less" scoped></style>
