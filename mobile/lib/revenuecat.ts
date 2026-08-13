export const revenueCatProducts = {
  clubMonthly: 'belline_club_monthly',
  expertMonthly: 'belline_expert_monthly',
} as const;

export const revenueCatEntitlements = {
  club: 'club',
  expert: 'expert',
} as const;

// SDK initialization is intentionally deferred until native store products exist.
// Never grant access from this client-side configuration alone.
