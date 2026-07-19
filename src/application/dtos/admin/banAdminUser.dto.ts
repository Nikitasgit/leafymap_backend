export interface BanAdminUserInput {
  adminId: string;
  userId: string;
  reason: string;
  duration?: number;
}

export interface UnbanAdminUserInput {
  adminId: string;
  userId: string;
}
