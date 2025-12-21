import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Client data is attached by middleware
  const client = locals.clientUser;

  return {
    client
  };
};
