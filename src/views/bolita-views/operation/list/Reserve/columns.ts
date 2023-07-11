import { DataTableColumns } from 'naive-ui';
import { TaskModel, TaskType } from '@/api/task/task-types';
import { getFormColumnForTaskType } from '@/api/task/taskRepo';

export const columns: DataTableColumns<TaskModel> = getFormColumnForTaskType(TaskType.Reserve);
