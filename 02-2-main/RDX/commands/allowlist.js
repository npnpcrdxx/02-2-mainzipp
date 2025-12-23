const moment = require('moment-timezone');

module.exports = {
  config: {
    name: 'allowlist',
    aliases: ['allowedgroups', 'groupallowlist', 'allowed', 'statuslist'],
    description: 'Show allowed and approved groups status',
    credits: 'SARDAR RDX',
    usage: 'allowlist',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },
  
  async run({ api, event, send, Threads }) {
    const { threadID, messageID } = event;
    
    try {
      const allThreads = Threads.getAll();
      
      const allowed = allThreads.filter(t => t.approved === 1 && t.banned !== 1);
      const notAllowed = allThreads.filter(t => t.approved !== 1);
      const approved = allThreads.filter(t => t.receive_messages === 1 && t.banned !== 1);
      const banned = allThreads.filter(t => t.banned === 1);
      
      let message = `╭──────────────────────────────╮
│  📋 GROUPS STATUS LIST  
├──────────────────────────────┤\n`;
      
      message += `│ 🟢 BOT ALLOWED (Commands): ${allowed.length}\n`;
      if (allowed.length > 0) {
        allowed.slice(0, 4).forEach((thread, idx) => {
          message += `│  ${idx + 1}. ${thread.name || 'Unnamed'}\n`;
        });
        if (allowed.length > 4) {
          message += `│  ... +${allowed.length - 4} more\n`;
        }
      } else {
        message += `│  (No allowed groups)\n`;
      }
      
      message += `├──────────────────────────────┤\n`;
      message += `│ 🟡 NOT ALLOWED: ${notAllowed.length}\n`;
      if (notAllowed.length > 0) {
        notAllowed.slice(0, 3).forEach((thread, idx) => {
          message += `│  ${idx + 1}. ${thread.name || 'Unnamed'}\n`;
        });
        if (notAllowed.length > 3) {
          message += `│  ... +${notAllowed.length - 3} more\n`;
        }
      } else {
        message += `│  (No disallowed groups)\n`;
      }
      
      message += `├──────────────────────────────┤\n`;
      message += `│ 📖 APPROVED (Messages): ${approved.length}\n`;
      if (approved.length > 0) {
        approved.slice(0, 4).forEach((thread, idx) => {
          message += `│  ${idx + 1}. ${thread.name || 'Unnamed'}\n`;
        });
        if (approved.length > 4) {
          message += `│  ... +${approved.length - 4} more\n`;
        }
      } else {
        message += `│  (No approved groups)\n`;
      }
      
      if (banned.length > 0) {
        message += `├──────────────────────────────┤\n`;
        message += `│ 🚫 BANNED: ${banned.length}\n`;
        banned.slice(0, 2).forEach((thread, idx) => {
          message += `│  ${idx + 1}. ${thread.name || 'Unnamed'}\n`;
        });
        if (banned.length > 2) {
          message += `│  ... +${banned.length - 2} more\n`;
        }
      }
      
      message += `├──────────────────────────────┤\n`;
      message += `│ 📊 Total Groups: ${allThreads.length}\n`;
      message += `╰──────────────────────────────╯`;
      
      return send.reply(message);
      
    } catch (error) {
      return send.reply('Error getting status list: ' + error.message);
    }
  }
};
