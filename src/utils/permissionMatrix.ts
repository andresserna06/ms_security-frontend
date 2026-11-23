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

export function buildRolePermissionSummary(total: number, assigned: number): RolePermissionSummary {
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
  Administración: [
    "User",
    "Profile",
    "Session",
    "Role",
    "UserRole",
    "Permission",
    "RolePermission",
  ],
  "Gestión Deportiva": [
    "Tournament",
    "Registration",
    "Phase",
    "Group",
    "Final",
    "Team",
    "Player",
    "Match",
  ],
  Comercial: ["Ticket", "Entry"],
  Infraestructura: ["Venue", "Scenario"],
  Reportes: ["Report"],
};

export const MODULE_NAMES = [...Object.keys(MODULE_GROUPS), "Otros"];

const MODEL_TO_MODULE = new Map(
  Object.entries(MODULE_GROUPS).flatMap(([moduleName, models]) =>
    models.map((model) => [model, moduleName] as const),
  ),
);
const ADMINISTRATION_MODELS = new Set(MODULE_GROUPS.Administración);

const RESOURCE_LABELS: Record<string, string> = {
  User: "Usuarios",
  Role: "Roles",
  Permission: "Permisos",
  Profile: "Perfiles",
  Session: "Sesiones",
  UserRole: "Roles de usuario",
  RolePermission: "Permisos de rol",
  Tournament: "Torneos",
  Registration: "Inscripciones",
  Phase: "Fases",
  Group: "Grupos",
  Final: "Finales",
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
  "user-roles": "UserRole",
  user: "User",
  permissions: "Permission",
  permission: "Permission",
  "role-permissions": "RolePermission",
  tournaments: "Tournament",
  registrations: "Registration",
  phases: "Phase",
  groups: "Group",
  finals: "Final",
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

export function getPermissionModule(permission: Permission): string {
  if (permission.module?.trim()) {
    return permission.module.trim();
  }

  return MODEL_TO_MODULE.get(getPermissionModel(permission)) ?? "Otros";
}

export function getPermissionResourceLabel(permission: Permission): string {
  const model = getPermissionModel(permission);
  return RESOURCE_LABELS[model] ?? model;
}

function getAction(permission: Permission): ActionKey | null {
  const method = permission.method?.trim().toUpperCase();
  if (!method) return null;

  if (method === "GET") {
    return GET_LIST_ENDPOINTS.some((url) => matchesEndpointPattern(url, permission.url))
      ? "listar"
      : "ver";
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

const GET_LIST_ENDPOINTS = [
  "/api/users",
  "/api/users/{userId}/sessions",
  "/api/roles",
  "/api/permissions",
  "/api/user-roles",
  "/api/user-roles/users/{userId}",
  "/api/user-roles/roles/{roleId}",
  "/api/role-permissions",
  "/api/role-permissions/roles/{roleId}",
  "/api/role-permissions/permissions/{permissionId}",
];

function matchesEndpointPattern(pattern: string, url: string): boolean {
  const expectedSegments = pattern.split("/").filter(Boolean);
  const actualSegments = url.replace(/\/+$/, "").split("/").filter(Boolean);

  return (
    expectedSegments.length === actualSegments.length &&
    expectedSegments.every((segment, index) =>
      /^\{[^/]+\}$/.test(segment)
        ? actualSegments[index].length > 0
        : segment === actualSegments[index],
    )
  );
}

export function isMatrixPermission(permission: Permission): boolean {
  const method = permission.method?.trim().toUpperCase();
  return Boolean(method && permission.url?.trim() && getAction(permission));
}

export function buildMatrixGroups(permissions: Permission[]): MatrixGroups {
  const byModule = new Map<string, Map<string, Permission[]>>();
  for (const permission of permissions.filter(isMatrixPermission)) {
    const model = getPermissionModel(permission);
    const moduleName = ADMINISTRATION_MODELS.has(model) ? "Administración" : "Otros";
    const byModel = byModule.get(moduleName) ?? new Map<string, Permission[]>();
    byModel.set(model, [...(byModel.get(model) ?? []), permission]);
    byModule.set(moduleName, byModel);
  }

  const groups: MatrixGroups = {};
  const moduleNames = [...MODULE_NAMES, ...byModule.keys()].filter(
    (moduleName, index, names) => names.indexOf(moduleName) === index,
  );
  for (const moduleName of moduleNames) {
    const byModel = byModule.get(moduleName);
    if (!byModel) continue;

    const rows = [...byModel.entries()].map(([model, modelPermissions]) =>
      buildRow(model, modelPermissions),
    );
    if (rows.length > 0) groups[moduleName] = rows;
  }

  return groups;
}

export function countModulesWithAccess(groups: MatrixGroups, assignedIds: Set<number>): number {
  return Object.values(groups).filter((rows) =>
    rows.some((row) =>
      ACTION_KEYS.some((action) =>
        row.permissionsByAction[action].some((permission) => assignedIds.has(permission.id)),
      ),
    ),
  ).length;
}
