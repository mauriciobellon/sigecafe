import { spawn } from "child_process";
import http from "http";

function verificarServidorRodando() {
  return new Promise((resolve) => {
    const req = http
      .get("http://localhost:3000", (res) => {
        resolve(true);
      })
      .on("error", () => {
        resolve(false);
      });
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function iniciar() {
  const servidorRodando = await verificarServidorRodando();

  if (servidorRodando) {
    console.log("Servidor já está rodando, iniciando testes...");
    const processoTeste = spawn("pnpm", ["dlx", "vitest"], {
      stdio: "inherit",
      detached: true,
    });

    processoTeste.on("exit", () => {
      process.exit();
    });
    return;
  }

  const processoDev = spawn("npm", ["run", "all"], {
    detached: true,
  });
  let processoTeste = null;

  function matarProcessos() {
    if (processoDev.pid) {
      try {
        process.kill(-processoDev.pid);
      } catch (e) {}
    }

    if (processoTeste?.pid) {
      try {
        process.kill(-processoTeste.pid);
      } catch (e) {}
    }
  }

  processoDev.stdout.on("data", (data) => {
    const saida = data.toString();
    if (saida.includes("Listening on http://[::]:3000")) {
      processoTeste = spawn("pnpm", ["dlx", "vitest"], {
        stdio: "inherit",
        detached: true,
      });

      processoTeste.on("exit", () => {
        matarProcessos();
        process.exit();
      });
    }
  });

  processoDev.stdout.pipe(process.stdout);
  processoDev.stderr.pipe(process.stderr);

  process.on("SIGINT", () => {
    matarProcessos();
    process.exit();
  });

  process.on("SIGTERM", () => {
    matarProcessos();
    process.exit();
  });
}

iniciar();
