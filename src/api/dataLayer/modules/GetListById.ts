import { OutWarehouseManager } from '@/api/dataLayer/modules/OutWarehouseCar/OutWarehouseModel';
import { where } from 'firebase/firestore';
import { chunk } from 'lodash-es';

export async function getOutWarehouseDetailListById(ids) {
  const currentTaskList = [];
  const res = chunk(ids, 30);
  for (const idList of res) {
    const result = await OutWarehouseManager.load(null, where('id', 'in', idList));
    currentTaskList.push(result);
  }
  return currentTaskList.flat();
}
