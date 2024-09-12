import hillo from 'hillo';

const typeName = 'trayItem';

export async function getTaskListTrayItem() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function addOrUpdateTaskTrayItem(item) {
  return await hillo.jsonPost(typeName + '/addOrUpdateWithParentId', {
    ...item,
  });
}

export async function deleteTaskTrayItem(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}
