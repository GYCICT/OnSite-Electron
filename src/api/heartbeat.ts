// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios, { AxiosError } from 'axios';

export default async function heartBeat() {
  const data = {
    session_id: localStorage.getItem('sessionID'),
    sitename: localStorage.getItem('siteName'),
    version: localStorage.getItem('version'),
    user_agent: navigator.userAgent,
  };
  try {
    const response = await axios.post(
      'https://onsite.gyc.tas.edu.au/api/2.0/heartbeat.php',
      data,
      {
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json',
          session_id: localStorage.getItem('sessionID'),
        },
      },
    );
    return response;
  } catch (error: AxiosError | any) {
    return error;
  }
}
