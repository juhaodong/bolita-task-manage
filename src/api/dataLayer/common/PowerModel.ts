export enum NotifyListPower {
  editFee = '修改费用',
  Operate = '入库计划操作',
  CostSave = '入库计划保存结算',
  CostConfirm = '入库计划确认结算',
}

export enum NotifyDetailPower {
  Setting = '入库明细批量设置库位',
  ChangeStatusPlan = '入库明细转出库计划',
}

export enum ToBeClaimedPower {
  Edit = '待认领修改',
  ClaimedGoodsOperate = '待认领认领动作',
  Add = '待认领新建待认领',
  ClaimedGoodsBtn = '待认领认领按钮',
}

export enum OutBoundPlanPower {
  Edit = '出库计划编辑',
  Add = '出库计划新建出库计划',
  ChangeTray = '出库计划托盘置换',
}

export enum OutBoundDetailPower {
  Edit = '出库明细修改',
  Check = '出库明细审核',
  EditDetail = '出库明细编辑出库明细',
}

export enum LogisticsDetailPower {
  AllowCheckForm = '物流详情允许查看运输公司,账单号,价格',
  CostOperate = '物流详情费用动作',
  CustomerBills = '物流详情客户账单',
  BookCar = '物流详情订车',
  CancelBookCar = '物流详情取消订车',
  SubmitQuotation = '物流详情提交报价',
  ConfirmQuotation = '物流详情确认报价',
}

export enum CarpoolManagementPower {
  Edit = '订车管理修改',
  SubmitOrder = '订车管理提单',
  POD = '订车管理POD',
  Bill = '订车管理账单',
  Cost = '订车管理费用',
  SubmitPay = '订车管理提交付款',
  ConfirmPay = '订车管理确认付款',
}

export enum SettlementPower {
  confirmGetAllGoods = '结算管理确认全部到货',
  confirmSettlement = '结算管理确认结算',
  saveSettlement = '结算管理保存结算',
}

export const allPowerList = [
  Object.values(NotifyListPower),
  Object.values(NotifyDetailPower),
  Object.values(ToBeClaimedPower),
  Object.values(OutBoundPlanPower),
  Object.values(OutBoundDetailPower),
  Object.values(LogisticsDetailPower),
  Object.values(CarpoolManagementPower),
  Object.values(SettlementPower),
].flat();

export const AccountPower = [
  { id: 1, name: '管理员', Power: allPowerList },

  {
    id: 2,
    name: '客户管理员',
    Power: [
      NotifyListPower.CostConfirm,
      NotifyDetailPower.ChangeStatusPlan,
      OutBoundPlanPower.Add,
      LogisticsDetailPower.ConfirmQuotation,
      SettlementPower.confirmSettlement,
    ],
  },

  {
    id: 3,
    name: '客户服务',
    Power: [
      NotifyDetailPower.ChangeStatusPlan,
      OutBoundPlanPower.Add,
      LogisticsDetailPower.ConfirmQuotation,
    ],
  },

  {
    id: 4,
    name: '操作员',
    Power: [
      NotifyListPower.editFee,
      NotifyListPower.CostSave,
      NotifyListPower.CostConfirm,
      NotifyListPower.Operate,
      NotifyDetailPower.Setting,
      ToBeClaimedPower.Add,
      ToBeClaimedPower.ClaimedGoodsOperate,
      ToBeClaimedPower.ClaimedGoodsBtn,
      ToBeClaimedPower.Edit,
      OutBoundPlanPower.Add,
      OutBoundPlanPower.Edit,
      OutBoundPlanPower.ChangeTray,
      OutBoundDetailPower.EditDetail,
      OutBoundDetailPower.Edit,
      LogisticsDetailPower.AllowCheckForm,
      LogisticsDetailPower.SubmitQuotation,
      LogisticsDetailPower.CostOperate,
      CarpoolManagementPower.POD,
      CarpoolManagementPower.SubmitOrder,
      SettlementPower.confirmGetAllGoods,
      SettlementPower.saveSettlement,
      SettlementPower.confirmSettlement,
    ],
  },

  {
    id: 5,
    name: '业务员',
    Power: [
      NotifyListPower.editFee,
      NotifyListPower.CostSave,
      NotifyListPower.CostConfirm,
      NotifyListPower.Operate,
      NotifyDetailPower.ChangeStatusPlan,
      NotifyDetailPower.Setting,
      ToBeClaimedPower.Add,
      ToBeClaimedPower.ClaimedGoodsOperate,
      ToBeClaimedPower.ClaimedGoodsBtn,
      ToBeClaimedPower.Edit,
      OutBoundPlanPower.Add,
      OutBoundPlanPower.Edit,
      OutBoundDetailPower.Check,
      OutBoundDetailPower.EditDetail,
      OutBoundDetailPower.Edit,
      LogisticsDetailPower.AllowCheckForm,
      LogisticsDetailPower.CostOperate,
      LogisticsDetailPower.SubmitQuotation,
      CarpoolManagementPower.SubmitOrder,
      CarpoolManagementPower.POD,
      SettlementPower.confirmGetAllGoods,
      SettlementPower.saveSettlement,
      SettlementPower.confirmSettlement,
    ],
  },

  {
    id: 6,
    name: '物流',
    Power: [
      NotifyListPower.editFee,
      ToBeClaimedPower.Add,
      ToBeClaimedPower.ClaimedGoodsBtn,
      OutBoundPlanPower.Edit,
      LogisticsDetailPower.AllowCheckForm,
      LogisticsDetailPower.BookCar,
      LogisticsDetailPower.CancelBookCar,
      LogisticsDetailPower.SubmitQuotation,
      LogisticsDetailPower.CostOperate,
      LogisticsDetailPower.CustomerBills,
      CarpoolManagementPower.Bill,
      CarpoolManagementPower.POD,
      CarpoolManagementPower.Cost,
      CarpoolManagementPower.SubmitPay,
      CarpoolManagementPower.SubmitOrder,
      CarpoolManagementPower.Edit,
    ],
  },

  {
    id: 7,
    name: '结算',
    Power: [
      NotifyListPower.editFee,
      NotifyListPower.CostSave,
      NotifyListPower.CostConfirm,
      NotifyListPower.Operate,
      LogisticsDetailPower.AllowCheckForm,
      LogisticsDetailPower.ConfirmQuotation,
      CarpoolManagementPower.POD,
      CarpoolManagementPower.SubmitOrder,
      SettlementPower.confirmGetAllGoods,
      SettlementPower.saveSettlement,
      SettlementPower.confirmSettlement,
    ],
  },
];
