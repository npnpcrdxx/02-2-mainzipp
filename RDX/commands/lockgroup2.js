const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

const lockData = {};

module.exports = {
  config: {
    name: 'lockgroup2',
    aliases: ['grouplock2', 'lgc'],
    description: 'Lock group name and photo',
    credits: 'SARDAR RDX',
    usage: 'lockgroup2 [on/off]',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    prefix: true
  },

  handleEvent: async function({ api, event }) {
    const threadID = event.threadID;
    if (!lockData[threadID]) return;

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const currentName = threadInfo.threadName;
      const currentImage = threadInfo.imageSrc;

      const { name: lockedName, image: lockedImagePath } = lockData[threadID];

      if (currentName !== lockedName) {
        await api.setTitle(lockedName, threadID);
        api.sendMessage(`⚠️ Group name restored to: "${lockedName}"`, threadID);
      }

      if (lockedImagePath && currentImage) {
        try {
          const currentImgRes = await axios.get(currentImage, { responseType: "arraybuffer" });
          const currentBuffer = Buffer.from(currentImgRes.data, "binary");
          const lockedBuffer = fs.readFileSync(lockedImagePath);

          if (!currentBuffer.equals(lockedBuffer)) {
            await api.changeGroupImage(fs.createReadStream(lockedImagePath), threadID);
            api.sendMessage(`🖼️ Group photo restored.`, threadID);
          }
        } catch (err) {
          console.log("Image comparison error:", err.message);
        }
      }
    } catch (err) {
      console.log("Lockgroup event error:", err.message);
    }
  },

  async run({ api, event, args, send }) {
    const threadID = event.threadID;

    if (!args[0]) return send.reply("Use: lockgroup2 on/off");

    if (args[0].toLowerCase() === "on") {
      try {
        const threadInfo = await api.getThreadInfo(threadID);
        const groupName = threadInfo.threadName;
        const groupImageSrc = threadInfo.imageSrc;

        let imagePath = null;

        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

        if (groupImageSrc) {
          const img = await axios.get(groupImageSrc, { responseType: "arraybuffer" });
          imagePath = path.join(cacheDir, `group_${threadID}.jpg`);
          fs.writeFileSync(imagePath, Buffer.from(img.data, "binary"));
        }

        lockData[threadID] = {
          name: groupName,
          image: imagePath
        };

        return send.reply(`🔒 Group name and photo locked!`);
      } catch (err) {
        console.log(err);
        return send.reply("⚠️ Lock failed.");
      }
    }

    if (args[0].toLowerCase() === "off") {
      if (!lockData[threadID]) return send.reply("⚠️ Group is already unlocked!");

      if (lockData[threadID].image) {
        try {
          fs.unlinkSync(lockData[threadID].image);
        } catch {}
      }
      delete lockData[threadID];
      return send.reply("✅ Group unlocked.");
    }

    return send.reply("Use: lockgroup2 on/off");
  }
};
