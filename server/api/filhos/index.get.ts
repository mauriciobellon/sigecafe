import { defineEventHandler } from 'h3';
import { getServerSession } from '#auth';
import { UsuarioType, Aluno, Usuario, Escola } from '@prisma/client';
import { AlunoRepository } from '@@/repositories/AlunoRepository'
import { EscolaRepository } from '@@/repositories/EscolaRepository'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);

  if (!session?.user) {
    return [];
  }
  const usuarioType = (session.user as Usuario)?.type;

  if (usuarioType !== UsuarioType.RESPONSAVEL) {
    return [];
  }

  const alunoRepository = new AlunoRepository();
  const escolaRepository = new EscolaRepository();

  const filhos = await alunoRepository.getAlunosByResponsavel((session.user as Usuario).id);

  const filhosComEscola = await Promise.all(
    filhos.map(async (filho) => {
      const escola = await escolaRepository.getEscolaByAluno(filho.id);
      return {
        ...filho,
        escola: escola?.nome
      };
    })
  );

  return filhosComEscola;
});
