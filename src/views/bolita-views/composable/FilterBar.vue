<script lang="ts" setup>
  import {
    convertFormFieldToSchema,
    FormField,
  } from '@/views/bolita-views/composable/form-field-type';
  import { FormSchema, useForm } from '@/components/Form';
  import { computed, reactive, ref, watchEffect } from 'vue';
  import { FormFields } from '@/api/dataLayer/common/GeneralModel';
  import { generateOptionFromArray } from '@/store/utils/utils';
  import { $ref } from 'vue/macros';
  import { Delete20Regular, DocumentAdd20Regular } from '@vicons/fluent';

  const form = ref<any>(null);

  interface NormalFormProps {
    formFields: FormFields;
    showButtons?: boolean;
    schemas?: FormSchema[];
    defaultValueModel?: any;
    columns?: any[];
    modelValue?: Array<{ option: string; value: string }>;
    dateRange?: any;
    showAll?: boolean;
  }

  const props = withDefaults(defineProps<NormalFormProps>(), {
    showButtons: true,
    columns: () => [],
    modelValue: () => [],
    dateRange: null,
    showAll: false,
  });

  const emit = defineEmits([
    'submit',
    'cancel',
    'clear',
    'update:modelValue',
    'filter-change',
    'update:dateRange',
    'update:showAll',
  ]);

  let filterItems = $ref<Array<{ option: string; value: string }>>(props.modelValue || []);
  let showAddFilterDialog = $ref(false);
  let localDateRange = $ref(props.dateRange);
  let localShowAll = $ref(props.showAll);
  let selectedFilterOptions = $ref<string[]>([]);

  // Watch for changes in the modelValue prop
  watchEffect(() => {
    filterItems = props.modelValue || [];
  });

  // Watch for changes in the filterItems and emit update event
  watchEffect(() => {
    emit('update:modelValue', filterItems);
  });

  // Watch for changes in the dateRange prop
  watchEffect(() => {
    localDateRange = props.dateRange;
  });

  // Watch for changes in the showAll prop
  watchEffect(() => {
    localShowAll = props.showAll;
  });

  // Watch for changes in the local dateRange and emit update event
  watchEffect(() => {
    emit('update:dateRange', localDateRange);
  });

  // Watch for changes in the local showAll and emit update event
  watchEffect(() => {
    emit('update:showAll', localShowAll);
  });

  const realOptions = computed(() => {
    if (!props.columns || props.columns.length === 0) return [];
    return generateOptionFromArray(
      props.columns.filter((it) => it.key && it.title).map((it) => it.title)
    );
  });

  // Computed property to filter out already selected options
  const availableColumns = computed(() => {
    if (!props.columns || props.columns.length === 0) return [];
    // Filter out columns that are already selected as filter items
    return props.columns.filter(
      (col) => col.key && col.title && !filterItems.some((item) => item.option === col.title)
    );
  });

  function addFilterItem() {
    showAddFilterDialog = true;
    selectedFilterOptions = [];
  }

  function handleAddFilter(option: string) {
    // Toggle selection of the option
    const index = selectedFilterOptions.indexOf(option);
    if (index === -1) {
      selectedFilterOptions.push(option);
    } else {
      selectedFilterOptions.splice(index, 1);
    }
  }

  function confirmFilters() {
    // Add all selected options as filter items
    for (const option of selectedFilterOptions) {
      filterItems.push({ option, value: '' });
    }
    showAddFilterDialog = false;
  }

  function removeFilterItem(index: number) {
    filterItems.splice(index, 1);
    updateFilterWithItems();
  }

  function updateFilterWithItems() {
    const value = {};

    // Apply filters from filterItems
    filterItems.forEach((item) => {
      if (item.option && item.value) {
        const key = props.columns.find((it) => it.title === item.option)?.key;
        if (key) {
          value[key] = item.value;
        }
      }
    });

    emit('filter-change', value);
  }

  const realSchemas: any[] = reactive([]);
  // watchEffect(async () => {
  //   console.log(props.formFields, 'props');
  //   realSchemas.length = 0;
  //   const res = [];
  //   for (const it of props.formFields) {
  //     res.push(await it);
  //   }
  //   realSchemas.push(...res);
  // });
  const schemas: FormField[] = $computed(() => {
    return realSchemas.map(convertFormFieldToSchema).map((it) => {
      if (props?.defaultValueModel?.[it.field]) {
        it.defaultValue = props?.defaultValueModel?.[it.field];
      }
      // it.componentProps.placeholder = it.componentProps.placeholder
      //   .replace('请输入', '')
      //   .replace('请选择', '');
      // it.componentProps.size = 'small';
      return it;
    });
  });

  const [register, { submit }] = useForm({
    labelWidth: 80,
    layout: 'inline',
    submitButtonText: '搜索',
    showActionButtonGroup: props.showButtons,
  });

  function handleSubmit(values: Recordable) {
    // Apply filters from filterItems
    filterItems.forEach((item) => {
      if (item.option && item.value) {
        const key = props.columns.find((it) => it.title === item.option)?.key;
        if (key) {
          values[key] = item.value;
        }
      }
    });

    emit('submit', values);
  }

  function cancel() {
    console.log(form.value.formModel);
    emit('cancel', form.value.formModel);
  }

  function handleReset(value: Recordable) {
    console.log(value);
    filterItems = [];
    localDateRange = null;
    localShowAll = false;
    emit('clear');
  }
</script>

<template>
  <div>
    <filter-form
      ref="form"
      :schemas="schemas"
      @register="register"
      @reset="handleReset"
      @submit="handleSubmit"
    >
      <div v-if="columns && columns.length > 0" class="filter-container">
        <n-button class="add-filter-button" size="small" type="primary" @click="addFilterItem">
          <template #icon>
            <n-icon>
              <DocumentAdd20Regular />
            </n-icon>
          </template>
          添加过滤项
        </n-button>

        <template v-for="(item, index) in filterItems" :key="index">
          <n-card
            :content-style="{ padding: '0 8px' }"
            class="filter-card ml-2"
            embedded
            size="small"
          >
            <div class="filter-row">
              <!--              <div class="filter-option-text">-->
              <!--                {{ item.option }}-->
              <!--              </div>-->
              <n-input
                v-model:value="item.value"
                :placeholder="item.option"
                class="filter-input"
                size="tiny"
                type="text"
                @blur="updateFilterWithItems"
              />
              <n-button
                class="remove-filter-button"
                size="tiny"
                type="error"
                @click="removeFilterItem(index)"
              >
                <template #icon>
                  <n-icon>
                    <Delete20Regular />
                  </n-icon>
                </template>
              </n-button>
            </div>
          </n-card>
        </template>

        <n-date-picker
          v-model:value="localDateRange"
          class="ml-2 date-picker-small"
          clearable
          size="small"
          type="daterange"
        />
        <n-checkbox v-model:checked="localShowAll" class="ml-2" label="全部" size="large" />
      </div>
      <slot></slot>
      <slot :submit="submit" name="extraSubmitButton"></slot>
      <slot :cancel="cancel" name="extraCancelButton"></slot>
    </filter-form>

    <n-modal
      v-model:show="showAddFilterDialog"
      :show-icon="false"
      class="modal-medium"
      preset="card"
      style="width: 600px"
      title="添加过滤项"
    >
      <div class="filter-options-container">
        <n-card
          v-for="column in availableColumns"
          :key="column.key"
          :class="[
            'filter-option-card',
            { selected: selectedFilterOptions.includes(column.title) },
          ]"
          embedded
          size="small"
          @click="handleAddFilter(column.title)"
        >
          {{ column.title }}
        </n-card>
      </div>
      <div class="dialog-footer">
        <n-button
          :disabled="selectedFilterOptions.length === 0"
          type="primary"
          @click="confirmFilters"
        >
          确认
        </n-button>
      </div>
    </n-modal>
  </div>
</template>

<style lang="less" scoped>
  .filter-container {
    display: flex;
    align-items: center;
    margin-top: 8px;
    flex-wrap: wrap;
  }

  .filter-card {
    max-width: 200px;
    height: 32px; /* Match the height of small buttons */
    display: flex;
    align-items: center;
  }

  .filter-row {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
  }

  .filter-select {
    width: 130px;
  }

  .filter-option-text {
    width: 130px;
    padding: 0;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .filter-input {
    width: 130px;
    height: 24px; /* Smaller height for the input */
  }

  .add-filter-button {
    margin-right: 8px;
  }

  .remove-filter-button {
    margin-left: 5px;
    padding: 0 4px;
  }

  .filter-options-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    max-height: 400px;
    overflow-y: auto;
  }

  .filter-option-card {
    width: calc(33.33% - 10px);
    cursor: pointer;
    text-align: center;
    padding: 10px;
    transition: background-color 0.3s;
  }

  .filter-option-card:hover {
    background-color: #f5f5f5;
  }

  .filter-option-card.selected {
    background-color: #e6f7ff;
    border: 1px solid #1890ff;
  }

  .dialog-footer {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .modal-medium {
    width: 90%;
    min-width: 600px;
    max-width: 800px;
  }

  .ml-2 {
    margin-left: 8px;
  }

  .date-picker-small {
    height: 32px; /* Match the height of small buttons */
  }
</style>
