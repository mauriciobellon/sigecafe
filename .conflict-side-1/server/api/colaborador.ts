import { getServerSession } from "#auth";
import { UsuarioRepository } from '@@/server/repositories/UsuarioRepository';
import type { Usuario, UsuarioType } from "@prisma/client";
import prisma from '@@/lib/prisma';

const repository = new UsuarioRepository();

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  console.log("Session user:", session.user);

  const method = event.method;

  // GET - Fetch all colaboradores
  if (method === "GET") {
    try {
      const currentUser = session.user as Usuario;

      // If no user, return an empty list
      if (!currentUser) {
        console.log("No user found in session");
        return [];
      }

      // ADMINISTRADOR might not have cooperativaId set directly, try to find it
      let cooperativaId = currentUser.cooperativaId;

      if (!cooperativaId && currentUser.type === "ADMINISTRADOR") {
        // For admin users, get the first cooperative (as a fallback)
        const cooperativas = await prisma.cooperativa.findMany({
          take: 1
        });

        if (cooperativas.length > 0) {
          cooperativaId = cooperativas[0].id;
          console.log("Admin user without cooperativaId, using first cooperative:", cooperativaId);
        }
      }

      if (!cooperativaId) {
        console.log("No cooperativaId found for user:", currentUser.id);
        return [];
      }

      console.log("Fetching colaboradores for cooperativa:", cooperativaId);

      // For admins and cooperativa managers, fetch all colaboradores from their cooperativa
      const colaboradores = await repository.getUsuarioByCooperativaAndType(
        cooperativaId,
        "COLABORADOR" as UsuarioType
      );

      console.log("Fetched colaboradores:", colaboradores.length);

      return colaboradores;
    } catch (error) {
      console.error("Error fetching colaboradores:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Error fetching colaboradores",
      });
    }
  }

  // POST - Create new colaborador
  if (method === "POST") {
    try {
      const body = await readBody(event);
      const currentUser = session.user as Usuario;

      // Set the colaborador type and associate with the admin's cooperativa
      body.type = "COLABORADOR";

      // If the current user has a cooperativaId, assign the same to the new colaborador
      if (currentUser && currentUser.cooperativaId) {
        body.cooperativaId = currentUser.cooperativaId;
      }

      return await repository.createUsuario(body);
    } catch (error) {
      console.error("Error creating colaborador:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Error creating colaborador",
      });
    }
  }

  // PUT - Update existing colaborador
  if (method === "PUT") {
    try {
      const body = await readBody(event);

      if (!body.id) {
        throw createError({
          statusCode: 400,
          statusMessage: "Missing ID for update",
        });
      }

      return await repository.updateUsuario(body);
    } catch (error) {
      console.error("Error updating colaborador:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Error updating colaborador",
      });
    }
  }

  // DELETE - Remove colaborador
  if (method === "DELETE") {
    try {
      const body = await readBody(event);
      const usuario = body.usuario as Usuario;

      if (!usuario || !usuario.id) {
        throw createError({
          statusCode: 400,
          statusMessage: "Missing colaborador data for deletion",
        });
      }

      return await repository.deleteUsuarioById(usuario.id);
    } catch (error) {
      console.error("Error deleting colaborador:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Error deleting colaborador",
      });
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: "Method not allowed",
  });
});