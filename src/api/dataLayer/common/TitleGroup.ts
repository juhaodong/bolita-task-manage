export const allTitleGroup = [
  {
    title: '客户ID',
    itemKey: 'customerName',
    tagType: 'warning',
  },
  {
    title: '柜号',
    itemKey: 'containerId',
    tagType: 'warning',
  },
  {
    title: '票号',
    itemKey: 'ticketId',
    tagType: 'warning',
  },
  {
    title: '国家',
    itemKey: 'country',
    tagType: 'warning',
  },
  {
    title: '预报件数',
    itemKey: 'number',
    tagType: 'warning',
  },
  {
    title: '预报托数',
    itemKey: 'trayNum',
    tagType: 'warning',
  },
  {
    title: '总实重',
    itemKey: 'weight',
    tagType: 'warning',
  },
  {
    title: '总体积',
    itemKey: 'volume',
    tagType: 'warning',
  },
  {
    title: '尺寸',
    itemKey: 'size',
    tagType: 'warning',
  },
  {
    title: '状态',
    itemKey: 'inStatus',
    tagType: 'warning',
  },
  {
    title: '基础备注',
    itemKey: 'normalNote',
    tagType: 'warning',
  },
  {
    title: 'FBA/快递单号',
    itemKey: 'FBADeliveryCode',
    tagType: 'warning',
  },
  {
    title: '出库方式',
    itemKey: 'outboundMethod',
    tagType: 'warning',
  },
  {
    title: '物流渠道',
    itemKey: 'deliveryMethod',
    tagType: 'warning',
  },
  {
    title: '操作要求',
    itemKey: 'operationRequire',
    tagType: 'warning',
  },
  {
    title: '操作备注',
    itemKey: 'operationNote',
    tagType: 'warning',
  },
  {
    title: '结算状态',
    itemKey: 'finalStatus',
    tagType: 'warning',
  },
  {
    title: 'PO',
    itemKey: 'PO',
    tagType: 'warning',
  },
  {
    title: 'FC/送货地址',
    itemKey: 'FCAddress',
    tagType: 'warning',
  },
  {
    title: '邮编',
    itemKey: 'postcode',
    tagType: 'warning',
  },
  {
    title: '换单文件',
    itemKey: 'changeOrderFiles',
    tagType: 'warning',
  },
  {
    title: '送货备注',
    itemKey: 'transportationNote',
    tagType: 'info',
  },
  {
    title: '实际件数',
    itemKey: 'arrivedContainerNum',
    tagType: 'info',
  },
  {
    title: '实际托数',
    itemKey: 'arrivedTrayNum',
    tagType: 'info',
  },
  {
    title: '仓库',
    itemKey: 'warehouseId',
    tagType: 'info',
  },
  {
    title: '留仓时间',
    itemKey: 'stayTime',
    tagType: 'info',
  },
  {
    title: '预期到仓日期',
    itemKey: 'planArriveDateTime',
    tagType: 'info',
  },
  {
    title: '实际到仓日期',
    itemKey: 'arriveTime',
    tagType: 'info',
  },
  {
    title: '发货时间',
    itemKey: 'deliveryTime',
    tagType: 'info',
  },
  {
    title: 'Ref',
    itemKey: 'Ref',
    tagType: 'info',
  },
  {
    title: '仓库备注',
    itemKey: 'note',
    tagType: 'info',
  },
  {
    title: '分拣标识',
    itemKey: 'sign',
    tagType: 'success',
  },
  {
    title: '包装',
    itemKey: 'package',
    tagType: 'success',
  },
  {
    title: '托数',
    itemKey: 'industrialTrayNum',
    tagType: 'success',
  },
  {
    title: '品名',
    itemKey: 'productName',
    tagType: 'success',
  },
  {
    title: 'UN号',
    itemKey: 'UNNumber',
    tagType: 'success',
  },
  {
    title: '收件人',
    itemKey: 'recipient',
    tagType: 'success',
  },
  {
    title: '电话',
    itemKey: 'phone',
    tagType: 'success',
  },
  {
    title: '邮箱',
    itemKey: 'email',
    tagType: 'success',
  },
  {
    title: '是否需要预约',
    itemKey: 'needReserve',
    tagType: 'success',
  },
  {
    title: '工业品备注',
    itemKey: 'industrialNote',
    tagType: 'success',
  },
].map((it, index) => {
  it.sort = index;
  it.description = 'taskList';
  return it;
});

export const operationTitleGroup = [
  {
    title: 'ID',
    itemKey: 'id',
  },
  {
    title: '出库日期',
    itemKey: 'realOutDate',
  },
  {
    title: '预计取货时间',
    itemKey: 'pickUpDateTime',
  },
  {
    title: '预约送货时间',
    itemKey: 'reservationGetProductTime',
  },
  {
    title: 'Halle',
    itemKey: 'warehouseId',
  },
  {
    title: '详情',
    itemKey: 'actions',
  },
  {
    title: '状态',
    itemKey: 'inStatus',
  },
  {
    title: 'Ref',
    itemKey: 'REF',
  },
  {
    title: 'ISA',
    itemKey: 'ISA',
  },
  {
    title: 'AMZ-Sendungs ID',
    itemKey: 'AMZID',
  },
  {
    title: 'Kunden',
    itemKey: 'customerId',
  },
  {
    title: 'FC/送货地址',
    itemKey: 'FCAddress',
  },
  {
    title: '物流方式',
    itemKey: 'deliveryMethod',
  },
  {
    title: '邮编',
    itemKey: 'postcode',
  },
  // {
  //   title: '订车状态',
  //   itemKey: 'carStatus',
  // },
  {
    title: '操作人',
    itemKey: 'outOperatePerson',
  },
].map((it, index) => {
  it.sort = index;
  it.description = 'operation';
  it.tagType = '';
  return it;
});

export const containerForecastTitleGroup = [
  {
    title: '预计入库日期',
    itemKey: 'planArriveDateTime',
  },
  {
    title: '预计时间',
    itemKey: 'inHouseTime',
  },
  {
    title: '柜号',
    itemKey: 'containerNo',
  },
  {
    title: '客户ID',
    itemKey: 'customerName',
  },
  {
    title: '仓库',
    itemKey: 'warehouseId',
  },
  {
    title: '数量',
    itemKey: 'arrivedCount',
  },
  {
    title: '状态',
    itemKey: 'inStatus',
  },
  {
    title: '操作人',
    itemKey: 'unloadPerson',
  },
  {
    title: '用户名',
    itemKey: 'salesName',
  },
  {
    title: '备注',
    itemKey: 'note',
  },
  {
    title: '结算状态',
    itemKey: 'containerFinalStatus',
  },
].map((it, index) => {
  it.sort = index;
  it.description = 'containerForecast';
  it.tagType = '';
  return it;
});
