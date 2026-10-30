import { Permission } from "../models/Permission";

export type ActionKey = "ver" | "listar" | "crear" | "actualizar" | "eliminar";

export interface MatrixRow {
  resource: string;
  model: string;
  permissionsByAction: Record<ActionKey, Permission[]>;
}

export type MatrixGroups = Record<string, MatrixRow[]>;

export interface RolePermissionSummary {
  total: number;
  assigned: number;
  unassigned: number;
  percentage: number;
}

export const ACTION_KEYS: ActionKey[] = ["ver", "listar", "crear", "actualizar", "eliminar"];

export function buildRolePermissionSummary(
  total: number,
  assigned: number,
): RolePermissionSummary {
  const safeTotal = Math.max(0, total);
  const safeAssigned = Math.max(0, assigned);

  return {
    total: safeTotal,
    assigned: safeAssigned,
    unassigned: Math.max(0, safeTotal - safeAssigned),
    percentage: safeTotal === 0 ? 0 : Math.round((safeAssigned / safeTotal) * 100),
  };
}

const MODULE_GROUPS: Record<string, string[]> = {
  "Administración": ["User", "Profile", "Session", "Role", "UserRole", "Permission", "RolePermission"],
  "Gestión Deportiva": ["Tournament", "Team", "Player", "Match"],
  "Comercial": ["Ticket", "Entry"],
  "Infraestructura": ["Venue", "Scenario"],
  "Reportes": ["Report"],
};

const RESOURCE_LABELS: Record<string, string> = {
  User: "Usuarios",
  Role: "Roles",
  Permission: "Permisos",
  Profile: "Perfiles",
  Session: "Sesiones",
  UserRole: "Roles de usuario",
  RolePermission: "Permisos de rol",
  Tournament: "Torneos",
  Team: "Equipos",
  Player: "Jugadores",
  Match: "Partidos",
  Ticket: "Entradas",
  Entry: "Entradas",
  Venue: "Escenarios",
  Scenario: "Escenarios",
  Report: "Reportes",
};

// El recurso se deduce de la URL (es lo más confiable): /api/users -> User.
const URL_SEGMENT_TO_MODEL: Record<string, string> = {
  users: "User",
  profile: "Profile",
  profiles: "Profile",
  sessions: "Session",
  roles: "Role",
  "user-roles": "User",
  permissions: "Permission",
  "role-permissions": "RolePermission",
  tournaments: "Tournament",
  teams: "Team",
  players: "Player",
  matches: "Match",
  tickets: "Ticket",
  entries: "Entry",
  venues: "Venue",
  scenarios: "Scenario",
  reports: "Report",
};

const PATH_PARAM = /^\{.*\}$|^\d+$/;

function getResourceSegment(url: string): string | null {
  const segments = url.split("/").filter(Boolean);
  const path = segments[0] === "api" ? segments.slice(1) : segments;
  if (path.length === 0) return null;

  // /api/users/{id}/sessions -> el recurso es "sessions"
  const isNested = path.length >= 3 && PATH_PARAM.test(path[1]) && !PATH_PARAM.test(path[2]);
  return isNested ? path[2] : path[0];
}

export function getPermissionModel(permission: Permission): string {
  // El backend actual no devuelve model; si en el futuro lo expone, se prioriza.
  if (permission.model?.trim()) {
    return permission.model.trim();
  }

  const resource = getResourceSegment(permission.url);
  if (resource) {
    return URL_SEGMENT_TO_MODEL[resource] ?? resource.charAt(0).toUpperCase() + resource.slice(1);
  }

  return "Otro";
}

export function getPermissionResourceLabel(permission: Permission): string {
  const model = getPermissionModel(permission);
  return RESOURCE_LABELS[model] ?? model;
}

function getAction(permission: Permission): ActionKey | null {
  const method = permission.method.toUpperCase();

  if (method === "GET") {
    const isSingleResource = permission.url.includes("{") || /\/\d+$/.test(permission.url);
    return isSingleResource ? "ver" : "listar";
  }
  if (method === "POST") return "crear";
  if (method === "PUT" || method === "PATCH") return "actualizar";
  if (method === "DELETE") return "eliminar";
  return null;
}

function buildRow(model: string, permissions: Permission[]): MatrixRow {
  const permissionsByAction: Record<ActionKey, Permission[]> = {
    ver: [],
    listar: [],
    crear: [],
    actualizar: [],
    eliminar: [],
  };

  for (const permission of permissions) {
    const action = getAction(permission);
    if (action) permissionsByAction[action].push(permission);
  }

  return { resource: RESOURCE_LABELS[model] ?? model, model, permissionsByAction };
}

export function buildMatrixGroups(permissions: Permission[]): MatrixGroups {
  const byModel = new Map<string, Permission[]>();
  for (const permission of permissions) {
    const model = getPermissionModel(permission);
    byModel.set(model, [...(byModel.get(model) ?? []), permission]);
  }

  const groups: MatrixGroups = {};
  const knownModels = new Set<string>();

  for (const [moduleName, models] of Object.entries(MODULE_GROUPS)) {
    models.forEach((model) => knownModels.add(model));
    const rows = models.flatMap((model) => {
      const modelPermissions = byModel.get(model);
      return modelPermissions ? [buildRow(model, modelPermissions)] : [];
    });
    if (rows.length > 0) groups[moduleName] = rows;
  }

  const otherRows = [...byModel.entries()]
    .filter(([model]) => !knownModels.has(model))
    .map(([model, modelPermissions]) => buildRow(model, modelPermissions));
  if (otherRows.length > 0) groups["Otros"] = otherRows;

  return groups;
}

export function countModulesWithAccess(groups: MatrixGroups, assignedIds: Set<number>): number {
  return Object.values(groups).filter((rows) =>
    rows.some((row) =>
      ACTION_KEYS.some((action) => row.permissionsByAction[action].some((permission) => assignedIds.has(permission.id))),
    ),
  ).length;
}
