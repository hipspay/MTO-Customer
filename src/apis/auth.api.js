import HttpService from '../services/http.service';

// eslint-disable-next-line import/prefer-default-export
export const auth = async (signature) =>
    HttpService.post(`/auth/customer`, undefined, { signature });
