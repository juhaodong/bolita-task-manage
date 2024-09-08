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

export async function addOrUpdateTask(item) {
  return await hillo.jsonPost(typeName + '/addOrUpdate', {
    ...item,
  });
}

export async function deleteTask(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}
