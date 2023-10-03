import { Result, resultError, resultSuccess } from '@/store/request/_util';
import { db, executeQuery, getDocContent, getFileListUrl } from '@/store/plugins/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import dayjs from 'dayjs';
import { doLog } from '@/api/dataLayer/modules/statusChangeLog';
import { keyBy } from 'lodash-es';
import { UploadFileInfo } from 'naive-ui';
import { QueryCompositeFilterConstraint, QueryConstraint } from '@firebase/firestore';
import { safeParseInt, toastError } from '@/store/utils/utils';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { usePermission } from '@/hooks/web/usePermission';
import { storage } from '@/store/utils/Storage';
import { CUSTOMER_ID } from '@/store/mutation-types';
import { customerPath } from '@/api/dataLayer/modules/user/user';

export type FormFields = (Promise<FormField> | FormField)[];

interface JoinManager {
  loader: () => Promise<any[]>;
  key: string;
}

interface CascadeManager {
  collectionName: string;
  loader: (id) => Promise<any[]>;
}

export interface GeneralModel {
  collectionName: string;
  idPrefix?: string;
  init: (value, ...args) => any;
  afterAddHook?: (id: string, value: any, ...args) => Promise<any>;
  afterEditHook?: (id: string, value: any, ...args) => Promise<any>;
  joinManager?: JoinManager;
  cascadeManager?: CascadeManager;
  uniqKeys?: string[];
}

export async function getCollectionNextId(collectionName: string, prefix = '') {
  const currentMaxId = await getDocs(query(collection(db, collectionName)));
  let id = currentMaxId.size + 1;
  let record = await getDoc(doc(db, collectionName, id.toString().padStart(4, '0')));
  while (record.exists() && id < currentMaxId.size + 2000) {
    record = await getDoc(doc(db, collectionName, id.toString().padStart(4, '0')));
    id++;
  }
  return prefix + id.toString().padStart(4, '0');
}

async function generalInit(value) {
  value.createTimestamp = dayjs().valueOf();
  value.deletedAt = 0;
  for (const k of Object.keys(value)) {
    if (value[k] instanceof Array<UploadFileInfo>) {
      value[k] = await getFileListUrl(value[k]);
    }
  }
  return value;
}

export async function generalAdd(value: any, collectionName: string, prefix = '') {
  const id = value?.id ?? (await getCollectionNextId(collectionName, prefix));
  await generalInit(value);
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

let userInfoDict: any | null = null;

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
      await generalInit(value);
      ids.push(currentMaxId);
      batch.set(doc(collection(db, collectionName), prefix + currentMaxId), value);
      currentMaxId++;
    }
    await batch.commit();
    return ids;
  };

  return {
    async addInternal(value, ...args): Promise<string> {
      if (g.uniqKeys) {
        for (const uniqKey of g.uniqKeys) {
          const exist = await executeQuery(
            query(collection(db, g.collectionName), where(uniqKey, '==', value[uniqKey]))
          );
          if (exist.length > 0) {
            throw Error(uniqKey + '重复了');
          }
        }
      }
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
      for (const k of Object.keys(value)) {
        if (value[k]?.[0]?.file) {
          value[k] = await getFileListUrl(value[k]);
        }
      }
      const res = await generalUpdate(value, g.collectionName, id);
      if (g.afterEditHook) {
        await g.afterEditHook(id, value);
      }
      return res;
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
      if (!userInfoDict) {
        userInfoDict = keyBy(await executeQuery(query(collection(db, 'customer'))), 'id');
        console.log(userInfoDict, 'User Info Dict initialed');
      }
      const { isCustomer } = usePermission();
      q = query(q, orderBy('createTimestamp', 'desc'), where('deletedAt', '==', 0));
      if (isCustomer() && g.collectionName != customerPath) {
        const customerId = storage.get(CUSTOMER_ID);
        if (customerId) {
          q = query(q, where('customerId', '==', customerId));
        }
      }

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
      list.forEach((it) => {
        if (it.customerId) {
          console.log(userInfoDict[it.customerId]);
          it.customerName = userInfoDict[it.customerId]?.customerName ?? '';
        }
      });
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
        await this.editInternal({ deletedAt: dayjs().valueOf() }, id);
        if (g?.cascadeManager) {
          const manager = g?.cascadeManager;
          const target = ((await manager?.loader(id)) ?? []).map((it) => it.id);
          const batch = writeBatch(db);
          target.forEach((id) => {
            batch.set(doc(db, manager?.collectionName, id), { deletedAt: dayjs().valueOf() });
          });
          await batch.commit();
        }
      });
    },
    async massiveAdd(list, ...args) {
      return await massiveAdd(list, g.collectionName, g.idPrefix, ...args);
    },
    async massiveUpdate(listWithId: any[]) {
      const batch = writeBatch(db);
      for (const value of listWithId) {
        const id = value.id.toString();
        delete value.id;
        batch.set(doc(collection(db, g.collectionName), id), value, { merge: true });
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
