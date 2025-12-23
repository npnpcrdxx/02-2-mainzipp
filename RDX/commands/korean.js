const axios = require('axios');

module.exports = {
  config: {
    name: 'korean',
    aliases: ['ko', 'tokorean'],
    description: 'Translate text to Korean',
    credits: 'SARDAR RDX',
    usage: 'korean [text] or reply to message',
    category: 'Utility',
    prefix: true
  },

  async run({ api, event, args, send }) {
    const { threadID, messageID, messageReply } = event;

    let textToTranslate = '';

    if (messageReply && messageReply.body) {
      textToTranslate = messageReply.body;
    } else {
      if (args.length === 0) {
        return send.reply('Please provide text to translate to Korean.\nUsage: korean [text]');
      }
      textToTranslate = args.join(' ');
    }

    try {
      api.setMessageReaction('⏳', messageID, () => {}, true);

      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ko&dt=t&q=${encodeURIComponent(textToTranslate)}`;
      
      const response = await axios.get(url);
      
      if (!response.data || !response.data[0]) {
        throw new Error('Translation failed');
      }

      let translatedText = '';
      response.data[0].forEach(item => {
        if (item[0]) translatedText += item[0];
      });

      api.setMessageReaction('✅', messageID, () => {}, true);
      return send.reply(`🌐 Korean:\n${translatedText}`);
    } catch (error) {
      api.setMessageReaction('❌', messageID, () => {}, true);
      return send.reply('Translation failed. Please try again.');
    }
  }
};
