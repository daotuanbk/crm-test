export const clearCookie = async (_req: any, res: any) => {
  res.clearCookie('token').redirect('/');
};
