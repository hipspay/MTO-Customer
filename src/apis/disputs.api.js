import querystring from 'query-string';

import HttpService from '../services/http.service';

export const getDisputes = async (query) =>
    HttpService.get(`customer/disputes?${querystring.stringify(query)}`);

export const getDispute = async (id) =>
    HttpService.get(`customer/disputes/${id}`);

export const getDisputeByEscrow = async (id) =>
    HttpService.get(`/admin/disputesById/${id}`);

export const updateDisputeByEscrow = async (id, data) =>
    HttpService.put(`customer/disputes/${id}`, data);
