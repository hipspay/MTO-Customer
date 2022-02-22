import querystring from 'query-string';

import HttpService from '../services/http.service';

export const getProducts = async (query) =>
    HttpService.get(`/customer/products?${querystring.stringify(query)}`);

export const getMyProducts = async (query) =>
    HttpService.get(`/customer/myproducts?${querystring.stringify(query)}`);

export const getProduct = async (id) =>
    HttpService.get(`/customer/products/${id}`);
