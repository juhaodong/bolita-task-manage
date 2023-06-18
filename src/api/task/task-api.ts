import { OperationRequirementModel } from '@/api/operationType';
import { db, executeQuery } from '@/plugins/firebase';
import { addDoc, collection, query } from 'firebase/firestore';
import { TaskType } from '@/api/task/task-types';
import { doLog } from '@/api/statusChangeLog';
import dayjs from 'dayjs';
import { resultError, resultSuccess } from '../../../mock/_util';

export enum TaskStatus {
  NotSubmit = '未提交',
  WaitForCheck = '待审核',
  Refused = '未通过',
  NotHandled = '未处理',
  Handling = '处理中',
  Finished = '已处理',
  CompletedConfirmed = '已完成',
  Warning = '异常',
}

export type TaskModel = {
  salesId: string;
  customerId: string;
  warehouseId: string;
  logisticId: string | null;
  boxCount: number;
  taskType: TaskType;
  deliveryMethod: string;
  status: TaskStatus;
  operateTime: string;
  deliveryDate: string;
  completionRate: number;
  note: string;
  files: string[];
  operationRequirements: OperationRequirementModel[];
  refLink: string;
};

const taskPath = 'task-list';
const operationRequirementsPath = 'operationRequirements';
export async function createTask(taskInfo: TaskModel) {
  try {
    const info: TaskModel = {
      boxCount: 0,
      completionRate: 0,
      customerId: '',
      deliveryDate: '',
      deliveryMethod: '',
      files: [],
      logisticId: null,
      note: '',
      operateTime: '',
      operationRequirements: [],
      refLink: '',
      salesId: '',
      status: TaskStatus.NotSubmit,
      taskType: TaskType.AmazonTransfer,
      warehouseId: '',
    };
    const realInfo = Object.assign(info, taskInfo);
    const { id } = await addDoc(collection(db, taskPath), realInfo);
    await Promise.all(
      taskInfo.operationRequirements.map((it) =>
        addDoc(collection(db, taskPath, id, operationRequirementsPath), it)
      )
    );
    await doLog({
      fromStatus: '',
      toStatus: TaskStatus.NotSubmit,
      timestamp: dayjs().valueOf(),
      note: '',
      files: taskInfo.files,
      userId: null,
      logRef: id,
    });
    return resultSuccess(id);
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function getTaskList(params) {
  console.log(params);
  return await executeQuery(query(collection(db, taskPath)));
}
