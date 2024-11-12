export default defineNuxtConfig({
  compatibilityDate: "2024-11-09",
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },
  experimental: { watcher: "chokidar" },

  modules: [
    "@morev/vue-transitions/nuxt",
    "@prisma/nuxt",
    "@nuxt/test-utils",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@vueuse/nuxt",
    "@nuxt/icon",
    "@nuxt/fonts",
    "@sidebase/nuxt-auth",
    "@pinia/nuxt",
  ],

  auth: {
    globalAppMiddleware: true,
    originEnvKey: "NUXT_AUTH_ORIGIN",
    baseURL: `${process.env.BASE_URL || "http://localhost:3000"}/api/auth`,
    provider: {
      type: "authjs",
    },
    sessionRefresh: {
      enablePeriodically: parseInt(process.env.SESSION_REFRESH_SECONDS ?? '10') * 1000,
    },
  },

  prisma: {
    installCLI: false,
    installClient: false,
    generateClient: false,
    installStudio: false,
    autoSetupPrisma: true,
  },

  vite: {
    resolve: {
      alias: {
        ".prisma/client/index-browser":
          "./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/.prisma/client/index-browser.js",
      },
    },
  },

  tailwindcss: {
    exposeConfig: true,
    editorSupport: true,
  },

  css: ["~/assets/css/global.css"],

  colorMode: {
    classSuffix: "",
  },

  imports: {
    imports: [
      {
        from: "tailwind-variants",
        name: "tv",
      },
      {
        from: "tailwind-variants",
        name: "VariantProps",
        type: true,
      },
      {
        from: "vue-sonner",
        name: "toast",
        as: "useSonner",
      },
    ],
  },

  app: {
    pageTransition: { name: "fade", mode: "out-in" },
    layoutTransition: { name: "fade", mode: "out-in" },
    head: {
      script: [
        {
          src: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/pdfmake.min.js",
          defer: true,
        },
        {
          src: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/vfs_fonts.min.js",
          defer: true,
        },
      ],
    },
  },

  build: {
    transpile: ["vue-sonner"],
  },
});
