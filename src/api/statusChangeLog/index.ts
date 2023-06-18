import { addDoc, collection, query, where } from 'firebase/firestore';
import { db, executeQuery } from '@/plugins/firebase';
import { resultError } from '../../../mock/_util';
import { useUser } from '@/store/modules/user';
import dayjs from 'dayjs';

export type StatusChangeLogModel = {
  fromStatus: string;
  toStatus: string;
  timestamp: number;
  note: string;
  userId: string | null;
  files: string[];
  logRef: string;
};
const logPath = 'statusChangeLog';

export async function doLog(log: StatusChangeLogModel) {
  const userStore = useUser();
  try {
    log.userId = userStore.info.id;
    log.timestamp = dayjs().valueOf();
    await addDoc(collection(db, logPath), log);
  } catch (e: any) {
    return resultError(e.message);
  }
}

export async function checkLog(logRef: string) {
  return await executeQuery(query(collection(db, logPath), where('logRef', '==', logRef)));
}
