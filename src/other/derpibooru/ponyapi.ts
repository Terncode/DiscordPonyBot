import { ResultRandom, ResultID, ResultTags, ResultTagName } from './ponyApiInterfaces';
import { format, UrlObject } from 'url';
import axios from 'axios';

export function ponyApiRandom(tags?: string[]): Promise<ResultRandom> {
    return new Promise((resolve, rejects) => {
        const query = tags ? tags.join(',') : '';
        axios.get(`${getUrl('pony/random', query)}`)
            .then(res => {
                if (res.data && res.data.pony) resolve(res.data.pony)
                else rejects(new Error(`got wrong data from api\n\n${JSON.stringify(res)}`));
            })
            .catch(err => {
                if (err.response && err.response.status) rejects(err.response.status);
                else rejects(err);

            });
    });
}

export function ponyApiID(id: string | number): Promise<ResultID> {
    return new Promise((resolve, rejects) => {
        if (id === undefined) return rejects(new Error('missing id'));
        axios.get(`${getUrl(`pony/id/${id}`, '')}`)
            .then(res => {
                if (res.data && res.data.pony) resolve(res.data.pony)
                else rejects(new Error(`got wrong data from api\n\n${JSON.stringify(res)}`));
            })
            .catch(err => {
                if (err.response && err.response.status) rejects(err.response.status);
                else rejects(err);

            });
    });
}

export function ponyApiTag(tag: string): Promise<ResultTagName> {
    return new Promise((resolve, rejects) => {
        tag = tag.replace(/ /g, '%20');
        axios.get(`${getUrl(`tag/${tag}`, '')}`)
            .then(res => {
                if (res.data) resolve(res.data)
                else rejects(new Error(`got wrong data from api\n\n${JSON.stringify(res)}`));
            })
            .catch(err => {
                if (err.response && err.response.status) rejects(err.response.status);
                else rejects(err);

            });
    });
}

export function ponyApiTags(): Promise<ResultTags> {
    return new Promise((resolve, rejects) => {
        axios.get('https://theponyapi.com/api/v1/tags')
            .then(res => {
                if (res.data && res.data.tags) resolve(res.data.tags)
                else rejects(new Error(`got wrong data from api\n\n${JSON.stringify(res)}`));
            })
            .catch(err => {
                if (err.response && err.response.status) rejects(err.response.status);
                else rejects(err);

            });
    });
}

function getUrl(endpoint = '', query?: string, ) {
    if (endpoint) endpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url: UrlObject = {
        protocol: 'https',
        hostname: 'www.theponyapi.com',
        pathname: `api/v1${endpoint}`,
    };
    if (query) url.query = {
        q: query,
    };
    return format(url);
}
