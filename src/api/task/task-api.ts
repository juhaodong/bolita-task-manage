import { OperationRequirementModel } from '@/api/operationType';
import { db, executeQuery, getDocContent } from '@/plugins/firebase';
import { addDoc, collection, doc, query, setDoc } from 'firebase/firestore';
import { TaskType } from '@/api/task/task-types';
import { doLog } from '@/api/statusChangeLog';
import { resultError, resultSuccess } from '../../../mock/_util';
import dayjs from 'dayjs';
import { clamp, keyBy } from 'lodash-es';

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
const taskCollection = collection(db, taskPath);
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
      id: null,
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
    console.log(realInfo, 'info');
    const id = dayjs().valueOf().toString();
    await setDoc(doc(taskCollection, id), realInfo);
    await Promise.all(
      taskInfo.operationRequirements.map((it) =>
        addDoc(collection(db, taskPath, id, operationRequirementsPath), it)
      )
    );
    await doLog({
      fromStatus: '',
      toStatus: realInfo.status,
      note: '',
      files: taskInfo.files,
      logRef: id,
    });
    return resultSuccess(id);
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function changeTaskStatus(id: string, newStatus: TaskStatus) {
  try {
    const currentTask = await getTaskById(id);
    await setDoc(doc(taskCollection, id), { status: newStatus }, { merge: true });
    await doLog({
      files: [],
      fromStatus: currentTask.status,
      logRef: id,
      note: '',
      toStatus: newStatus,
    });
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function changeTaskFeedBack(
  id: string,
  newOR: OperationRequirementModel[],
  note: string,
  files: string[]
) {
  try {
    const currentTask = await getTaskById(id);
    const oldTaskDetail = keyBy(currentTask.operationRequirements, 'operationType');
    const totalTaskCount = currentTask.operationRequirements.reduce(
      (sum, i) => sum + parseInt(i.requireAmount),
      0
    );
    const completeTaskCount = newOR.reduce((sum, i) => sum + parseInt(i.completeAmount), 0);
    const newCompleteRate = clamp(completeTaskCount / totalTaskCount, 0, 1);
    const haveChange = newOR.some((it) => {
      return it.completeAmount != oldTaskDetail[it.operationType].completeAmount;
    });
    if (!haveChange) {
      return resultError('您未进行任何变动，无法提交反馈');
    }
    const updateObj: any = {
      operationRequirements: newOR,
      completionRate: (newCompleteRate * 100).toFixed(2),
    };
    const isComplete = newOR.every((it) => it.completeAmount >= it.requireAmount);
    console.log(currentTask.operateTime);
    if (!currentTask.operateTime) {
      updateObj.operateTime = dayjs().valueOf();
    }
    updateObj.status = isComplete ? TaskStatus.Finished : TaskStatus.Handling;
    await setDoc(doc(taskCollection, id), updateObj, { merge: true });
    await doLog({
      files: files,
      fromStatus: currentTask.status,
      logRef: id,
      note: '完成率: ' + currentTask.completionRate + '%-->' + newCompleteRate + '%. 备注：' + note,
      toStatus: updateObj.status,
    });

    return resultSuccess('');
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function getTaskById(id: string) {
  const mainInfo: TaskModel = await getDocContent(doc(db, taskPath, id));
  return mainInfo;
}

export async function getTaskList(params) {
  console.log(params);
  return await executeQuery(query(collection(db, taskPath)));
}
