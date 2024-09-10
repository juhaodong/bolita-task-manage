import hillo from 'hillo';

const typeName = 'bolitaTask';

export async function getTaskList() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function getTaskListByFilter(filter) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: filter,
    })
  ).data.content;
}

export async function getTaskListByIdsAndFilter(ids, filter) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: [
        {
          field: 'id',
          op: 'in',
          value: ids,
        },
        ...filter,
      ],
    })
  ).data.content;
}

export async function getTaskListByNotifyId(id) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: [
        {
          field: 'notifyId',
          op: '==',
          value: id,
        },
      ],
    })
  ).data.content;
}

export async function getTaskListById(id) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: [
        {
          field: 'id',
          op: '==',
          value: id,
        },
      ],
    })
  ).data.content[0];
}

export async function getTaskListByIds(ids) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: [
        {
          field: 'id',
          op: 'in',
          value: ids,
        },
      ],
    })
  ).data.content;
}

export async function addOrUpdateTask(item) {
  return await hillo.jsonPost(typeName + '/addOrUpdateWithRef', {
    ...item,
  });
}

export async function deleteTask(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}
