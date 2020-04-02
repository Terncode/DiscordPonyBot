import axios from 'axios';
import { format, UrlObject } from 'url';
const { JSDOM } = require('jsdom');

export interface CambridgeDictionaryResult {
    source: string;
    results: CambridgeDictionaryEntry[];
}

interface CambridgeDictionaryEntry {
    word: string | null;
    guideWord: string | null;
    labelsCodes: string | null;
    pronunciationUK: string | null;
    pronunciationUS: string | null;
    descriptions: CambridgeDictionaryDescription[] | null;
}

interface CambridgeDictionaryDescription {
    description: string;
    examples: string[];
}

export async function cambridgeDictionary(word: string): Promise<CambridgeDictionaryResult> {
    const data = await getData(word);
    const jsdom = new JSDOM(data);
    const document = jsdom.window.document as Document;

    const entries = document.getElementsByClassName('entry-body__el');

    const results: CambridgeDictionaryResult = {
        source: getUrl(word),
        results: [],
    };

    if (entries) {
        for (let i = 0; entries.length > i; i++) {
            const entry = entries[i];
            const resultEntry: CambridgeDictionaryEntry = {
                labelsCodes: null,
                guideWord: null,
                pronunciationUK: null,
                pronunciationUS: null,
                word: null,
                descriptions: null,
            };

            //unobfuscate 
            const definingWord = entry.getElementsByClassName('hw');
            const guildWord = entry.getElementsByClassName('dsense_h');
            const labelsCodes = entry.getElementsByClassName('posgram dpos-g hdib lmr-5');
            const pronunciationUK = entry.getElementsByClassName('uk dpron-i');
            const pronunciationUS = entry.getElementsByClassName('us dpron-i');
            const descriptions = entry.getElementsByClassName('def-block ddef_block');

            if (definingWord) resultEntry.word = definingWord[0].textContent;
            if (guildWord && guildWord[0] && guildWord[0].textContent) resultEntry.guideWord = guildWord[0].textContent.replace(/\n|\t/g, '').replace(/ +(?= )/g, '').trim();
            if (labelsCodes && labelsCodes[0] && labelsCodes[0].textContent) resultEntry.labelsCodes = labelsCodes[0].textContent.replace(/\[.*\]/g, '').replace(/ ,/g, ',');
            if (pronunciationUK && pronunciationUK[0]) resultEntry.pronunciationUK = extractPronoun(pronunciationUK[0].textContent);
            if (pronunciationUS && pronunciationUS[0]) resultEntry.pronunciationUS = extractPronoun(pronunciationUS[0].textContent);

            if (descriptions) {
                resultEntry.descriptions = [];
                for (let j = 0; descriptions.length > j; j++) {
                    const description = descriptions[j];
                    const cdDescription: CambridgeDictionaryDescription = {
                        description: '',
                        examples: [],
                    };

                    const desc = description.getElementsByClassName('def ddef_d db');
                    if (desc && desc[0] && desc[0].textContent) {
                        if (desc[0].textContent.slice(-2).includes(': ')) cdDescription.description = desc[0].textContent.slice(0, -2).replace(/\n|\t/g, '').replace(/ +(?= )/g, '').trim();
                        else if (desc[0].textContent.slice(-1).includes(':')) cdDescription.description = desc[0].textContent.slice(0, -1).replace(/\n|\t/g, '').replace(/ +(?= )/g, '').trim();
                        else cdDescription.description = desc[0].textContent.replace(/\n|\t/g, '').replace(/ +(?= )/g, '').trim();

                        const examples = description.getElementsByClassName('eg deg');
                        if (examples) {
                            for (let k = 0; examples.length > k; k++) {
                                const example = examples[k];
                                if (example.textContent)
                                    cdDescription.examples.push(example.textContent.replace(/\n|\t/g, '').replace(/ +(?= )/g, '').trim());
                            }
                        }
                    }
                    resultEntry.descriptions.push(cdDescription);
                }
            }
            results.results.push(resultEntry);
        }
    }
    if (results.results.length === 0) throw new Error('Nothing found');
    else return results;
}

function extractPronoun(text: string | null) {
    if (!text) return null;
    const match = text.match(/\/.*\//g);
    if (!match) return null;
    return match.join();
}

async function getData(query: string) {
    const result = await axios.get(getUrl(query))
    return result.data;
}

function getUrl(endpoint = '', query?: string) {
    if (endpoint) {
        endpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        endpoint = endpoint.replace(/ /g, '-');
    };
    const url: UrlObject = {
        protocol: 'https',
        hostname: 'dictionary.cambridge.org',
        pathname: `dictionary/english${endpoint}`,
    };
    if (query) url.query = {
        q: query,
    };
    return format(url);
}
