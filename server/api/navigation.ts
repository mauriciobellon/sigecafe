import { defineEventHandler } from 'h3';
import { getServerSession } from '#auth';
import { getPermissions } from '@@/utils/permissions';
import { Usuario, UsuarioType } from '@prisma/client';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);

  if (!session?.user) {
    return [];
  }

  const usuarioType = (session.user as Usuario)?.type;

  const permissions = await getPermissions();

  const allPagesWithShowInAndTitle = permissions.filter(page => page.menuType && page.title)

  const filteredLinks = allPagesWithShowInAndTitle
    .filter(route => route.usuarioType.includes(usuarioType as UsuarioType))
    .sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    .map(route => ({
      path: route.path,
      title: route.title,
      icon: route.icon,
      menuType: route.menuType,
      description: route.description,
    }));

  const dashboardIndex = filteredLinks.findIndex(p => p.path === "/app");
  if (dashboardIndex !== -1) {
    const [dashboardPage] = filteredLinks.splice(dashboardIndex, 1);
    filteredLinks.unshift(dashboardPage);
  }

  return filteredLinks;
});
