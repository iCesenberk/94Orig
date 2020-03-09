const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
var app = require('./app');
const token = require('./config.js')[app.get('env')].telegramToken;
const bot = new TelegramBot(token, { polling: true });
const apiUrl = require('./config.js')[app.get('env')].url;

bot.onText(/https:\/\//, async (msg, match) => {
  const chatId = msg.chat.id;
  let target = match.input;
  let isStory = false;
  if (target.search(/\/p\//) === -1 && target.search(/instagram/) !== -1) {
    isStory = true;
  }

  target = target.substring(target.indexOf(`https:`), target.length);
  target = target.split("\n");

  try{
    if (isStory === true) {
      bot.sendMessage(chatId, 'Tunggu 10 Detik');
    }
    if (target.length === 1) {
      bot.sendMessage(chatId, `Bagikan Tautan：https://twitig.herokuapp.com/?url=${target[0]}`);
    }
    let resp = await callApi(target, 'api/');
    if (resp == '') {
      resp[0] = 'Ga Ada !!';
    }

    for (var i = 0; i < resp.length; i++) {
      bot.sendMessage(chatId, resp[i]);
    }
  } catch (error) {
    bot.sendMessage(chatId, `Ada yang salah ini: ${error}}`);
  }
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Masukan Tautan Instagram Atau Twitter');
});

bot.onText(/\/apk/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    let resp = await getApk();

    if (resp == '') {
      resp[0] = 'Ga Ada !!';
    }

    let msg = '';
    for (const key in resp) {
      let element = resp[key];
      msg += `${key}：\nVersi：${element.version}\nTanggal Pembaruan：${element.date}\n載點：${element.downloadLink}\n`
    }

    bot.sendMessage(chatId, msg);
  } catch (error) {
    bot.sendMessage(chatId, `Ada yang salah ini: ${error}}`);
  }
});

async function callApi(urls, route) {
  return new Promise(function (resolve, reject) {
    try {
      request.post(`${apiUrl}${route}`, { form: { url: urls } }, function (error, response, body) {
        if (error) reject(error);
        if (response.statusCode !== 200) {
          reject(body);
        } else {
          let data = JSON.parse(body);
          data = data.url;
          resolve(data.split(","));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function getApk() {
  return new Promise(function (resolve, reject) {
    try {
      request.get(`${apiUrl}api/apk`, function (error, response, body) {
        if (error) reject(error);
        if (response.statusCode !== 200) {
          reject(body);
        } else {
          let data = JSON.parse(body);
          resolve(data.result);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}
