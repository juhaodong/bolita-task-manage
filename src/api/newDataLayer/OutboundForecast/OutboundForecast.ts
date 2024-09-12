import hillo from 'hillo';

const typeName = 'outboundForecast';

export async function getOutboundForecastList() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function getOutboundForecastById(id) {
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
  return await hillo.jsonPost(typeName + '/addOrUpdate', {
    ...item,
  });
}

export async function getOutboundForecastListByFilter(filter) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: filter,
    })
  ).data.content;
}

export async function deleteOutboundForecast(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}
