import { defineStore } from 'pinia';
import { saveFiles } from '@/api/newDataLayer/Notify/Notify';

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
        let newFiles = '';
        newFiles = await saveFiles(value.files);
        this.resolve({
          checkPassed: true,
          files: this.currentFileUrls ? this.currentFileUrls + ',' + newFiles : newFiles,
        });
        this.show = false;
      }
    },
    async deleteFile(file) {
      console.log(this.currentFileUrls, 'file');
      const allFiles = this.currentFileUrls.split(',');
      if (this.resolve != null) {
        this.resolve({
          checkPassed: true,
          files: allFiles.filter((it) => it !== file).join(','),
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
