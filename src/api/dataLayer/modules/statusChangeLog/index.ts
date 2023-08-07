import { collection, doc, query, setDoc, where } from 'firebase/firestore';
import { db, executeQuery } from '@/store/plugins/firebase';
import { resultError } from '@/store/request/_util';
import { useUser } from '@/store/modules/user';
import dayjs from 'dayjs';

export type StatusChangeLogModel = {
  toStatus: string;
  timestamp: number;
  note: string;
  userId: string;
  files: string[];
  logRef: string;
};

export type ChangeLogDTO = {
  toStatus: string;
  note: string;
  files: string[];
  logRef: string;
};
const logPath = 'statusChangeLog';

export async function doLog(dto: ChangeLogDTO) {
  const userStore = useUser();
  try {
    const currentTimestamp = dayjs().valueOf();
    const log: StatusChangeLogModel = {
      ...dto,
      userId: userStore.info.id,
      timestamp: currentTimestamp,
    };

    await setDoc(doc(db, logPath, currentTimestamp.toString()), log);
  } catch (e: any) {
    return resultError(e.message);
  }
}

export async function checkLog(logRef: string) {
  return await executeQuery(query(collection(db, logPath), where('logRef', '==', logRef)));
}
