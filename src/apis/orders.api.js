import querystring from 'query-string';

import HttpService from '../services/http.service';

export const getOrders = async (query) =>
    HttpService.get(`/customer/myorders?${querystring.stringify(query)}`);

export const getOrder = async (id) =>
    HttpService.get(`/customer/myorders/${id}`);

export const getOrderByEscrow = async (escrowId) =>
    HttpService.get(`/customer/checkByEscrowId/${escrowId}`);

export const getMyCompletedOrders = async (query) =>
    HttpService.get(`/customer/completedorders?${querystring.stringify(query)}`);
