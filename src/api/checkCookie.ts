// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios, { AxiosError } from 'axios';
import { LoadStudents } from './functions';
import heartBeat from './heartbeat';

export async function validateCookie() {
  try {
    const sessionID = localStorage.getItem('sessionID');

    if (!sessionID) {
      return true;
    }

    const response = await axios.post('https://onsite.gyc.tas.edu.au/i.php', {
      session_id: sessionID,
    });

    if (response.data === 'undefined') {
      localStorage.removeItem('sessionID');
      return true;
    }
    localStorage.setItem('sessionID', sessionID);
    return false;
  } catch (error: AxiosError | any) {
    localStorage.removeItem('sessionID');
    return true;
  }
}

export async function auth(key: string) {
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 2);

  try {
    const response = await axios.get(
      'https://onsite.gyc.tas.edu.au/api/2.0/auth.php',
      {
        headers: { 'API-Key': key },
      },
    );

    if (response.data.SessionID) {
      localStorage.setItem('sessionID', response.data.SessionID);
      heartBeat();
      LoadStudents(response.data.SessionID);
      return false;
    }

    return true;
  } catch (error: AxiosError | any) {
    return true;
  }
}
