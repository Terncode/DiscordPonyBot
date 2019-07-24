"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const guildPrefix_1 = require("./guildPrefix");
const DataBase_1 = require("./DataBase");
const sendMessage_1 = require("./sendMessage");
const tran = require("@k3rn31p4nic/google-translate-api");
const translateName = "Google translate";
const url = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Translate_logo.svg/1200px-Google_Translate_logo.svg.png";
const langs = ['af', 'sq', 'am', 'ar', 'hy', 'az', 'eu', 'be', 'bn', 'bs', 'bg', 'ca', 'ceb', 'ny', 'zh-cn', 'zh-tw', 'co', 'hr', 'cs', 'da', 'nl', 'en', 'eo', 'et', 'tl', 'fi', 'fr', 'fy', 'gl', 'ka', 'de', 'el', 'gu', 'ht', 'ha', 'haw', 'iw', 'hi', 'hmn', 'hu', 'is', 'ig', 'id', 'ga', 'it', 'ja', 'jw', 'kn', 'kk', 'km', 'ko', 'ku', 'ky', 'lo', 'la', 'lv', 'lt', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'mi', 'mr', 'mn', 'my', 'ne', 'no', 'ps', 'fa', 'pl', 'pt', 'pa', 'ro', 'ru', 'sm', 'gd', 'sr', 'st', 'sn', 'sd', 'si', 'sk', 'sl', 'so', 'es', 'su', 'sw', 'sv', 'tg', 'ta', 'te', 'th', 'tr', 'uk', 'ur', 'uz', 'vi', 'cy', 'xh', 'yi', 'yo', 'zu',];
const langFullName = ['Afrikaans', 'Albanian', 'Amharic', 'Arabic', 'Armenian', 'Azerbaijani', 'Basque', 'Belarusian', 'Bengali', 'Bosnian', 'Bulgarian', 'Catalan', 'Cebuano', 'Chichewa', 'Chinese Simplified', 'Chinese Traditional', 'Corsican', 'Croatian', 'Czech', 'Danish', 'Dutch', 'English', 'Esperanto', 'Estonian', 'Filipino', 'Finnish', 'French', 'Frisian', 'Galician', 'Georgian', 'German', 'Greek', 'Gujarati', 'Haitian Creole', 'Hausa', 'Hawaiian', 'Hebrew', 'Hindi', 'Hmong', 'Hungarian', 'Icelandic', 'Igbo', 'Indonesian', 'Irish', 'Italian', 'Japanese', 'Javanese', 'Kannada', 'Kazakh', 'Khmer', 'Korean', 'Kurdish (Kurmanji)', 'Kyrgyz', 'Lao', 'Latin', 'Latvian', 'Lithuanian', 'Luxembourgish', 'Macedonian', 'Malagasy', 'Malay', 'Malayalam', 'Maltese', 'Maori', 'Marathi', 'Mongolian', 'Myanmar (Burmese)', 'Nepali', 'Norwegian', 'Pashto', 'Persian', 'Polish', 'Portuguese', 'Punjabi', 'Romanian', 'Russian', 'Samoan', 'Scots Gaelic', 'Serbian', 'Sesotho', 'Shona', 'Sindhi', 'Sinhala', 'Slovak', 'Slovenian', 'Somali', 'Spanish', 'Sundanese', 'Swahili', 'Swedish', 'Tajik', 'Tamil', 'Telugu', 'Thai', 'Turkish', 'Ukrainian', 'Urdu', 'Uzbek', 'Vietnamese', 'Welsh', 'Xhosa', 'Yiddish', 'Yoruba', 'Zulu'];
function translate(message) {
    const p = guildPrefix_1.prefix(message).toLowerCase();
    if (!p)
        return false;
    if (!p.startsWith('tr') && !p.startsWith('translate'))
        return false;
    let language = message.guild ? DataBase_1.DataBase.getLang()[DataBase_1.DataBase.getGuildLang(message.guild)].translate : DataBase_1.DataBase.getLang()['en'].translate;
    const embed = new discord_js_1.RichEmbed();
    embed.setAuthor(translateName, url);
    embed.setColor([62, 130, 247]);
    if (p === 'translate' || p === 'tr') {
        let prefix = DataBase_1.DataBase.getPrefix(message.guild);
        embed.addField(language.help, prefix + language.command);
        sendMessage_1.embedSend(message.channel, embed);
        return true;
    }
    ;
    let msg = p.replace(/  +/g, ' ');
    let args = msg.split(' ');
    msg = msg.slice(args[0].length + args[1].length + 1, msg.length).trim();
    if (!msg) {
        embed.addField(language.error, language.msgNotFound);
        sendMessage_1.embedSend(message.channel, embed);
        return true;
    }
    let tr = {
        message: message,
        lang: args[1].toLowerCase(),
        trmsg: msg,
        language: language,
        embed: embed,
    };
    const lang = args[1].toLowerCase();
    translateMessage(tr);
    return true;
}
exports.translate = translate;
async function translateMessage(tro) {
    tro.message.channel.startTyping();
    if (langFullName.includes(capitalize(tro.lang)))
        tro.lang = fullNameToShortOne(tro.lang);
    if (!langs.includes(tro.lang)) {
        await returnTranslation(tro.lang, 'en', true).then((x) => {
            tro.lang = x.toLowerCase();
        }).catch(() => { });
        if (langFullName.includes(capitalize(tro.lang)))
            tro.lang = fullNameToShortOne(tro.lang);
    }
    if (langs.includes(tro.lang))
        return sendMsg(tro);
    else
        return errorMsg(tro);
}
async function sendMsg(tro) {
    tro.message.channel.stopTyping();
    console.log(tro.trmsg, tro.lang);
    await returnTranslation(tro.trmsg, tro.lang).then((x) => {
        tro.embed.addField(`${tro.language.translatedTo} ${x.titleText}`, x.translation);
        sendMessage_1.embedSend(tro.message.channel, tro.embed);
    }).catch(err => {
        console.log('test');
        tro.embed.addField(tro.language.error, err.message);
        tro.embed.setColor("RED");
        sendMessage_1.embedSend(tro.message.channel, tro.embed);
    });
}
function errorMsg(tro) {
    tro.message.channel.stopTyping();
    tro.embed.setColor("RED");
    tro.embed.addField(tro.language.langError, tro.language.languageError);
    sendMessage_1.embedSend(tro.message.channel, tro.embed);
    return true;
}
function fullNameToShortOne(langName) {
    for (let l in langFullName) {
        if (langFullName[l].toLowerCase() === langName.toLowerCase()) {
            return langs[l];
        }
    }
    return langName;
}
function returnTranslation(text, langName, langTranslate = false) {
    return new Promise((resolve, reject) => {
        for (let l in langs) {
            if (langs[l] === langName) {
                tran(text, { to: langName })
                    .then(res => {
                    if (langTranslate) {
                        resolve(res.text.toString());
                    }
                    else {
                        resolve({
                            titleText: `${langFullName[l]}`,
                            translation: res.text.toString()
                        });
                    }
                }).catch(err => {
                    reject(err);
                });
            }
        }
    });
}
function capitalize(s) {
    if (typeof s !== 'string')
        return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}
//# sourceMappingURL=translate.js.map