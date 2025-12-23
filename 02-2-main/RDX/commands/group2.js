const fs = require('fs-extra');
const request = require('request');

module.exports = {
  config: {
    name: 'group2',
    aliases: ['gc2', 'groupsettings'],
    description: 'Group settings management',
    credits: 'SARDAR RDX',
    usage: 'group2 [name/emoji/admin/image/info]',
    category: 'Group',
    groupOnly: true,
    prefix: true
  },

  async run({ api, event, args, send }) {
    const { threadID, messageID, senderID } = event;
    
    if (args.length === 0) {
      return send.reply(`You can use:
/group2 emoji [icon]
/group2 name [the name to change]
/group2 image [reply to image]
/group2 admin [tag]
/group2 info`);
    }

    if (args[0] === "name") {
      const content = args.slice(1).join(" ");
      if (!content) return send.reply("Please provide a new name.");
      api.setTitle(content, threadID);
      return send.reply(`Group name changed to: ${content}`);
    }
    
    if (args[0] === "emoji") {
      const emoji = args[1] || (event.messageReply && event.messageReply.body);
      if (!emoji) return send.reply("Please provide an emoji.");
      api.changeThreadEmoji(emoji, threadID);
      return send.reply(`Group emoji changed to: ${emoji}`);
    }
    
    if (args[0] === "me" && args[1] === "admin") {
      const threadInfo = await api.getThreadInfo(threadID);
      const find = threadInfo.adminIDs.find(el => el.id === api.getCurrentUserID());
      if (!find) return send.reply("Bot needs to be admin to use this.");
      if (!global.config.ADMINBOT.includes(senderID)) return send.reply("Only bot admins can use this.");
      api.changeAdminStatus(threadID, senderID, true);
      return;
    }
    
    if (args[0] === "admin") {
      let targetID;
      if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      } else if (args[1]) {
        targetID = args[1];
      } else if (event.messageReply) {
        targetID = event.messageReply.senderID;
      }
      
      if (!targetID) return send.reply("Please mention or provide a user ID.");
      
      const threadInfo = await api.getThreadInfo(threadID);
      const isUserAdmin = threadInfo.adminIDs.find(el => el.id === senderID);
      const isBotAdmin = threadInfo.adminIDs.find(el => el.id === api.getCurrentUserID());
      
      if (!isUserAdmin) return send.reply("You are not a group admin.");
      if (!isBotAdmin) return send.reply("Bot needs to be admin.");
      
      const isTargetAdmin = threadInfo.adminIDs.find(el => el.id === targetID);
      api.changeAdminStatus(threadID, targetID, !isTargetAdmin);
      return send.reply(isTargetAdmin ? "Admin removed." : "Admin added.");
    }

    if (args[0] === "image") {
      if (event.type !== "message_reply") return send.reply("Reply to an image.");
      if (!event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return send.reply("Reply to an image.");
      }
      
      const cacheDir = __dirname + "/cache";
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      
      const callback = () => api.changeGroupImage(
        fs.createReadStream(__dirname + "/cache/groupimg.png"), 
        threadID, 
        () => fs.unlinkSync(__dirname + "/cache/groupimg.png")
      );
      
      return request(encodeURI(event.messageReply.attachments[0].url))
        .pipe(fs.createWriteStream(__dirname + '/cache/groupimg.png'))
        .on('close', () => callback());
    }
    
    if (args[0] === "info") {
      const threadInfo = await api.getThreadInfo(threadID);
      const threadMem = threadInfo.participantIDs.length;
      
      let maleCount = 0, femaleCount = 0;
      for (const user of threadInfo.userInfo) {
        if (user.gender === 'MALE') maleCount++;
        else if (user.gender === 'FEMALE') femaleCount++;
      }
      
      const adminCount = threadInfo.adminIDs.length;
      const msgCount = threadInfo.messageCount;
      const icon = threadInfo.emoji;
      const threadName = threadInfo.threadName;
      const id = threadInfo.threadID;
      
      let adminList = '';
      for (const admin of threadInfo.adminIDs) {
        try {
          const info = await api.getUserInfo(admin.id);
          const name = info[admin.id]?.name || 'Unknown';
          adminList += `• ${name}\n`;
        } catch {
          adminList += `• UID: ${admin.id}\n`;
        }
      }
      
      const approvalMode = threadInfo.approvalMode ? '✅ On' : '❎ Off';
      
      return send.reply(`GC Name: ${threadName}
GC ID: ${id}
Approval Mode: ${approvalMode}
Emoji: ${icon}

Members: ${threadMem}
Male: ${maleCount}
Female: ${femaleCount}

Admins (${adminCount}):
${adminList}
Total Messages: ${msgCount}`);
    }
    
    return send.reply("Invalid option. Use: name/emoji/admin/image/info");
  }
};
