import { defineEventHandler } from 'h3';
import { getServerSession } from '#auth';
import { UserRepository } from '@@/repositories/UserRepository';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);

  if (!session?.user) {
    return [];
  }

  const userRepository = new UserRepository();

  if (session.user.email) {
    await userRepository.deleteUserByEmail(session.user.email);
  }
});
