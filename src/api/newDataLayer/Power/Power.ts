import hillo from 'hillo';
import { flatChildren } from '@/api/newDataLayer/Power/PowerItems';

const typeName = 'powerType';

export async function getPowerTypeList() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function getPowerTypeByName(name) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: [
        {
          field: 'name',
          op: '==',
          value: name,
        },
      ],
    })
  ).data.content[0].powerTypeItems;
}

export async function getPowerTypeByKey(key) {
  const res =
    (
      await hillo.jsonPost(typeName + '/list', {
        criteria: [
          {
            field: 'typeKey',
            op: '==',
            value: key,
          },
        ],
      })
    ).data.content[0] ?? [];
  return { id: res.id, list: flatChildren(res?.powerTypeItems ?? []) ?? [] };
}

export async function addOrUpdatePowerType(item) {
  return await hillo.jsonPost(typeName + '/addOrUpdateWithItemIds', {
    ...item,
  });
}

export async function deletePowerType(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}
