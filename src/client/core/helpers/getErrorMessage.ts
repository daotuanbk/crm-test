export const getErrorMessage = (error: any) => {
  try {
    if (error.response) {
      return JSON.parse(error.response).message;
    }
    return error.message;
  } catch (err) {
    return error.toString();
  }
};
