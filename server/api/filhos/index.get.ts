import { defineEventHandler } from 'h3';
import { getServerSession } from '#auth';
import { UserType, Aluno, User, Escola } from '@prisma/client';
import { AlunoRepository } from '../../repositories/AlunoRepository';
import { EscolaRepository } from '../../repositories/EscolaRepository';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);

  if (!session?.user) {
    return [];
  }
  const userType = (session.user as User)?.type;

  if (userType !== UserType.RESPONSAVEL) {
    return [];
  }

  const alunoRepository = new AlunoRepository();
  const escolaRepository = new EscolaRepository();

  const filhos = await alunoRepository.getAlunosByResponsavel((session.user as User).id);

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
