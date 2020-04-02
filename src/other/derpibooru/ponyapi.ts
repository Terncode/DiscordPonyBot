import { ResultRandom, ResultID, ResultTags, ResultTagName } from './ponyApiInterfaces';
import { format, UrlObject } from 'url';
import axios from 'axios';

export async function ponyApiRandom(tags?: string[]): Promise<ResultRandom> {
    const query = tags ? tags.join(',') : '';
    const response = await axios.get(`${getUrl('pony/random', query)}`);
    if (response.data && response.data.pony) return response.data.pony;
    else throw new Error(`Got wrong data from api\n\n${JSON.stringify(response)}`);
}

export async function ponyApiID(id: string | number): Promise<ResultID> {

    if (id === undefined) throw new Error('Missing id');
    const response = await axios.get(`${getUrl(`pony/id/${id}`, '')}`);

    if (response.data && response.data.pony) return response.data.pony;
    else throw new Error(`Got wrong data from api\n\n${JSON.stringify(response)}`);
}

export async function ponyApiTag(tag: string): Promise<ResultTagName> {
    tag = tag.replace(/ /g, '%20');
    const response = await axios.get(`${getUrl(`tag/${tag}`, '')}`);

    if (response.data) return response.data;
    else throw new Error(`got wrong data from api\n\n${JSON.stringify(response)}`);
}

export async function ponyApiTags(): Promise<ResultTags> {
    const response = await axios.get('https://theponyapi.com/api/v1/tags');
    if (response.data && response.data.tags) return response.data.tags;
    else throw new Error(`got wrong data from api\n\n${JSON.stringify(response)}`);
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
