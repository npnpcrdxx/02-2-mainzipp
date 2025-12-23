const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "locknick",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "SARDAR RDX",
  description: "Group ke tamam members ke nicknames lock karne ka command",
  commandCategory: "group",
  usages: "[on/off]",
  cooldowns: 5
};

const lockNickDataPath = path.join(__dirname, "cache", "locknick.json");
let lockNickData = fs.existsSync(lockNickDataPath) ? JSON.parse(fs.readFileSync(lockNickDataPath)) : {};

function saveLockData() {
  fs.writeFileSync(lockNickDataPath, JSON.stringify(lockNickData, null, 2));
}

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;

  if (!args[0]) return api.sendMessage("⚠️ Istemaal karein: locknick on/off", threadID);

  if (args[0].toLowerCase() === "on") {
    const threadInfo = await api.getThreadInfo(threadID);
    const nicknames = {};

    for (const userID in threadInfo.userInfo) {
      const user = threadInfo.userInfo.find(u => u.id == userID);
      if (user) nicknames[userID] = user.nickname || "";
    }

    lockNickData[threadID] = nicknames;
    saveLockData();

    return api.sendMessage(`🔒 Sabhi members ke nicknames lock kar diye gaye hain.`, threadID);
  }

  if (args[0].toLowerCase() === "off") {
    if (!lockNickData[threadID]) return api.sendMessage("⚠️ Nickname pehle se hi unlock hain!", threadID);

    delete lockNickData[threadID];
    saveLockData();
    return api.sendMessage("✅ Nickname lock hata diya gaya hai.", threadID);
  }

  return api.sendMessage("❌ Ghalat option! Istemaal karein: locknick on/off", threadID);
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, author, logMessageType, logMessageData } = event;

  if (!lockNickData[threadID]) return;

  // Nickname change hone ka check
  if (logMessageType === "log:thread-nickname") {
    const userID = logMessageData.participant_id;
    const lockedNick = lockNickData[threadID][userID] || "";

    if (logMessageData.nickname !== lockedNick) {
      await api.changeNickname(lockedNick, threadID, userID);
      api.sendMessage(`🔄 "${logMessageData.nickname || "Blank"}" nickname detect hua tha.\nPurana nickname wapas set kar diya gaya.`, threadID);
    }
  }
};
