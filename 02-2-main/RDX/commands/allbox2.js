module.exports = {
  config: {
    name: 'allbox2',
    aliases: ['allgroups', 'grouplist'],
    description: 'List all groups bot has joined',
    credits: 'SARDAR RDX',
    usage: 'allbox2 [all/page]',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },

  async run({ api, event, args, send, client }) {
    const { threadID, messageID, senderID } = event;
    
    try {
      let threadList = [];
      let data;
      
      try {
        data = await api.getThreadList(100, null, ["INBOX"]);
      } catch (e) {
        console.log(e);
        return send.reply("Failed to get thread list.");
      }
      
      for (const thread of data) {
        if (thread.isGroup === true) {
          threadList.push({
            threadName: thread.name || "Unnamed Group",
            threadID: thread.threadID,
            messageCount: thread.messageCount || 0
          });
        }
      }
      
      threadList.sort((a, b) => b.messageCount - a.messageCount);
      
      const page = parseInt(args[0]) || 1;
      const limit = args[0] === "all" ? 100 : 10;
      const numPage = Math.ceil(threadList.length / limit);
      
      let msg = `🎭 GROUP LIST 🎭\n\n`;
      
      const startIdx = args[0] === "all" ? 0 : (page - 1) * limit;
      const endIdx = args[0] === "all" ? threadList.length : startIdx + limit;
      
      for (let i = startIdx; i < endIdx && i < threadList.length; i++) {
        const group = threadList[i];
        msg += `${i + 1}. ${group.threadName}\n🔰 TID: ${group.threadID}\n💌 Messages: ${group.messageCount}\n\n`;
      }
      
      if (args[0] !== "all") {
        msg += `──────────────────\nPage ${page}/${numPage}\nTotal: ${threadList.length} groups`;
      } else {
        msg += `──────────────────\nTotal: ${threadList.length} groups`;
      }
      
      return send.reply(msg);
    } catch (error) {
      console.error("AllBox2 Error:", error);
      return send.reply("Failed to get group list.");
    }
  }
};
