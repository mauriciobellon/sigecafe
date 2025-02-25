import { getServerSession } from '#auth'
import { defineEventHandler, createError } from 'h3'
import { hasPermission } from '../utils/permissions'
import type { Usuario } from '@prisma/client'

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
    '/api/auth',
    '/_nuxt',
    '/favicon',
    '/__nuxt_error',
    '/auth',
    '/api/_nuxt_icon',
    '/api/navigation',
    '/200.html',
    '/404.html',
    '/500.html',
] as const

// Define static asset extensions that should be public
const PUBLIC_ASSET_EXTENSIONS = [
    '.js',
    '.css',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.ico',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot'
] as const

/**
 * Checks if a path is public and doesn't require authentication
 */
function isPublicPath(path: string): boolean {
    // Check if path starts with any public pattern
    if (PUBLIC_PATHS.some(pattern => path.startsWith(pattern))) {
        return true
    }

    // Check if path ends with any public asset extension
    if (PUBLIC_ASSET_EXTENSIONS.some(ext => path.endsWith(ext))) {
        return true
    }

    return false
}

/**
 * Checks if a path is a page route that requires permission checking
 */
function isPageRoute(path: string): boolean {
    // Root path doesn't need permission check
    if (path === '/') {
        return false
    }

    // Remove leading slash and split into segments
    const segments = path.replace(/^\//, '').split('/')

    // If last segment contains a dot, it's likely a file/asset
    if (segments[segments.length - 1].includes('.')) {
        return false
    }

    return true
}

/**
 * Main authentication middleware
 */
export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    const path = event.path

    // Allow public paths without authentication
    if (isPublicPath(path)) {
        return
    }

    // Require authentication for all other paths
    if (!session?.user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthenticated'
        })
    }

    // Check permissions for page routes
    if (isPageRoute(path)) {
        const routePath = '/' + path.split('/').slice(1).join('/')

        if (!hasPermission(routePath, (session.user as Usuario).type)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Acesso não autorizado'
            })
        }
    }
})