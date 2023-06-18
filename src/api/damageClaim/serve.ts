export enum DamageClaimStatus {
  waitForAccept = '待接受',
  waitForInventory = '等待仓库反馈',
  waitForDelivery = '等待渠道反馈',
  claimNotAccept = '索赔未受理',
  agreeClaim = '同意索赔',
  disagreeClaim = '索赔被拒绝',
  CompletedConfirmed = '已完成',
}
