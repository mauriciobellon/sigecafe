import { getServerSession } from "#auth";
import { UsuarioRepository } from '@@/server/repositories/UsuarioRepository';
import type { Usuario, UsuarioType } from "@prisma/client";
import prisma from '@@/lib/prisma';

const repository = new UsuarioRepository();

// Helper function to normalize phone number by removing non-digit characters
function normalizePhoneNumber(phone: string): string {
  return phone ? phone.replace(/\D/g, '') : '';
}

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  console.log("Session user:", session.user?.name);

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

      // Adjust the way we fetch colaboradores - now get actual colaboradores with their users
      const colaboradores = await prisma.usuario.findMany({
        where: {
          type: "COLABORADOR" as UsuarioType,
          cooperativaId: cooperativaId
        },
        include: {
          colaborador: true
        }
      });

      console.log("Fetched colaboradores:", colaboradores.length);

      return { data: colaboradores };
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

      // Normalize phone if present
      if (body.celular) {
        body.celular = normalizePhoneNumber(body.celular);
      }

      // Set the colaborador type and associate with the admin's cooperativa
      body.type = "COLABORADOR";

      // If the current user has a cooperativaId, assign the same to the new colaborador
      if (currentUser && currentUser.cooperativaId) {
        body.cooperativaId = currentUser.cooperativaId;
      } else {
        throw createError({
          statusCode: 400,
          statusMessage: "Current user doesn't have a cooperativa assigned",
        });
      }

      // Ensure password is provided
      if (!body.password) {
        body.password = 'password'; // Set a default password if none provided
        console.log("Setting default password for new colaborador");
      }

      // Extract colaborador-specific data (like cargo)
      const colaboradorData = body.colaborador || {};
      delete body.colaborador;

      // First create the Colaborador record
      const newColaborador = await prisma.colaborador.create({
        data: {
          cargo: colaboradorData.cargo || "Colaborador",
          cooperativaId: body.cooperativaId
        }
      });

      // Now create the Usuario with reference to the Colaborador
      body.colaboradorId = newColaborador.id;
      const newUser = await repository.createUsuario(body);

      // Force a reload after creation to get the complete object
      return await fetchColaboradorById(newUser.id);
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

      // Normalize phone if present
      if (body.celular) {
        body.celular = normalizePhoneNumber(body.celular);
      }

      // Handle the nested colaborador field
      if (body.colaborador) {
        // Get the colaborador ID for this user
        const usuario = await prisma.usuario.findUnique({
          where: { id: body.id },
          include: { colaborador: true }
        });

        if (usuario?.colaborador) {
          console.log("Updating colaborador cargo:", body.colaborador.cargo);
          // Update the colaborador record
          await prisma.colaborador.update({
            where: { id: usuario.colaborador.id },
            data: {
              cargo: body.colaborador.cargo || usuario.colaborador.cargo
            }
          });
        } else {
          console.log("User does not have a colaborador record");
        }

        // Remove the colaborador data from the update payload
        delete body.colaborador;
      }

      // Update the usuario
      const updatedUser = await repository.updateUsuario(body);

      // Force a reload of updated user with relationships
      return await fetchColaboradorById(updatedUser.id);
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

  // Helper function to fetch a colaborador by ID
  async function fetchColaboradorById(id: number) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: { colaborador: true }
    });

    return { data: [usuario] };
  }

  throw createError({
    statusCode: 405,
    statusMessage: "Method not allowed",
  });
});