<template>
  <n-card class="proCard">
    <n-form ref="formRef" :label-width="80" :model="formValue" :rules="rules">
      <n-form-item label="订单号" path="orderID">
        <n-input v-model:value="formValue.orderID" placeholder="订单号" />
      </n-form-item>
      <n-form-item label="追踪单号" path="trackId">
        <n-input v-model:value="formValue.trackId" placeholder="追踪单号" />
      </n-form-item>
      <n-form-item label="货物状态" path="goodsStatus">
        <n-input v-model:value="formValue.goodsStatus" placeholder="货物状态" />
      </n-form-item>
      <n-form-item label="申请金额" path="applicationsAmount">
        <n-input-number v-model:value="formValue.applicationsAmount" placeholder="申请金额" />
      </n-form-item>
      <n-form-item label="附件" path="files">
        <n-upload v-model:file-list="formValue.files" :default-upload="false" multiple>
          <n-upload-dragger>
            <div style="margin-bottom: 12px">
              <n-icon :depth="3" size="48">
                <archive />
              </n-icon>
            </div>
            <n-text style="font-size: 16px"> 点击或者拖动文件到该区域来上传</n-text>
            <n-p depth="3" style="margin: 8px 0 0 0"> 请仔细检查您提交的文件 </n-p>
          </n-upload-dragger>
        </n-upload>
      </n-form-item>
      <n-form-item>
        <n-button attr-type="button" type="primary" @click="submitChange">确认</n-button>
      </n-form-item>
    </n-form>
  </n-card>
</template>
<script lang="ts" setup>
  import { Ref, ref } from 'vue';
  import { uploadFile } from '@/plugins/firebase';

  const formValue: Ref<{
    orderID: string;
    trackId: string;
    goodsStatus: string;
    applicationsAmount: number;
    files: any[];
  }> = ref({
    orderID: '',
    trackId: '',
    goodsStatus: '',
    applicationsAmount: 0,
    files: [],
  });

  const rules = ref({
    orderID: {},
    trackId: {},
    goodsStatus: {},
    applicationsAmount: {},
    files: {},
  });
  async function submitChange() {
    console.log(formValue.value, 'value');
    for (const key in formValue.value.files) {
      formValue.value.files[key] = await uploadFile(formValue.value.files[key].file);
    }
    emit('submit', formValue.value);
  }
  const emit = defineEmits(['submit']);
</script>

<style lang="less" scoped></style>
