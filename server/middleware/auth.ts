import { getServerSession } from '#auth'
import { defineEventHandler, createError } from 'h3'
import { hasPermission } from '@@/utils/permissions'
import type { Usuario } from '@prisma/client'

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    const path = event.path

    const publicPatterns = [
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
    ]

    const isPublic = publicPatterns.some(pattern => path.startsWith(pattern))
    if (isPublic) {
        return
    }

    if (!session?.user) {
        throw createError({
            statusMessage: 'Unauthenticated',
            statusCode: 403
        })
    }

    if (isPageRoute(path)) {
        const routePath = '/' + path.split('/').slice(1).join('/')
        if (!hasPermission(routePath, (session.user as Usuario).type)) {
            throw createError({
                statusMessage: 'Acesso não autorizado',
                statusCode: 403
            })
        }
    }
})

function isPageRoute(path: string): boolean {
    if (path === '/') {
        return false
    }
    const segments = path.replace(/^\//, '').split('/')
    if (segments[segments.length - 1].includes('.')) {
        return false
    }
    return true
}