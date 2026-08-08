export interface LoyaltySettings {
  id: string;
  pointsPerVisit: number;
  /** Points à atteindre pour débloquer la récompense. */
  rewardThreshold: number;
  /** Ce qui est offert, ex. « soin offert », « séance offerte ». */
  rewardLabel: string;
  updatedAt?: string;
}

export interface LoyaltySettingsUpdateDto {
  pointsPerVisit?: number;
  rewardThreshold?: number;
  rewardLabel?: string;
}