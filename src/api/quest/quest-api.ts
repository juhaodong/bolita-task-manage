import { QuestModel, QuestStatus } from '@/api/quest/quest-type';
import { db, executeQuery, getDocContent } from '@/plugins/firebase';
import { addDoc, collection, deleteDoc, doc, orderBy, query, setDoc } from 'firebase/firestore';
import { resultError, resultSuccess } from '@/utils/request/_util';
import dayjs from 'dayjs';
import { getTasksForQuest } from '@/api/task/task-api';
import { changeNotifyStatus, getNotifyById, NotifyStatus } from '@/api/notify/notify-api';
import { doLog } from '@/api/statusChangeLog';
import { CheckResult } from '@/store/modules/checkDialogState';

const path = 'quest';
const ref = collection(db, path);
async function createNewQuest(newQuestInfo: QuestModel) {
  newQuestInfo.createTimestamp = dayjs().valueOf();
  newQuestInfo.status = QuestStatus.NotSubmit;
  newQuestInfo.tasks = [];
  newQuestInfo.completeRate = 0;
  try {
    const { id } = await addDoc(ref, newQuestInfo);
    return resultSuccess(id);
  } catch (e: any) {
    return resultError(e?.message);
  }
}
async function updateQuest(questInfo: QuestModel, id) {
  const currentQuestInfo = await getQuestById(id);
  const newData = Object.assign({}, currentQuestInfo, questInfo);
  try {
    await setDoc(doc(ref, id), newData);
    return resultSuccess(id);
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function changeQuestStatus(id: string, newStatus: QuestStatus) {
  try {
    const currentModel = await getQuestById(id);
    await setDoc(doc(ref, id), { status: newStatus }, { merge: true });
    await doLog({
      files: [],
      fromStatus: currentModel.status,
      logRef: id,
      note: '',
      toStatus: newStatus,
    });
    return resultSuccess('');
  } catch (e: any) {
    return resultError(e?.message);
  }
}

async function getStatusAfterCheck(id: string) {
  const model = await getQuestById(id);
  if (model.notifyId) {
    return QuestStatus.NotArrived;
  } else {
    return QuestStatus.WaitAllTaskCheckPass;
  }
}

export async function checkQuest(id: string, checkResult: CheckResult) {
  const newStatus = checkResult.checkPassed
    ? await getStatusAfterCheck(id)
    : QuestStatus.CheckRefused;
  try {
    const currentModel = await getQuestById(id);
    const notifyId = currentModel?.notifyId;
    if (notifyId) {
      await changeNotifyStatus(
        notifyId,
        checkResult.checkPassed ? NotifyStatus.WaitFroArrive : NotifyStatus.Refused
      );
    }
    await setDoc(
      doc(ref, id),
      { status: newStatus, warehouseId: checkResult.warehouseId },
      { merge: true }
    );
    await doLog({
      files: checkResult.files,
      fromStatus: currentModel.status,
      logRef: id,
      note: checkResult.note,
      toStatus: newStatus,
    });
    return resultSuccess('');
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function saveQuest(questInfo: QuestModel, id: string | null = null) {
  if (!id) {
    return await createNewQuest(questInfo);
  } else {
    return await updateQuest(questInfo, id);
  }
}

export async function updateNotifyInfo(notifyId, questId) {
  try {
    await setDoc(doc(ref, questId), { notifyId }, { merge: true });
    return resultSuccess(questId);
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function getQuestById(id: string): Promise<QuestModel> {
  const mainInfo = await getDocContent(doc(ref, id));
  return {
    ...mainInfo,
    tasks: await getTasksForQuest(id),
    notifyInfo: await getNotifyById(mainInfo?.notifyId),
  };
}

export async function deleteQuest(id) {
  try {
    await deleteDoc(doc(ref, id));
    return resultSuccess('');
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function getQuestList() {
  return await executeQuery(query(ref, orderBy('createTimestamp', 'desc')));
}

export async function checkAndMoveToNewState() {}
