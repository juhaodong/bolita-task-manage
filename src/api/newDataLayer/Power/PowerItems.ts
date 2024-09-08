import hillo from 'hillo';

const typeName = 'powerTypeItem';

export async function addOrUpdatePowerType(item) {
  return await hillo.jsonPost(typeName + '/addOrUpdateWithParentId', {
    ...item,
  });
}

export async function getPowerItemsList() {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: [
        {
          field: 'parent',
          op: 'is null',
          value: '',
        },
      ],
    })
  ).data.content;
}

export function flatChildrenById(list) {
  const result = [];
  for (const item of list) {
    function traverse(obj) {
      if (obj.children.length > 0) {
        result.push(obj);
        obj.children.forEach((it) => {
          traverse(it);
        });
      } else {
        result.push(obj);
      }
    }
    traverse(item);
  }
  return result.map((it) => it.id);
}

export function flatChildren(list) {
  const result = [];
  for (const item of list) {
    function traverse(obj) {
      if (obj.children.length > 0) {
        result.push(obj);
        obj.children.forEach((it) => {
          traverse(it);
        });
      } else {
        result.push(obj);
      }
    }
    traverse(item);
  }
  return result;
}
