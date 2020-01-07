import axios from 'axios';
const LOGGING_SERVER_API = 'http://localhost:8000';
export const logRequest = async (req: any) => {
  const requestStart = Date.now();
  const { rawHeaders, httpVersion, method, socket, url, query } = req;
  const { remoteAddress, remoteFamily } = socket;
  if (url.match(/\/api.*/)) {
    const requestBody = {
      rawHeaders: rawHeaders.filter((v: any) => !!v),
      httpVersion,
      method,
      remoteAddress,
      remoteFamily,
      url,
      query,
      processingTime: Date.now() - requestStart,
      timestamp: Date.now(),
    };
    axios.post(`${LOGGING_SERVER_API}/requests/create`, requestBody);
  }
};
