import { IUser } from "@/types/models/user";

export const isBanActive = (
  user: Pick<IUser, "bannedAt" | "banExpiresAt">,
  now = new Date()
): boolean => {
  if (!user.bannedAt) return false;
  if (!user.banExpiresAt) return true;
  return user.banExpiresAt.getTime() > now.getTime();
};

export const getBanMessage = (
  user: Pick<IUser, "banReason" | "banExpiresAt">
): string => {
  const reason = user.banReason || "aucune raison communiquée";
  const until = user.banExpiresAt
    ? ` jusqu'au ${user.banExpiresAt.toLocaleDateString("fr-FR")}`
    : "";

  return `Votre compte a été banni${until}. Raison : ${reason}.`;
};
