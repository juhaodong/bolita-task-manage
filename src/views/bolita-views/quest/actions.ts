import { QuestModel } from '@/api/quest/quest-type';

interface Action {
  label: string;
  onClick: Fn;
  showInStatus?: any[];
  auth?: any[];
}
interface ActionDetail {
  record: QuestModel;
  openDetail(model: QuestModel);
  reload();
}
export function getQuestActions(detail: ActionDetail): Action[] {
  return [
    {
      label: '详情',
      onClick() {
        detail.openDetail(detail.record);
      },
    },
  ];
}
