import { FormField } from '@/views/bolita-views/composable/form-field-type';

export enum UserType {
  Manager = '管理员',
  Customer = '客户',
  Storage = '仓库',
  FrontOperations = '运营部前端',
  BackendOperations = '运营部后端',
  Logistic = '物流部',
  Cash = '结算部门',
}

export const UserTypeByArray = [
  { label: '管理员', value: 'Manager' },
  { label: '客户', value: 'Customer' },
  { label: '仓库', value: 'Storage' },
  { label: '运营部前端', value: 'FrontOperations' },
  { label: '运营部后端', value: 'BackendOperations' },
  { label: '物流部', value: 'Logistic' },
  { label: '结算部门', value: 'Cash' },
];

export const filters: FormField[] = [
  {
    label: '名称',
    field: 'realName',
  },
  {
    label: '公司',
    field: 'company',
  },
  {
    label: '部门',
    field: 'department',
  },
];

export const powerList = [
  {
    label: '货柜预报',
    key: 'forecastContainer',
    children: [
      { label: '新建货柜预报', key: 'forecastAdd' },
      { label: '修改', key: 'forecastEdit' },
      { label: '上传卸柜单', key: 'forecastUpload' },
      { label: '卸柜', key: 'forecastDownload' },
      { label: '生成卸柜单', key: 'forecastCreatFile' },
      { label: '取消', key: 'forecastCancel' },
      { label: '结算', key: 'forecastSettle' },
      { label: '浏览', key: 'forecastView' },
    ],
  },
  {
    label: '任务明细',
    key: 'mission',
    children: [
      { label: '新建出库计划', key: 'missionOutboundAdd' },
      { label: '审核', key: 'missionCheck' },
      { label: '报价', key: 'missionPriceOffer' },
      { label: '结算', key: 'missionSettle' },
      { label: '修改', key: 'missionEdit' },
      { label: '时间线', key: 'missionTimeline' },
      { label: 'POD', key: 'missionPOD' },
      { label: '换单文件', key: 'missionChangeFile' },
      { label: '托盘标签', key: 'missionTrayTag' },
      { label: '操作文件', key: 'missionOperationFile' },
      { label: '问题图片', key: 'missionProblemPic' },
      { label: '添加托盘', key: 'missionAddTray' },
      { label: '浏览整柜看板', key: 'missionAllView' },
      { label: '浏览审核看板', key: 'missionCheckView' },
      { label: '浏览报价看板', key: 'missionOfferView' },
      { label: '浏览存仓看板', key: 'missionStorageView' },
    ],
  },
  {
    label: '仓库明细',
    key: 'storage',
    children: [
      {
        label: '出库任务',
        key: 'outMission',
        children: [
          { label: '上传装车单', key: 'outMissionUploadFile' },
          { label: '装车', key: 'outMissionUpCar' },
          { label: '生成装车单', key: 'outMissionCreatUpCarFile' },
          { label: '修改', key: 'outMissionEdit' },
          { label: '结算', key: 'outMissionSettle' },
          { label: '浏览', key: 'outMissionView' },
        ],
      },
      {
        label: '库内操作',
        key: 'inStorage',
        children: [
          { label: '修改', key: 'inStorageEdit' },
          { label: '结算', key: 'inStorageSettle' },
          { label: '时间线', key: 'inStorageTimeLine' },
          { label: '换单文件', key: 'inStorageChangeFiles' },
          { label: '添加托盘', key: 'inStorageAddTray' },
          { label: '转库外', key: 'inStorageTurnToOut' },
          { label: 'POD', key: 'inStoragePOD' },
          { label: '操作文件', key: 'inStorageOperationFile' },
          { label: '问题图片', key: 'inStorageProblemPic' },
          { label: '浏览', key: 'inStorageView' },
        ],
      },
    ],
  },
  {
    label: '订车管理',
    key: 'car',
    children: [
      {
        label: '订车管理',
        key: 'orderCar',
        children: [
          { label: '提单', key: 'orderCarOrder' },
          { label: 'CMR', key: 'orderCarCMR' },
          { label: 'POD', key: 'orderCarPOD' },
          { label: '修改', key: 'orderCarEdit' },
          { label: '报价', key: 'orderCarOffer' },
          { label: '订车', key: 'orderCarBookingCar' },
          { label: '浏览', key: 'orderCarView' },
        ],
      },
      {
        label: '订车明细',
        key: 'carDetail',
        children: [
          { label: '审核', key: 'carDetailCheck' },
          { label: '浏览', key: 'carDetailView' },
        ],
      },
      {
        label: '库外订车',
        key: 'outStorageCar',
        children: [
          { label: '新建库外订车', key: 'outStorageCarAdd' },
          { label: '修改', key: 'outStorageEdit' },
          { label: '浏览', key: 'outStorageView' },
        ],
      },
    ],
  },
  {
    label: '结算管理',
    key: 'settlement',
    children: [
      {
        label: '结算管理',
        key: 'settlementManage',
        children: [
          { label: '合并对账', key: 'settlementManageMerge' },
          { label: '修改', key: 'settlementManageEdit' },
          { label: '浏览', key: 'settlementManageView' },
        ],
      },
      {
        label: '对账管理',
        key: 'billManage',
        children: [
          { label: '修改', key: 'billManageEdit' },
          { label: '附件', key: 'billManageFile' },
          { label: '浏览', key: 'billManageView' },
        ],
      },
    ],
  },
];
