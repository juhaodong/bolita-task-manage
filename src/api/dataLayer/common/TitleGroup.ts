export const allTitleGroup = [
  {
    title: '客户ID',
    key: 'customerName',
    tagType: 'warning',
  },
  {
    title: '柜号',
    key: 'containerId',
    tagType: 'warning',
  },
  {
    title: '票号',
    key: 'ticketId',
    tagType: 'warning',
  },
  {
    title: '国家',
    key: 'country',
    tagType: 'warning',
  },
  {
    title: '预报件数',
    key: 'number',
    tagType: 'warning',
  },
  {
    title: '预报托数',
    key: 'trayNum',
    tagType: 'warning',
  },
  {
    title: '总实重',
    key: 'weight',
    tagType: 'warning',
  },
  {
    title: '总体积',
    key: 'volume',
    tagType: 'warning',
  },
  {
    title: '尺寸',
    key: 'size',
    tagType: 'warning',
  },
  {
    title: '状态',
    key: 'inStatus',
    tagType: 'warning',
  },
  {
    title: '基础备注',
    key: 'normalNote',
    tagType: 'warning',
  },
  {
    title: 'FBA/快递单号',
    key: 'FBADeliveryCode',
    tagType: 'warning',
  },
  {
    title: '出库方式',
    key: 'outboundMethod',
    tagType: 'warning',
  },
  {
    title: '物流渠道',
    key: 'deliveryMethod',
    tagType: 'warning',
  },
  {
    title: '操作要求',
    key: 'operationRequire',
    tagType: 'warning',
  },
  {
    title: '操作备注',
    key: 'operationNote',
    tagType: 'warning',
  },
  {
    title: '结算状态',
    key: 'finalStatus',
    tagType: 'warning',
  },
  {
    title: 'PO',
    key: 'PO',
    tagType: 'warning',
  },
  {
    title: 'FC/送货地址',
    key: 'FCAddress',
    tagType: 'warning',
  },
  {
    title: '邮编',
    key: 'postcode',
    tagType: 'warning',
  },
  {
    title: '换单文件',
    key: 'changeOrderFiles',
    tagType: 'warning',
  },
  {
    title: '送货备注',
    key: 'transportationNote',
    tagType: 'info',
  },
  {
    title: '实际件数',
    key: 'arrivedContainerNum',
    tagType: 'info',
  },
  {
    title: '实际托数',
    key: 'arrivedTrayNum',
    tagType: 'info',
  },
  {
    title: '仓库',
    key: 'warehouseId',
    tagType: 'info',
  },
  {
    title: '留仓时间',
    key: 'stayTime',
    tagType: 'info',
  },
  {
    title: '预期到仓日期',
    key: 'planArriveDateTime',
    tagType: 'info',
  },
  {
    title: '实际到仓日期',
    key: 'arriveTime',
    tagType: 'info',
  },
  {
    title: '发货时间',
    key: 'deliveryTime',
    tagType: 'info',
  },
  {
    title: 'Ref',
    key: 'Ref',
    tagType: 'info',
  },
  {
    title: '仓库备注',
    key: 'note',
    tagType: 'info',
  },
  {
    title: '分拣标识',
    key: 'sign',
    tagType: 'success',
  },
  {
    title: '包装',
    key: 'package',
    tagType: 'success',
  },
  {
    title: '托数',
    key: 'industrialTrayNum',
    tagType: 'success',
  },
  {
    title: '品名',
    key: 'productName',
    tagType: 'success',
  },
  {
    title: 'UN号',
    key: 'UNNumber',
    tagType: 'success',
  },
  {
    title: '收件人',
    key: 'recipient',
    tagType: 'success',
  },
  {
    title: '电话',
    key: 'phone',
    tagType: 'success',
  },
  {
    title: '邮箱',
    key: 'email',
    tagType: 'success',
  },
  {
    title: '是否需要预约',
    key: 'needReserve',
    tagType: 'success',
  },
  {
    title: '工业品备注',
    key: 'industrialNote',
    tagType: 'success',
  },
].map((it, index) => {
  it.sort = index;
  return it;
});

export const operationTitleGroup = [
  {
    title: 'ID',
    key: 'id',
  },
  {
    title: '出库日期',
    key: 'realOutDate',
  },
  {
    title: '预计取货时间',
    key: 'pickUpDateTime',
  },
  {
    title: '预约送货时间',
    key: 'reservationGetProductTime',
  },
  {
    title: 'Halle',
    key: 'warehouseId',
  },
  {
    title: '详情',
    key: 'actions',
  },
  {
    title: '状态',
    key: 'inStatus',
  },
  {
    title: 'Ref',
    key: 'REF',
  },
  {
    title: 'ISA',
    key: 'ISA',
  },
  {
    title: 'AMZ-Sendungs ID',
    key: 'AMZID',
  },
  {
    title: 'Kunden',
    key: 'customerId',
  },
  {
    title: 'FC/送货地址',
    key: 'FCAddress',
  },
  {
    title: '物流方式',
    key: 'deliveryMethod',
  },
  {
    title: '邮编',
    key: 'postcode',
  },
  // {
  //   title: '订车状态',
  //   key: 'carStatus',
  // },
  {
    title: '操作人',
    key: 'outOperatePerson',
  },
].map((it, index) => {
  it.sort = index;
  return it;
});

export const containerForecastTitleGroup = [
  {
    title: '预计入库日期',
    key: 'planArriveDateTime',
  },
  {
    title: '预计时间',
    key: 'inHouseTime',
  },
  {
    title: '柜号',
    key: 'containerNo',
  },
  {
    title: '客户ID',
    key: 'customerName',
  },
  {
    title: '仓库',
    key: 'warehouseId',
  },
  {
    title: '数量',
    key: 'arrivedCount',
  },
  {
    title: '状态',
    key: 'inStatus',
  },
  {
    title: '操作人',
    key: 'unloadPerson',
  },
  {
    title: '用户名',
    key: 'salesName',
  },
  {
    title: '备注',
    key: 'note',
  },
  {
    title: '结算状态',
    key: 'containerFinalStatus',
  },
].map((it, index) => {
  it.sort = index;
  return it;
});
