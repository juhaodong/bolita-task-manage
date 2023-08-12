import { defineStore } from 'pinia';
import { getFileListUrl } from '@/store/plugins/firebase';

export interface CheckResult {
  checkPassed: boolean;
  note: string;
  files: string[];
}
export const useCheckDialog = defineStore('checkDialog', {
  state(): {
    resolve: ((value: CheckResult) => void) | null;
    show: boolean;
    title: string;
  } {
    return {
      resolve: null,
      show: false,
      title: '请确定是否通过本审核？',
    };
  },
  actions: {
    async check(title = '请确定是否通过本审核'): Promise<CheckResult> {
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
        this.resolve(Object.assign({}, { checkPassed: false, files: [], note: '' }, value));
        this.show = false;
      }
    },
  },
});
