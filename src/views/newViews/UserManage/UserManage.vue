<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar
      v-if="finished"
      :default-value-model="filterObj"
      :form-fields="filters"
      @clear="updateFilter(null)"
      @submit="updateFilter"
    >
      <n-button size="small" type="primary" @click="showAdd">新建用户</n-button>
      <n-button size="small" type="primary" @click="powerManage">权限管理</n-button>
    </filter-bar>
    <div class="my-2"></div>
    <BasicTable
      ref="actionRef"
      v-model:checked-row-keys="checkedRows"
      :action-column="actionColumn"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
    />

    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="新建/编辑用户"
    >
      <new-user :model="currentModel" @saved="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="showPowerModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="权限管理"
    >
      <power-list :auth="authInfo" @saved="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="showConfirmDialog"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 400px; max-width: 400px"
      title="请确认"
    >
      <confirm-dialog :title="'您确定要删除吗？'" @saved="confirmRemove" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { filters } from './columns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';
  import NewUser from '@/views/newViews/UserManage/NewUser.vue';
  import PowerList from '@/views/newViews/UserManage/PowerList.vue';
  import { NButton } from 'naive-ui';
  import { timeColumn } from '@/views/bolita-views/composable/useableColumns';
  import Delete16Filled from '@vicons/fluent/es/Delete16Filled';
  import ConfirmDialog from '@/views/newViews/Common/ConfirmDialog.vue';
  import { deleteUser, getUserById, getUserList } from '@/api/newDataLayer/User/User';

  interface Prop {
    belongsToId?: string;
  }
  const columns = [
    {
      title: '用户名',
      key: 'userName',
    },
    {
      title: '名称',
      key: 'realName',
    },
    {
      title: '公司',
      key: 'company',
    },
    {
      title: '部门',
      key: 'department',
    },
    {
      title: '用户类型',
      key: 'userType',
    },
    {
      title: '登录名',
      key: 'loginName',
    },
    {
      title: '密码',
      key: 'password',
    },
    {
      title: '查看权限',
      key: 'actions',
      render(row) {
        return h(
          NButton,
          {
            strong: true,
            tertiary: true,
            size: 'small',
            onClick: () => {
              console.log(row, 'row');
              authInfo = row;
              showPowerModal = true;
            },
          },
          { default: () => '查看' }
        );
      },
    },
    timeColumn(),
  ];
  let authInfo = $ref([]);
  let finished = $ref(false);
  let showPowerModal = $ref(false);
  let showConfirmDialog = $ref(false);
  let removeId = '';
  const props = defineProps<Prop>();
  onMounted(() => {
    if (props.belongsToId) {
      filterObj = { belongsToId: props.belongsToId };
    }
    finished = true;
  });
  const showModal = ref(false);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);

  async function startEdit(id) {
    currentModel = await getUserById(id);
    currentModel.customerIds = currentModel.customerIds.split(',');
    showModal.value = true;
  }

  const loadDataTable = async () => {
    return await getUserList();
  };

  let filterObj: any | null = $ref(null);

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  function showAdd() {
    currentModel = null;
    if (props.belongsToId) {
      currentModel = { belongsToId: props.belongsToId };
    }
    showModal.value = true;
  }

  async function confirmRemove() {
    await deleteUser(removeId);
    reloadTable();
  }

  const actionRef = ref();

  function powerManage() {
    authInfo = [];
    showPowerModal = true;
  }

  function reloadTable() {
    actionRef.value.reload();
    showPowerModal = false;
    showConfirmDialog = false;
    showModal.value = false;
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 60,
    render(record: any) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '修改',
            icon: DocumentEdit16Filled,
            onClick() {
              startEdit(record.id);
            },
          },
          {
            label: '删除',
            icon: Delete16Filled,
            async onClick() {
              showConfirmDialog = true;
              removeId = record.id;
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
