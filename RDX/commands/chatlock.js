const lockedThreads = new Set();

module.exports = {
  config: {
    name: 'chatlock',
    aliases: ['lockthischat', 'lockchat'],
    description: 'Lock/unlock group chat',
    credits: 'SARDAR RDX',
    usage: 'chatlock [lock/unlock]',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    prefix: true
  },

  handleEvent: async function({ api, event }) {
    if (lockedThreads.has(event.threadID)) {
      if (event.senderID !== api.getCurrentUserID()) {
        try {
          await api.unsendMessage(event.messageID);
        } catch (err) {
          console.log("Delete error:", err);
        }
      }
    }
  },

  async run({ api, event, args, send }) {
    if (!args[0]) return send.reply("Use: chatlock lock/unlock");

    if (args[0].toLowerCase() === "lock") {
      lockedThreads.add(event.threadID);
      return send.reply("🔒 Group chat is now LOCKED! Only admin commands work.");
    }

    if (args[0].toLowerCase() === "unlock") {
      lockedThreads.delete(event.threadID);
      return send.reply("🔓 Group chat is now UNLOCKED! Everyone can chat.");
    }

    return send.reply("Use: chatlock lock/unlock");
  }
};
