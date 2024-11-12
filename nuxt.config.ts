export default defineNuxtConfig({
  compatibilityDate: "2024-11-09",
  devtools: { enabled: false },
  modules: [
    "@prisma/nuxt",
    "@nuxt/test-utils"
  ],
  experimental: {
    watcher: 'chokidar'
  },
  prisma: {
    installCLI: false,
    installClient: false,
    generateClient: false,
    installStudio: true,
    autoSetupPrisma: true,
  },
  vite: {
    resolve: {
      alias: {
        '.prisma/client/index-browser': './node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/.prisma/client/index-browser.js',
      },
    },
  },
})