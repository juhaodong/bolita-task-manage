import { Result, resultError, resultSuccess } from '@/store/request/_util';
import { db, executeQuery, getDocContent, getFileListUrl } from '@/store/plugins/firebase';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import dayjs from 'dayjs';
import { doLog } from '@/api/dataLayer/modules/statusChangeLog';
import { keyBy } from 'lodash-es';
import { UploadFileInfo } from 'naive-ui';
import { QueryCompositeFilterConstraint, QueryConstraint } from '@firebase/firestore';
import { safeParseInt, toastError } from '@/store/utils/utils';

interface JoinManager {
  loader: () => Promise<any[]>;
  key: string;
}

export interface GeneralModel {
  collectionName: string;
  idPrefix?: string;
  init: (value, ...args) => any;
  afterAddHook?: (id: string, value: any, ...args) => Promise<any>;
  joinManager?: JoinManager;
}

export async function getCollectionNextId(collectionName: string, prefix = '') {
  const currentMaxId = await getDocs(query(collection(db, collectionName)));
  return prefix + (currentMaxId.size + 1).toString().padStart(4, '0');
}

export async function generalAdd(value: any, collectionName: string, prefix = '') {
  const id = value?.id ?? (await getCollectionNextId(collectionName, prefix));
  value.createTimestamp = dayjs().valueOf();
  for (const k of Object.keys(value)) {
    if (value[k] instanceof Array<UploadFileInfo>) {
      value[k] = await getFileListUrl(value[k]);
    }
  }
  await setDoc(doc(collection(db, collectionName), id), value);
  await doLog({
    toStatus: '创建',
    note: value?.note ?? '',
    files: [],
    logRef: id,
  });
  return id;
}

export async function generalUpdate(value: any, collectionName: string, id: string) {
  await setDoc(doc(collection(db, collectionName), id), value, { merge: true });
  await doLog({
    toStatus: '更新状态',
    note: value?.note ?? '',
    files: [],
    logRef: id,
  });
  return id;
}

export async function safeScope(func): Promise<any> {
  try {
    return await func();
  } catch (e: any) {
    console.error(e);
    toastError(e?.message);
  }
}

export function initModel(g: GeneralModel): Model {
  const scope = async (func) => {
    try {
      return resultSuccess(await func());
    } catch (e: any) {
      console.error(e);
      return resultError(e?.message);
    }
  };
  const massiveAdd = async (list: any[], collectionName: string, prefix = '', ...args) => {
    let currentMaxId = safeParseInt(await getCollectionNextId(collectionName));
    const batch = writeBatch(db);
    const ids: any = [];
    for (let value of list) {
      value = await g.init(value, ...args);
      value.createTimestamp = dayjs().valueOf();
      for (const k of Object.keys(value)) {
        if (value[k] instanceof Array<UploadFileInfo>) {
          value[k] = await getFileListUrl(value[k]);
        }
      }
      ids.push(currentMaxId);
      batch.set(doc(collection(db, collectionName), prefix + currentMaxId), value);
      currentMaxId++;
    }
    await batch.commit();
    return ids;
  };

  return {
    async addInternal(value, ...args): Promise<string> {
      const t = await g.init(value, ...args);
      const id = await generalAdd(t, g.collectionName, g?.idPrefix);
      if (g.afterAddHook) {
        await g.afterAddHook(id, t, ...args);
      }
      return id;
    },
    async add(value, ...args): Promise<Result<string>> {
      return await scope(async () => {
        return await this.addInternal(value, ...args);
      });
    },
    async editInternal(value, id): Promise<string> {
      return await generalUpdate(value, g.collectionName, id);
    },
    async edit(value, id): Promise<Result<string>> {
      return await scope(async () => {
        return await this.editInternal(value, id);
      });
    },

    async getById(id): Promise<any> {
      const info = await getDocContent(doc(db, g.collectionName, id));
      if (g?.joinManager) {
        const dict = keyBy(await g.joinManager?.loader(), 'id');
        return Object.assign(dict[info[g.joinManager.key]], info);
      }
      return info;
    },
    async load(filterObj?: any, ...extraCondition: QueryConstraint[]): Promise<any[]> {
      let q = query(collection(db, g.collectionName));
      if (extraCondition) {
        q = query(q, ...extraCondition);
      }
      q = query(q, orderBy('createTimestamp', 'desc'));
      const list = (await executeQuery(q)).filter((it) => it.createTimestamp);
      if (g?.joinManager) {
        const dict = keyBy(await g.joinManager?.loader(), 'id');
        list.forEach((it, index) => {
          const n = dict[it[g?.joinManager?.key ?? '']];
          list[index] = {
            ...n,
            ...it,
          };
        });
      }
      if (!filterObj) {
        return list;
      } else {
        return list.filter((it) => {
          return Object.keys(filterObj).every((k) => !filterObj[k] || filterObj[k] == it[k]);
        });
      }
    },
    async remove(id): Promise<Result<any>> {
      return await scope(async () => {
        return await deleteDoc(doc(db, g.collectionName, id));
      });
    },
    async massiveAdd(list, ...args) {
      return await massiveAdd(list, g.collectionName, g.idPrefix, ...args);
    },
    async massiveUpdate(listWithId: any[]) {
      const batch = writeBatch(db);
      for (const value of listWithId) {
        const id = value.id;
        delete value.id;
        batch.set(doc(collection(db, g.collectionName), id), value);
      }
      await batch.commit();
    },
  };
}

export interface Model {
  load: (
    filterObj?: any,
    ...extraCondition: (QueryConstraint | QueryCompositeFilterConstraint)[]
  ) => Promise<any[]>;
  getById: (id: string) => Promise<any>;
  add: (value, ...args) => Promise<Result<string>>;
  addInternal: (value, ...args) => Promise<string>;
  massiveAdd: (list: any[], ...args) => Promise<any>;
  massiveUpdate: (listWithId: any[]) => Promise<any>;
  remove: (id) => Promise<Result<any>>;
  edit: (value, id: string) => Promise<Result<string>>;
  editInternal: (value, id: string) => Promise<string>;
}
