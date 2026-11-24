interface PlayerEntry {
  userId?: number;
  document?: string;
}

interface MatchEntry {
  homeTeamId?: number | null;
  awayTeamId?: number | null;
}

const usersById = new Map<number, string>();
const playersById = new Map<number, PlayerEntry>();
const teamsById = new Map<number, string>();
const skillsById = new Map<number, string>();
const sportsById = new Map<number, string>();
const tournamentsById = new Map<number, string>();
const phasesById = new Map<number, string>();
const groupsById = new Map<number, string>();
const matchesById = new Map<number, MatchEntry>();
const rolesById = new Map<number, string>();
const permissionsById = new Map<number, string>();

function toValidId(value: unknown): number | null {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

function toNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function asArray(data: unknown): Record<string, any>[] {
  if (Array.isArray(data)) {
    return data.filter((item) => item && typeof item === "object");
  }
  if (data && typeof data === "object") {
    return [data as Record<string, any>];
  }
  return [];
}

export function registerUsers(data: unknown): void {
  for (const item of asArray(data)) {
    const id = toValidId(item.id);
    const name = toNonEmptyString(item.name);
    if (id && name) {
      usersById.set(id, name);
    }
  }
}

export function registerRoles(data: unknown): void {
  for (const item of asArray(data)) {
    const id = toValidId(item.id);
    const name = toNonEmptyString(item.name);
    if (id && name) {
      rolesById.set(id, name);
    }
  }
}

export function registerPermissions(data: unknown): void {
  for (const item of asArray(data)) {
    const id = toValidId(item.id);
    const method = toNonEmptyString(item.method);
    const url = toNonEmptyString(item.url);
    if (id && method && url) {
      permissionsById.set(id, `${method} ${url}`);
    }
  }
}

function registerPlayerItem(item: Record<string, any>): void {
  const id = toValidId(item.id);
  if (!id) return;
  const userId = toValidId(item.userId) ?? undefined;
  const document = toNonEmptyString(item.document) ?? undefined;
  const existing = playersById.get(id);
  playersById.set(id, {
    userId: userId ?? existing?.userId,
    document: document ?? existing?.document,
  });
}

function registerNamedItem(
  target: Map<number, string>,
  item: Record<string, any>,
): void {
  const id = toValidId(item.id);
  const name = toNonEmptyString(item.name);
  if (id && name) {
    target.set(id, name);
  }
}

function registerMatchItem(item: Record<string, any>): void {
  const id = toValidId(item.id);
  if (!id) return;
  matchesById.set(id, {
    homeTeamId: toValidId(item.homeTeamId),
    awayTeamId: toValidId(item.awayTeamId),
  });
  if (item.homeTeam && typeof item.homeTeam === "object") {
    registerNamedItem(teamsById, item.homeTeam);
  }
  if (item.awayTeam && typeof item.awayTeam === "object") {
    registerNamedItem(teamsById, item.awayTeam);
  }
}

function captureNestedEntities(item: Record<string, any>): void {
  if (item.user && typeof item.user === "object") {
    registerUsers(item.user);
  }
  if (item.role && typeof item.role === "object") {
    registerRoles(item.role);
  }
  if (item.permission && typeof item.permission === "object") {
    registerPermissions(item.permission);
  }
  if (item.player && typeof item.player === "object") {
    registerPlayerItem(item.player);
  }
  if (item.team && typeof item.team === "object") {
    registerNamedItem(teamsById, item.team);
  }
  if (item.homeTeam && typeof item.homeTeam === "object") {
    registerNamedItem(teamsById, item.homeTeam);
  }
  if (item.awayTeam && typeof item.awayTeam === "object") {
    registerNamedItem(teamsById, item.awayTeam);
  }
  if (item.skill && typeof item.skill === "object") {
    registerNamedItem(skillsById, item.skill);
  }
  if (item.sport && typeof item.sport === "object") {
    registerNamedItem(sportsById, item.sport);
  }
  if (item.tournament && typeof item.tournament === "object") {
    registerNamedItem(tournamentsById, item.tournament);
  }
  if (item.phase && typeof item.phase === "object") {
    registerNamedItem(phasesById, item.phase);
  }
  if (item.group && typeof item.group === "object") {
    registerNamedItem(groupsById, item.group);
  }
  if (item.match && typeof item.match === "object") {
    registerMatchItem(item.match);
  }
  if (Array.isArray(item.skills)) {
    item.skills.forEach((s: any) => {
      if (s && typeof s === "object") {
        if (s.skill && typeof s.skill === "object") {
          registerNamedItem(skillsById, s.skill);
        } else {
          registerNamedItem(skillsById, s);
        }
      }
    });
  }
  if (Array.isArray(item.contracts)) {
    item.contracts.forEach((c: any) => {
      if (c && typeof c === "object") captureNestedEntities(c);
    });
  }
}

export function captureSecurityEntitiesFromResponse(
  endpoint: string,
  data: unknown,
): void {
  const cleanPath = endpoint.split("?")[0].replace(/\/+$/, "");
  const items = asArray(data);
  if (items.length === 0) return;

  if (/^\/users(\/\d+)?(\/detail.*)?$/.test(cleanPath)) {
    registerUsers(items);
  } else if (/^\/roles(\/\d+)?$/.test(cleanPath)) {
    registerRoles(items);
  } else if (/^\/permissions(\/\d+)?$/.test(cleanPath)) {
    registerPermissions(items);
  }

  items.forEach(captureNestedEntities);
}

export function captureSportsEntitiesFromResponse(
  path: string,
  data: unknown,
): void {
  const cleanPath = path.split("?")[0].replace(/\/+$/, "");
  const items = asArray(data);
  if (items.length === 0) return;

  if (/^\/players(\/\d+)?(\/(activate|deactivate))?$/.test(cleanPath)) {
    items.forEach(registerPlayerItem);
  } else if (/^\/teams(\/\d+)?(\/(activate|deactivate))?$/.test(cleanPath)) {
    items.forEach((item) => registerNamedItem(teamsById, item));
  } else if (/^\/skills(\/\d+)?$/.test(cleanPath)) {
    items.forEach((item) => registerNamedItem(skillsById, item));
  } else if (/^\/sports(\/\d+)?$/.test(cleanPath)) {
    items.forEach((item) => registerNamedItem(sportsById, item));
  } else if (
    /^\/tournaments(\/\d+)?(\/(activate|deactivate))?$/.test(cleanPath)
  ) {
    items.forEach((item) => registerNamedItem(tournamentsById, item));
  } else if (/^(\/tournaments\/\d+)?\/phases(\/\d+)?$/.test(cleanPath)) {
    items.forEach((item) => registerNamedItem(phasesById, item));
  } else if (/^(\/phases\/\d+)?\/groups(\/\d+)?$/.test(cleanPath)) {
    items.forEach((item) => registerNamedItem(groupsById, item));
  } else if (
    /^\/matches(\/\d+)?(\/(start|finish|result))?$/.test(cleanPath)
  ) {
    items.forEach(registerMatchItem);
  }

  items.forEach(captureNestedEntities);
}

function getPlayerDisplayName(playerId: number): string | null {
  const entry = playersById.get(playerId);
  if (!entry) return null;
  if (entry.userId) {
    const userName = usersById.get(entry.userId);
    if (userName) return userName;
  }
  return entry.document ?? null;
}

function getMatchDisplayName(matchId: number): string | null {
  const entry = matchesById.get(matchId);
  if (!entry) return null;
  const home = entry.homeTeamId ? teamsById.get(entry.homeTeamId) : null;
  const away = entry.awayTeamId ? teamsById.get(entry.awayTeamId) : null;
  if (home && away) return `${home} vs ${away}`;
  return null;
}

const ENTITY_PATTERNS: Array<{
  regex: RegExp;
  resolve: (id: number) => string | null;
}> = [
  {
    regex: /\b(jugador)\s+(?:(?:con\s+)?id\s+|#)?(\d+)\b/gi,
    resolve: getPlayerDisplayName,
  },
  {
    regex: /\b(equipo)\s+(?:(?:con\s+)?id\s+|#)?(\d+)\b/gi,
    resolve: (id) => teamsById.get(id) ?? null,
  },
  {
    regex: /\b(habilidad)\s+(?:(?:con\s+)?id\s+|#)?(\d+)\b/gi,
    resolve: (id) => skillsById.get(id) ?? null,
  },
  {
    regex: /\b(deporte)\s+(?:(?:con\s+)?id\s+|#)?(\d+)\b/gi,
    resolve: (id) => sportsById.get(id) ?? null,
  },
  {
    regex: /\b(torneo)\s+(?:(?:con\s+)?id\s+|#)?(\d+)\b/gi,
    resolve: (id) => tournamentsById.get(id) ?? null,
  },
  {
    regex: /\b(fase)\s+(?:(?:con\s+)?id\s+|#)?(\d+)\b/gi,
    resolve: (id) => phasesById.get(id) ?? null,
  },
  {
    regex: /\b(grupo)\s+(?:(?:con\s+)?id\s+|#)?(\d+)\b/gi,
    resolve: (id) => groupsById.get(id) ?? null,
  },
  {
    regex: /\b(partido)\s+(?:(?:con\s+)?id\s+|#)?(\d+)\b/gi,
    resolve: getMatchDisplayName,
  },
  {
    regex: /\b(usuario)\s+(?:(?:con\s+)?id\s+|#)?(\d+)\b/gi,
    resolve: (id) => usersById.get(id) ?? null,
  },
  {
    regex: /\b(rol)\s+(?:(?:con\s+)?id\s+|#)?(\d+)\b/gi,
    resolve: (id) => rolesById.get(id) ?? null,
  },
  {
    regex: /\b(permiso)\s+(?:(?:con\s+)?id\s+|#)?(\d+)\b/gi,
    resolve: (id) => permissionsById.get(id) ?? null,
  },
];

export function formatEntityMessage(message: string): string {
  if (!message) return message;
  let formatted = message;
  for (const { regex, resolve } of ENTITY_PATTERNS) {
    formatted = formatted.replace(regex, (match, label: string, rawId: string) => {
      const id = toValidId(rawId);
      if (!id) return match;
      const name = resolve(id);
      return name ? `${label} "${name}"` : match;
    });
  }
  return formatted;
}
