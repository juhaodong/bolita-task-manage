import { OperationRequirementModel } from '@/api/operationType';
import { db, executeQuery, getDocContent } from '@/plugins/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { TaskModel, TaskStatus, TaskType } from '@/api/task/task-types';
import { doLog } from '@/api/statusChangeLog';
import { resultError, resultSuccess } from '@/utils/request/_util';
import dayjs from 'dayjs';
import { clamp, keyBy } from 'lodash-es';
import { getTaskTypeOperationKeys } from '@/api/task/task-operation-requirement';

const taskPath = 'task-NewQuestOperationList';
const taskCollection = collection(db, taskPath);
const operationRequirementsPath = 'operationRequirements';

export async function getTasksForQuest(questId) {
  return await executeQuery(query(taskCollection, where('questId', '==', questId)));
}

export async function createTask(taskInfo: any) {
  try {
    const realInfo = taskInfo;
    realInfo.status = TaskStatus.NotSubmit;
    realInfo.createTimestamp = dayjs().valueOf();
    realInfo.finishTimestamp = '';
    realInfo.operationRequirements = getTaskTypeOperationKeys(realInfo.taskType);
    const id = dayjs().valueOf().toString();
    console.log(realInfo);
    await setDoc(doc(taskCollection, id), realInfo);
    await Promise.all(
      realInfo.operationRequirements.map((it) =>
        addDoc(collection(db, taskPath, id, operationRequirementsPath), it)
      )
    );
    await doLog({
      fromStatus: '',
      toStatus: realInfo.status,
      note: '',
      files: realInfo.files,
      logRef: id,
    });
    return resultSuccess(id);
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function deleteTask(id) {
  try {
    await deleteDoc(doc(taskCollection, id));
    return resultSuccess('');
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function changeTaskWarehouse(id: string, warehouseId: string) {
  try {
    const currentTask = await getTaskById(id);
    if (warehouseId) {
      await setDoc(doc(taskCollection, id), { warehouseId }, { merge: true });
    }

    await doLog({
      files: [],
      fromStatus: currentTask.status,
      logRef: id,
      note: '执行仓库变更为' + warehouseId,
      toStatus: currentTask.status,
    });
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function changeTaskStatus(
  id: string,
  newStatus: TaskStatus,
  warehouseId: string | null = null
) {
  try {
    const currentTask = await getTaskById(id);
    await setDoc(doc(taskCollection, id), { status: newStatus }, { merge: true });
    if (warehouseId) {
      await setDoc(doc(taskCollection, id), { warehouseId }, { merge: true });
    }

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
      (sum, i) => sum + (parseInt(i.requireAmount) || 0),
      0
    );
    const completeTaskCount = newOR.reduce((sum, i) => sum + (parseInt(i.completeAmount) || 0), 0);
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

export async function getTaskList(taskType: TaskType) {
  return await executeQuery(
    query(taskCollection, where('taskType', '==', taskType), orderBy('createTimestamp', 'desc'))
  );
}
