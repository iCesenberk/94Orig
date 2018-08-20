const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
var app = require('./app');
const config = require('./config.js');
const token = config.telegramToken;
const bot = new TelegramBot(token, { polling: true });
const apiUrl = require('./config.js')[app.get('env')].url;

bot.onText(/https:\/\/*/, async (msg, match) => {
  const chatId = msg.chat.id;
  let target = match.input;
  target = target.split("\n");

  try{
    let resp = await callApi(target);
    if (resp == '') {
      resp[0] = '沒圖片啦 !!';
    }

    for (var i = 0; i < resp.length; i++) {
      bot.sendMessage(chatId, resp[i]);
    }
  } catch (error) {
    bot.sendMessage(chatId, `出錯了: ${error}}`);
  }
});

async function callApi(urls) {
  request('https://origin94origin.herokuapp.com', function (error, response, body) {
    console.log(`wake up !!`)
  });
  return new Promise(function (resolve, reject) {
    request.post(apiUrl, { form: { url: urls } }, function (error, response, body) {
      if (error) reject(error);
      let data = JSON.parse(body);
      data = data.url;
      resolve(data.split(","));
    });
  });
}
