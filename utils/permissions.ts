import prisma from "@@/lib/prisma";
import type { Permission, UsuarioType } from "@prisma/client";

let cachedPermissions: Permission[] | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 10000;

export const getPermissions = async (): Promise<Permission[]> => {
  const now = Date.now();
  if (cachedPermissions && now - lastCacheTime < CACHE_DURATION) {
    return cachedPermissions;
  }
  cachedPermissions = await prisma.permission.findMany();
  lastCacheTime = now;
  return cachedPermissions;
};

export const hasPermission = async (path: string, usuarioType: UsuarioType): Promise<boolean> => {
  const permissions = await getPermissions();
  const route = permissions.find((r) => r.path === path);
  return route ? route.usuarioType.includes(usuarioType) : false;
};
