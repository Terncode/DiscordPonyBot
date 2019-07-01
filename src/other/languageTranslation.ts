import * as transalte from '@k3rn31p4nic/google-translate-api';
import { languages } from '@k3rn31p4nic/google-translate-api';
const template = JSON.stringify(require('./../../languages/template.json'));

languages["zh-cn"]
export function languageTranslation(lang: string) {
    return new Promise(async (resolve, reject) => {

        if (!isSupported(lang)) return false;


        const iso = getISOCode(lang);
        let language = JSON.parse(template);

        await translateObject(language, iso).catch(() => {
            reject('translation failed!')
        })


        setTimeout(() => {

            language.language.name = languages[iso];
            language.language.name = iso;

            resolve(language)
        }, 1000 * 10);
    })
}

export function isSupported(language) {
    return Boolean(getISOCode(language));
}


export function getISOCode(language) {
    if (!language) return false;
    language = language.toLowerCase();
    if (language in languages) return language;

    let keys = Object.keys(languages).filter((key) => {
        if (typeof languages[key] !== 'string') return false;

        return languages[key].toLowerCase() === language;
    });

    return keys[0] || null;
}


async function translateObject(object: any, language: any) {
    const keys = Object.keys(object)

    for (const key of keys) {

        if (typeof object[key] === 'string') {
            // @ts-ignore
            transalte(object[key], { to: language })
                .then(res => {
                    object[key] = res.text;
                }).catch(err => {
                    throw err;
                });

            object[key] = await translate(object[key], language).catch((err) => { throw err });



        }
        else translateObject(object[key], language).catch(err => { throw err });
    }
}

function translate(text, language) {
    return new Promise((resolve, rejects) => {
        console.info(`Translating |${text}| to ${languages[language]}`)

        //@ts-ignore
        transalte(text, { to: language })
            .then(res => {
                resolve(res.text);
            }).catch(err => {
                rejects(err);

            });
    });
}