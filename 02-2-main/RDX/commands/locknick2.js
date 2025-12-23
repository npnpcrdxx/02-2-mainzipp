const fs = require("fs-extra");
const path = require("path");

const lockNickDataPath = path.join(__dirname, "cache", "locknick.json");
let lockNickData = {};

try {
  if (fs.existsSync(lockNickDataPath)) {
    lockNickData = JSON.parse(fs.readFileSync(lockNickDataPath));
  }
} catch {}

function saveLockData() {
  const cacheDir = path.dirname(lockNickDataPath);
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(lockNickDataPath, JSON.stringify(lockNickData, null, 2));
}

module.exports = {
  config: {
    name: 'locknick2',
    aliases: ['nicknamelock', 'nicklock'],
    description: 'Lock all member nicknames',
    credits: 'SARDAR RDX',
    usage: 'locknick2 [on/off]',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    prefix: true
  },

  handleEvent: async function({ api, event }) {
    const { threadID, logMessageType, logMessageData } = event;

    if (!lockNickData[threadID]) return;

    if (logMessageType === "log:thread-nickname") {
      const userID = logMessageData.participant_id;
      const lockedNick = lockNickData[threadID][userID] || "";

      if (logMessageData.nickname !== lockedNick) {
        await api.changeNickname(lockedNick, threadID, userID);
        api.sendMessage(`🔄 Nickname restored to original.`, threadID);
      }
    }
  },

  async run({ api, event, args, send }) {
    const threadID = event.threadID;

    if (!args[0]) return send.reply("Use: locknick2 on/off");

    if (args[0].toLowerCase() === "on") {
      const threadInfo = await api.getThreadInfo(threadID);
      const nicknames = {};

      for (const user of threadInfo.userInfo) {
        nicknames[user.id] = user.nickname || "";
      }

      lockNickData[threadID] = nicknames;
      saveLockData();

      return send.reply(`🔒 All member nicknames are now locked.`);
    }

    if (args[0].toLowerCase() === "off") {
      if (!lockNickData[threadID]) return send.reply("⚠️ Nicknames are already unlocked!");

      delete lockNickData[threadID];
      saveLockData();
      return send.reply("✅ Nickname lock removed.");
    }

    return send.reply("Use: locknick2 on/off");
  }
};
