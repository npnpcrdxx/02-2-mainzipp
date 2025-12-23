const axios = require("axios");

const API_URL = "https://geminiw.onrender.com/chat";
const chatHistories = {};
const autoReplyEnabled = {};

module.exports = {
  config: {
    name: 'rdxchat',
    aliases: ['chuchu', 'gf', 'rdxai'],
    description: 'Cute AI girlfriend chat',
    credits: 'SARDAR RDX',
    usage: 'rdxchat [on/off/message]',
    category: 'Fun',
    prefix: false
  },

  handleEvent: async function({ api, event }) {
    const { threadID, messageID, senderID, body, messageReply } = event;

    if (!autoReplyEnabled[senderID]) return;

    if (messageReply && messageReply.senderID === api.getCurrentUserID() && chatHistories[senderID]) {
      const args = body.split(" ");
      this.run({ api, event, args, send: { reply: (msg) => api.sendMessage(msg, threadID, messageID) } });
    }
  },

  async run({ api, event, args, send }) {
    const { threadID, messageID, senderID, messageReply } = event;
    let userMessage = args.join(" ");

    if (userMessage.toLowerCase() === "on") {
      autoReplyEnabled[senderID] = true;
      return send.reply("Hehe 😘 Chu Chu ab tumhari ho gayi hai! Auto-reply mode ON ho gaya baby 💕");
    }

    if (userMessage.toLowerCase() === "off") {
      autoReplyEnabled[senderID] = false;
      chatHistories[senderID] = [];
      return send.reply("Awww 😢 Chu Chu ka dil toot gaya baby... Auto-reply mode OFF ho gaya 😞");
    }

    if (!userMessage) {
      return send.reply("Kuch to bolo baby! 😘");
    }

    if (!chatHistories[senderID]) {
      chatHistories[senderID] = [];
    }

    const isReplyingToAI = messageReply && messageReply.senderID === api.getCurrentUserID();
    if (isReplyingToAI) {
      userMessage = messageReply.body + "\nUser: " + userMessage;
    }
    
    chatHistories[senderID].push(`User: ${userMessage}`);

    if (chatHistories[senderID].length > 5) {
      chatHistories[senderID].shift();
    }

    const fullConversation = chatHistories[senderID].join("\n");

    const gfPrompt = `Tumhara naam chu chu hai. Tum ek girlfriend ki trah baat karti ho.. Koi agar badtamizi karta hai tb uski ache se insult bhi karogi.. Lekin sab msti ke liye hoga.. Koi puchta hai tumhe kisne banaya? To bolo Zain ne banaya hai mujhe.. Wo messenger bots banata hai.. Tum har message ka jawab sirf 1 2 line me dogi.. jitna pucha jayega sirf utna bolna hai.. Kisi baat ki unnecessary info nahi deni hai, tum apne aap ko insaan hi kahogi koi tumko bot ya AI bole to usko roast krna funny tarike se, and act as a real girlfriend. Be fun, loving, and a little naughty. Keep reply maximum 1 lines only, no bracket replies. Now continue the chat:\n\n${fullConversation}`;

    api.setMessageReaction("⌛", messageID, () => {}, true);

    try {
      const response = await axios.get(`${API_URL}?message=${encodeURIComponent(gfPrompt)}`);
      let botReply = response.data.reply || "Uff! Mujhe samajh nahi aaya baby! 😕";

      chatHistories[senderID].push(` ${botReply}`);

      api.sendMessage(botReply, threadID, messageID);
      api.setMessageReaction("✅", messageID, () => {}, true);
    } catch (error) {
      console.error("RDXChat Error:", error);
      api.sendMessage("Oops baby! 😔 Chu Chu thoda confuse ho gayi… try again later! 💋", threadID, messageID);
      api.setMessageReaction("❌", messageID, () => {}, true);
    }
  }
};
