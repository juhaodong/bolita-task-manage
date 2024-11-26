import hillo from 'hillo';

const typeName = 'outboundForecast';

export async function getOutboundForecastList() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function getOutboundForecastListByFilter(filter) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: filter,
    })
  ).data.content;
}

export async function getOutboundForecastListById(id) {
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

export async function addOrUpdateOutboundForecast(item) {
  if (item.customer || item.inventory) {
    item.customerId = item.customer.id;
    item.inventoryId = item.inventory.id;
  }
  return await hillo.jsonPost(typeName + '/addOrUpdateWithRef', {
    ...item,
  });
}

export async function deleteOutboundForecast(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}
