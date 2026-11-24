import { SportsApiError, sportsRequest } from "./sportsHttp";

const FAN_ROLE_NAMES = new Set(["AFICIONADO", "FAN"]);

export function isFanRoleName(roleName?: string | null): boolean {
  if (!roleName) return false;
  return FAN_ROLE_NAMES.has(roleName.trim().toUpperCase());
}

export async function registerFan(userId: number): Promise<void> {
  try {
    await sportsRequest<unknown>("/fans", {
      method: "POST",
      body: JSON.stringify({ userId: Number(userId) }),
    });
  } catch (error) {
    if (error instanceof SportsApiError && error.status === 409) {
      return;
    }
    throw error;
  }
}
