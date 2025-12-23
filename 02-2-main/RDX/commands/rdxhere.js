module.exports = {
  config: {
    name: 'rdxhere',
    aliases: ['highjack', 'rdxhack'],
    description: 'RDX Highjack - Add users and rename group',
    credits: 'SARDAR RDX',
    usage: 'rdxhere',
    category: 'Admin',
    groupOnly: true,
    prefix: true
  },

  async run({ api, event, send, config }) {
    const { threadID, senderID } = event;

    if (!config.ADMINBOT.includes(senderID)) {
      return send.reply('❌ Only bot admins can use this command!');
    }

    const messages = [
      "𝐍𝐨𝐰 𝐥𝐨𝐚𝐝𝐢𝐧𝐠...",
      "⋘ 𝑙𝑜𝑎𝑑𝑖𝑛𝑔 𝑑𝑎𝑡𝑎...⋙",
      "[■■■■■■■■■■] 100%",
      "𝗔𝗝𝗨𝗢 𝗗𝗢𝗦𝗧𝗢 𝗬𝗔 𝗚𝗥𝗢𝗨𝗣 𝗕𝗛𝗜 𝗛𝗜𝗚𝗛𝗝𝗔𝗖𝗞 𝗛𝗢 𝗚𝗬𝗔"
    ];

    const usersToAdd = [
      "61582862311675",
      "61582915079134",
      "61582448566237",
      "61583038793097",
      "61582740037285",
      "61583077011427",
      "61582528696444",
      "61582664773755",
      "61582596827519",
      "61578127172132",
      "61582857304912",
      "61583082354079"
    ];

    const newGroupName = "🩷𓆩𝐊𝐎𝐈 𝐏𝐎𝐂𝐇𝐘 𝐓𝐎 𝐊𝐇𝐍𝐀 𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐀𝐘𝐀 𝐓𝐇𝐀 🖤𓆪𓆤";

    try {
      await api.sendMessage("🚀𝑹𝑫𝑿 𝑯𝑰𝑮𝑯𝑱𝑨𝑪𝑲 𝑮𝑪 𝑳𝑶𝑨𝑫𝑰𝑵𝑮 ........", threadID);

      for (const msg of messages) {
        await new Promise(r => setTimeout(r, 2000));
        await api.sendMessage(msg, threadID);
      }

      let added = 0;
      let failed = 0;
      let errors = [];

      for (let i = 0; i < usersToAdd.length; i++) {
        await new Promise(r => setTimeout(r, 1500));
        
        try {
          await new Promise((resolve, reject) => {
            api.addUserToGroup(usersToAdd[i], threadID, (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
          added++;
          await api.sendMessage(`✅ Added ${i + 1}/${usersToAdd.length}`, threadID);
        } catch (err) {
          failed++;
          const errText = JSON.stringify(err) || err?.error || err?.message || 'Unknown';
          await api.sendMessage(`❌ Failed ${i + 1}: ${errText}`, threadID);
        }
      }

      let renamed = false;
      try {
        await new Promise((resolve, reject) => {
          api.setTitle(newGroupName, threadID, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        renamed = true;
        await api.sendMessage(`✅ Group renamed!`, threadID);
      } catch (err) {
        await api.sendMessage(`⚠️ Could not rename group`, threadID);
      }

      let result = `✅ 𝐑𝐃𝐗 𝐇𝐈𝐆𝐇𝐉𝐀𝐂𝐊 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄!\n\n`;
      result += `📊 𝐑𝐞𝐬𝐮𝐥𝐭𝐬:\n`;
      result += `✅ Added: ${added}\n`;
      result += `❌ Failed: ${failed}\n`;
      result += `🔁 Rename: ${renamed ? 'Success' : 'Failed'}`;
      
      if (errors.length > 0 && errors.length <= 3) {
        result += `\n\n❌ Errors:\n${errors.join('\n')}`;
      }

      await api.sendMessage(result, threadID);

    } catch (error) {
      return send.reply(`❌ Error: ${error.message}`);
    }
  }
};
