import querystring from 'query-string';
import HttpService from '../services/http.service';
import { getAddress } from '../utils';

export const getProfile = async (address) => {
    // const address = getAddress();
    return HttpService.get(
        `customer/profile?${querystring.stringify({ address })}`
    );
};

export const updateProfile = async (data) => {
    // const address = getAddress();
    return HttpService.put('customer/profile', data);
};
