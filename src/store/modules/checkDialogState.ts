import { defineStore } from 'pinia';
import { listUser, PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';
import { getFileListUrl } from '@/store/plugins/firebase';

export interface CheckResult {
  warehouseId: string;
  checkPassed: boolean;
  note: string;
  files: string[];
}
export const useCheckDialog = defineStore('checkDialog', {
  state(): {
    resolve: ((value: CheckResult) => void) | null;
    show: boolean;
    title: string;
    warehouses: any[];
  } {
    return {
      resolve: null,
      show: false,
      title: '请确定是否通过本审核？',
      warehouses: [],
    };
  },
  actions: {
    async check(title = '请确定是否通过本审核'): Promise<CheckResult> {
      this.warehouses = (await listUser(PermissionEnums.Warehouse)).result.map((it) => ({
        label: it.realName,
        value: it.id,
      }));
      this.title = title;
      this.show = true;
      return new Promise((resolve) => {
        this.resolve = resolve;
      });
    },
    async confirm(value: any) {
      if (this.resolve != null) {
        if (value?.files?.length > 0) {
          value.files = await getFileListUrl(value.files);
        }
        this.resolve({
          checkPassed: true,
          files: [],
          note: '',
          ...value,
        });
        this.show = false;
      }
    },
    close() {
      this.show = false;
      this.resolve = null;
    },
    cancel(value) {
      if (this.resolve != null) {
        this.resolve(
          Object.assign({}, { checkPassed: false, files: [], note: '', warehouseId: '' }, value)
        );
        this.show = false;
      }
    },
  },
});
