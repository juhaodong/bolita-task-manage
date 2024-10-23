import hillo from 'hillo';
import { useUserStore } from '@/store/modules/user';

const typeName = 'tableHeader';

export async function getTableHeaderGroupItemList(name) {
  const userId = useUserStore().info.id;
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: [
        {
          field: 'name',
          op: '==',
          value: name,
        },
        {
          field: 'userId',
          op: '==',
          value: userId,
        },
      ],
    })
  ).data.content[0];
}

export async function addOrUpdateTableHeaderGroupItem(item) {
  return await hillo.jsonPost(typeName + '/addOrUpdateWithItemIds', {
    ...item,
  });
}

export async function deleteTableHeaderGroupItem(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}
