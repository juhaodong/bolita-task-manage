import { Result, resultError, resultSuccess } from '@/store/request/_util';
import { db, executeQuery, getDocContent, getFileListUrl } from '@/store/plugins/firebase';
import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import dayjs from 'dayjs';
import { doLog } from '@/api/dataLayer/modules/statusChangeLog';
import { keyBy } from 'lodash-es';
import { UploadFileInfo } from 'naive-ui';
import { QueryCompositeFilterConstraint, QueryConstraint } from '@firebase/firestore';
import { toastError } from '@/store/utils/utils';

export interface GeneralModel {
  collectionName: string;
  init: (value, ...args) => any;
  afterAddHook?: (id: string, value: any, ...args) => Promise<any>;
  joinManager?: { loader: () => Promise<any[]>; key: string };
}

export async function getCollectionNextId(collectionName: string) {
  const currentMaxId = await getDocs(query(collection(db, collectionName)));
  return (currentMaxId.size + 1).toString().padStart(4, '0');
}

export async function generalAdd(value: any, collectionName: string) {
  const id = value?.id ?? (await getCollectionNextId(collectionName));
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
  return {
    async addInternal(value, ...args): Promise<string> {
      const t = await g.init(value, ...args);
      const id = await generalAdd(t, g.collectionName);
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
        console.log(dict, info[g.joinManager.key]);
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
      const list = await executeQuery(q);
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
  remove: (id) => Promise<Result<any>>;
  edit: (value, id: string) => Promise<Result<string>>;
  editInternal: (value, id: string) => Promise<string>;
}
