import { defineStore } from 'pinia';
import { getFileListUrl } from '@/store/plugins/firebase';

export interface UploadResult {
  checkPassed: boolean;
  files: string[];
}

export const useUploadDialog = defineStore('uploadFileDialog', {
  state(): {
    resolve: ((value: UploadResult) => void) | null;
    show: boolean;
    editable: boolean;
    currentFileUrls: string[];
    title: string;
  } {
    return {
      resolve: null,
      show: false,
      title: '请选择要上传的文件？',
      currentFileUrls: [],
      editable: true,
    };
  },
  actions: {
    async upload(
      currentFileUrls: string[],
      title = '请选择要上传的文件',
      editable = true
    ): Promise<UploadResult> {
      this.title = title;
      this.editable = editable;
      this.currentFileUrls = currentFileUrls;
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
          files: value.files,
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
        this.resolve(Object.assign({}, { checkPassed: false, files: [] }, value));
        this.show = false;
      }
    },
  },
});
