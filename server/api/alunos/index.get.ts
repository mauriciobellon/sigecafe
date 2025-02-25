import { defineEventHandler } from 'h3';
import { getServerSession } from '#auth';
import { UsuarioRepository } from '@@/server/repositories/UsuarioRepository';
import { AlunoRepository } from '~~/server/repositories/AlunoRepository';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);

  if (!session?.user) {
    return [];
  }

  if (!session.user.email) {
    return [];
  }

  const usuarioRepository = new UsuarioRepository();
  const user = await usuarioRepository.getUsuarioByEmail(session.user.email);

  if (!user) {
    return [];
  }

  const schoolId = user.escolaId;

  if (!schoolId) {
    return [];
  }

  try {
    const alunoRepository = new AlunoRepository()
    const allAlunos = await alunoRepository.getAlunosByEscola(schoolId)
    return allAlunos;
  } catch (error) {
    return {
      status: 500,
      body: error,
    }
  }
})
