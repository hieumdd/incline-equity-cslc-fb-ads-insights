import { Readable } from 'node:stream';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import qs from 'query-string';

import { logger } from '../logging.service';
import { API_VERSION } from './facebook.const';

export const getClient = async () => {
    const token = await axios
        .request<{ value: { raw: string } }>({
            method: 'GET',
            url: 'https://api.doppler.com/v3/configs/config/secret',
            params: { project: 'eaglytics', config: 'prd', name: 'FACEBOOK_ACCESS_TOKEN' },
            auth: { username: process.env.DOPPLER_TOKEN || '', password: '' },
        })
        .then(({ data }) => data.value.raw);

    const client = axios.create({
        baseURL: `https://graph.facebook.com/${API_VERSION}`,
        params: { access_token: token },
        paramsSerializer: { serialize: (value) => qs.stringify(value, { arrayFormat: 'comma' }) },
    });

    client.interceptors.response.use(
        (response) => response,
        (error) => {
            if (axios.isAxiosError(error)) {
                logger.error({
                    error: {
                        config: error.config,
                        response: { data: error.response?.data, headers: error.response?.headers },
                    },
                });
            } else {
                logger.error({ error });
            }

            throw error;
        },
    );

    return client;
};

export type GetResponse = {
    data: Record<string, any>[];
    paging?: { cursors: { after: string }; next: string };
};

export const getExtractStream = async (
    client: AxiosInstance,
    config: (after?: string) => AxiosRequestConfig,
) => {
    const stream = new Readable({ objectMode: true, read: () => {} });

    const _get = (after?: string) => {
        client
            .request<GetResponse>(config(after))
            .then((response) => response.data)
            .then(({ data, paging }) => {
                data.forEach((row) => stream.push(row));
                paging?.next ? _get(paging.cursors.after) : stream.push(null);
            })
            .catch((error) => stream.emit('error', error));
    };

    _get();

    return stream;
};
