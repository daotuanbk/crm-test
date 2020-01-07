import axios from 'axios';
const LOGGING_SERVER_API = 'http://localhost:8000';
export const logResponse = async (req: any, res: any) => {
  const requestStart = Date.now();
  const { rawHeaders, httpVersion, method, socket, url, query, body } = req;
  const { remoteAddress, remoteFamily } = socket;
  const { statusCode, statusMessage } = res;
    const headers = res.getHeaders();
  if (url.match(/\/api.*/)) {
    const requestBody = {
      rawHeaders: rawHeaders.filter((v: any) => !!v),
      httpVersion,
      method,
      remoteAddress,
      remoteFamily,
      url,
      query,
      body,
      processingTime: Date.now() - requestStart,
      timestamp: Date.now(),
      response: {
        statusCode,
        statusMessage,
        headers,
      },
    };
    axios.post(`${LOGGING_SERVER_API}/responses/create`, requestBody);
  }
};
