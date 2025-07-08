<script lang="ts" setup>
  import {
    convertFormColumn,
    convertFormFieldToSchema,
    FormField,
  } from '@/views/bolita-views/composable/form-field-type';
  import { FormSchema, useForm } from '@/components/Form';
  import { computed, onMounted, reactive, ref, unref, watchEffect } from 'vue';
  import { FormFields } from '@/api/dataLayer/common/GeneralModel';
  import { generateOptionFromArray } from '@/store/utils/utils';
  import { $ref } from 'vue/macros';
  import { DocumentAdd20Regular } from '@vicons/fluent';
  import { createPlaceholderMessage } from '@/components/Form/src/helper';
  import dayjs from 'dayjs';

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
  let selectedFilterOptions = $ref<any[]>([]);
  let tempFilterValues = $ref<Record<string, string>>({});
  let currentColumns = $ref<any[]>([]);

  // Watch for changes in the modelValue prop
  onMounted(async () => {
    // Handle the case where props.columns is undefined or empty
  });

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
    if (!currentColumns || currentColumns.length === 0) return [];
    // Filter out columns that are already selected as filter items
    return currentColumns
      .map(convertFormColumn)
      .filter(
        (col) => col.key && col.title && !filterItems.some((item) => item.option === col.title)
      );
  });

  async function addFilterItem() {
    if (!props.columns || props.columns.length === 0) {
      currentColumns = [];
      return;
    }

    // Check if any items in props.columns are promises
    const resolvedColumns = await Promise.all(
      props.columns.map(async (column) => {
        // If the column is a promise, wait for it to resolve
        if (column instanceof Promise) {
          try {
            return await column;
          } catch (error) {
            console.error('Error resolving column promise:', error);
            return null; // Return null for failed promises
          }
        }
        // Otherwise, return the column as is
        return column;
      })
    );

    // Filter out any null values (failed promises)
    currentColumns = resolvedColumns.filter((column) => column !== null);
    showAddFilterDialog = true;
    // selectedFilterOptions = [];
    tempFilterValues = {};
  }

  function handleAddFilter(column: any) {
    // Toggle selection of the column
    const index = selectedFilterOptions.findIndex((item) => item.title === column.title);
    if (index === -1) {
      selectedFilterOptions.push(column);
    } else {
      selectedFilterOptions.splice(index, 1);
      // Remove the temporary value if the column is deselected
      delete tempFilterValues[column.title];
    }
  }

  function removeSelectedOption(columnTitle: string) {
    // Remove the option from selectedFilterOptions
    const index = selectedFilterOptions.findIndex((item) => item.title === columnTitle);
    if (index !== -1) {
      // Remove the temporary value
      delete tempFilterValues[selectedFilterOptions[index].title];
      selectedFilterOptions.splice(index, 1);
    }
  }

  function dateRangeDisplay(dateRange: any) {
    return (
      dayjs(dateRange[0]).format('YYYY-MM-DD') + ' ~ ' + dayjs(dateRange[1]).format('YYYY-MM-DD')
    );
  }

  function confirmFilters() {
    filterItems = [];
    console.log(selectedFilterOptions, 'selectedFilterOptions');
    for (const column of selectedFilterOptions) {
      filterItems.push({
        option: column.title,
        key: column.key,
        component: column.component,
        value: formModel[column.key] || '',
        display:
          column?.component?.name === 'DatePicker'
            ? dateRangeDisplay(formModel[column.key]) || ''
            : formModel[column.key] || '',
      });
    }
    closeFilterDialog();
    handleSubmit(filterItems);
  }

  function closeFilterDialog() {
    showAddFilterDialog = false;
    tempFilterValues = {};
  }

  function removeFilterItem(index: number) {
    filterItems.splice(index, 1);
    selectedFilterOptions.splice(index, 1);
    updateFilterWithItems();
  }

  function updateFilterWithItems() {
    handleSubmit(filterItems);
  }

  const realSchemas: any[] = reactive([]);
  const schemas: FormField[] = $computed(() => {
    return realSchemas.map(convertFormFieldToSchema).map((it) => {
      if (props?.defaultValueModel?.[it.field]) {
        it.defaultValue = props?.defaultValueModel?.[it.field];
      }
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
    emit('submit', values);
  }

  function cancel() {
    emit('cancel', form.value.formModel);
  }

  function handleReset(value: Recordable) {
    console.log(value);
    filterItems = [];
    localDateRange = null;
    localShowAll = false;
    emit('clear');
  }

  function getComponentProps(option) {
    const compProps = option.componentProps ?? {};
    const component = option.component;
    return {
      clearable: true,
      placeholder: createPlaceholderMessage(unref(component)),
      ...compProps,
    };
  }

  const formModel = reactive<Recordable>({});
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

        <!-- Display filter items as tags -->
        <div class="filter-tags-container">
          <template v-for="(item, index) in filterItems" :key="index">
            <n-tag class="filter-tag ml-2" closable type="info" @close="removeFilterItem(index)">
              <span class="filter-tag-label">{{ item.option }}: {{ item.display }}</span>
            </n-tag>
          </template>
        </div>
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
      style="width: 500px"
      title="添加过滤项"
    >
      <!-- Filter input boxes for selected filters -->
      <div v-if="selectedFilterOptions.length > 0" class="selected-filters-inputs">
        <div v-for="option in selectedFilterOptions" :key="option.title" class="filter-input-item">
          <span class="filter-input-label">{{ option.title }}:</span>
          <!--判断插槽-->
          <template v-if="option.slot">
            <slot
              :field="option.key"
              :model="formModel"
              :name="option.slot"
              :value="formModel[option.key]"
            ></slot>
          </template>
          <template v-else-if="option.component === 'NAutoComplete'">
            <n-select
              v-model:value="formModel[option.key]"
              :get-show="() => true"
              v-bind="getComponentProps(option)"
            />
          </template>
          <template v-else-if="option.component === 'NSelect'">
            <n-select
              v-model:value="formModel[option.key]"
              :get-show="() => true"
              filterable
              v-bind="getComponentProps(option)"
            />
          </template>
          <!--动态渲染表单组件-->
          <component
            :is="option.component"
            v-else
            v-model:value="formModel[option.key]"
            v-bind="getComponentProps(option)"
          />
        </div>
      </div>

      <!-- Available filter options section -->
      <div class="section-header">可选择的过滤项</div>
      <div class="filter-options-container">
        <n-card
          v-for="column in availableColumns"
          :key="column.key"
          :class="[
            'filter-option-card',
            { selected: selectedFilterOptions.some((item) => item.title === column.title) },
          ]"
          embedded
          size="small"
          @click="handleAddFilter(column)"
        >
          <div class="filter-option-content">
            {{ column.title }}
            <n-button
              v-if="selectedFilterOptions.some((item) => item.title === column.title)"
              circle
              class="cancel-selection-button"
              quaternary
              size="tiny"
              type="error"
              @click.stop="removeSelectedOption(column.title)"
            />
          </div>
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
    gap: 8px;
    max-height: 300px;
    overflow-y: auto;
    padding: 4px;
  }

  .filter-option-card {
    width: calc(25% - 8px);
    cursor: pointer;
    text-align: center;
    padding: 4px 6px;
    transition: background-color 0.3s;
    font-size: 12px;
    line-height: 1.2;
    max-height: 32px;
    overflow: hidden;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .filter-option-content {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    position: relative;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cancel-selection-button {
    position: absolute;
    right: -4px;
    top: 50%;
    transform: translateY(-50%);
    margin-left: 4px;
    padding: 2px;
    min-width: 16px;
    height: 16px;
    line-height: 1;
    font-size: 10px;
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

  .selected-filters-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
    padding: 6px;
    background-color: #f9f9f9;
    border-radius: 4px;
    min-height: 32px;
  }

  .selected-filter-tag {
    margin-right: 3px;
    margin-bottom: 3px;
  }

  .selected-filters-inputs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
    padding: 8px;
    background-color: #f0f0f0;
    border-radius: 4px;
  }

  .filter-input-item {
    display: flex;
    align-items: center;
    min-width: 180px;
    margin-bottom: 6px;
  }

  .filter-input-label {
    font-weight: 500;
    margin-right: 6px;
    min-width: 70px;
    font-size: 12px;
  }

  .filter-input-field {
    flex: 1;
    min-width: 100px;
  }

  .section-header {
    font-size: 13px;
    font-weight: 600;
    color: #333;
    margin-bottom: 6px;
    padding-bottom: 3px;
    border-bottom: 1px solid #e8e8e8;
  }

  .filter-tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .filter-tag {
    display: flex;
    align-items: center;
    padding: 1px 6px;
    margin-bottom: 3px;
  }

  .filter-tag-label {
    margin-right: 3px;
    font-weight: 500;
    font-size: 12px;
  }

  .filter-tag-input {
    width: 80px;
    height: 20px;
    margin: 0 3px;
    font-size: 12px;
  }
</style>
