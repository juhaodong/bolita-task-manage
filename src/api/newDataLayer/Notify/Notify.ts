import hillo from 'hillo';

const typeName = 'notify';

export async function getNotifyList() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function getNotifyById(id) {
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

export async function addOrUpdateNotify(item) {
  if (item.customer || item.inventory) {
    item.customerId = item.customer.id;
    item.inventoryId = item.inventory.id;
  }
  return await hillo.jsonPost(typeName + '/addOrUpdateWithRef', {
    ...item,
  });
}

export async function getNotifyListByFilter(filter) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: filter,
    })
  ).data.content;
}

export async function deleteNotify(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}

export async function saveFiles(file) {
  const filesUrl = [];
  for (const item of file) {
    const res = await hillo.postWithUploadFile('https://cloud-v2.aaden.io/uploadFile', {
      file: item.file,
    });
    filesUrl.push(res);
  }
  return filesUrl.join(',');
}

export const notifyStatusList = [
  '等待入库',
  '等待审核',
  '入库待出库',
  '部分操作',
  '全部出库',
  '已结算',
];
