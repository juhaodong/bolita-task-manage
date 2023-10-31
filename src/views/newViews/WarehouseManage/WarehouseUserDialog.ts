import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useEditOrganizationUserDialog = defineStore('warehouse-user', () => {
  const showDialog = ref(false);
  const userList = ref<any[]>([]);
  const editingId = ref('');

  function startEdit(warehouseId) {
    editingId.value = warehouseId;
    showDialog.value = true;
  }

  return {
    showDialog,
    userList,
    editingId,
    startEdit,
  };
});
