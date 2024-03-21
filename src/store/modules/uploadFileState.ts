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
    disableClick: boolean;
  } {
    let disableClick;
    if (!disableClick) {
      disableClick = false;
    }
    return {
      resolve: null,
      show: false,
      title: '请选择要上传的文件？',
      currentFileUrls: [],
      editable: true,
      disableClick: false,
    };
  },
  actions: {
    showUploadBtn(boolean) {
      this.disableClick = boolean;
    },
    async upload(
      currentFileUrls: string[],
      title = '请选择要上传的文件',
      editable = true
    ): Promise<UploadResult> {
      this.title = title ?? '请选择要上传的文件';
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
          files: this.currentFileUrls ? this.currentFileUrls.concat(value.files) : value.files,
        });
        this.show = false;
      }
    },
    async deleteFile(file) {
      if (this.resolve != null) {
        this.resolve({
          checkPassed: true,
          files: this.currentFileUrls.filter((it) => it !== file),
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
