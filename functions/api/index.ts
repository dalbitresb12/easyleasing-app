interface Environment {
  users: KVNamespace;
  preferences: KVNamespace;
  loan_data: KVNamespace;
}

export const onRequest: PagesFunction<Environment> = async () => {
  return await Promise.resolve(Response.json({ success: true }));
};
