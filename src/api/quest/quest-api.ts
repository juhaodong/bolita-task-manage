import { QuestModel, QuestStatus } from '@/api/quest/quest-type';
import { db, executeQuery, getDocContent } from '@/plugins/firebase';
import { addDoc, collection, doc, query, setDoc } from 'firebase/firestore';
import { resultError, resultSuccess } from '@/utils/request/_util';
import dayjs from 'dayjs';
import { getTasksForQuest } from '@/api/task/task-api';
import { getNotifyById } from '@/api/notify/notify-api';
import { doLog } from '@/api/statusChangeLog';

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

export async function getQuestList() {
  return await executeQuery(query(ref));
}
