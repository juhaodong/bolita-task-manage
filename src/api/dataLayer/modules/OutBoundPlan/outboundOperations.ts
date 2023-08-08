export interface OperationInfo {
  name: string;
  price: any;
  amount: any;
  note: string;
  category: OperationType;
}

export enum OperationType {
  Normal = '操作',
  Special = '特殊操作',
  Waste = '耗材',
}

export const operationInfos: OperationInfo[] = [
  { name: '出库', price: 0, amount: '', note: '', category: OperationType.Normal },
  { name: '大标签', price: 0, amount: '', note: '', category: OperationType.Normal },
  { name: '换标', price: 0, amount: '', note: '', category: OperationType.Normal },
  { name: '换单', price: 0, amount: '', note: '', category: OperationType.Normal },
  { name: '打托', price: 0, amount: '', note: '', category: OperationType.Normal },
  { name: '装箱', price: 0, amount: '', note: '', category: OperationType.Normal },
  { name: '覆盖', price: 0, amount: '', note: '', category: OperationType.Special },
  { name: '清点', price: 0, amount: '', note: '', category: OperationType.Special },
  { name: '拍照', price: 0, amount: '', note: '', category: OperationType.Special },
  { name: '加固', price: 0, amount: '', note: '', category: OperationType.Special },
  { name: '销毁', price: 0, amount: '', note: '', category: OperationType.Special },
  { name: '其它', price: 0, amount: '', note: '', category: OperationType.Special },
  { name: '欧版托盘', price: 0, amount: '', note: '', category: OperationType.Waste },
  { name: '一次性托盘', price: 0, amount: '', note: '', category: OperationType.Waste },
  { name: '纸箱', price: 0, amount: '', note: '', category: OperationType.Waste },
  { name: '其他耗材', price: 0, amount: '', note: '', category: OperationType.Waste },
];
