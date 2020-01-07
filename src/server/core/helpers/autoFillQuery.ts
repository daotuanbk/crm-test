export function autoFillQuery(query: any) {
  return {
    ...query,
    limit: Number(query.limit || 100),
    page: Number(query.page || 1),
  };
}
