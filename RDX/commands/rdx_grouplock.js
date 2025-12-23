const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "lockgroup",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "SARDAR RDX",
  description: "Group ka name aur photo lock karein, agar koi change kare to wapas reset ho jaye",
  commandCategory: "group",
  usages: "[on/off]",
  cooldowns: 5
};

const lockData = {}; // RAM mein lock info store

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;

  if (!args[0]) return api.sendMessage("❌ Istemaal karein: lockgroup on/off", threadID);

  if (args[0].toLowerCase() === "on") {
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const groupName = threadInfo.threadName;
      const groupImageSrc = threadInfo.imageSrc;

      let imagePath = null;

      // Group photo download aur save karo
      if (groupImageSrc) {
        const img = await axios.get(groupImageSrc, { responseType: "arraybuffer" });
        imagePath = path.join(__dirname, "cache", `group_${threadID}.jpg`);
        fs.writeFileSync(imagePath, Buffer.from(img.data, "binary"));
      }

      lockData[threadID] = {
        name: groupName,
        image: imagePath
      };

      return api.sendMessage(`🔒 Group ka name aur photo lock kar diye gaye hain!\nAgar koi change karega to main wapas reset kar dunga.`, threadID);
    } catch (err) {
      console.log(err);
      return api.sendMessage("⚠️ Lock fail ho gaya. Kuch masla ho gaya hai!", threadID);
    }
  }

  if (args[0].toLowerCase() === "off") {
    if (!lockData[threadID]) return api.sendMessage("⚠️ Group pehle hi unlock hai!", threadID);

    if (lockData[threadID].image) fs.unlinkSync(lockData[threadID].image);
    delete lockData[threadID];
    return api.sendMessage("✅ Group ka name aur photo unlock kar diya gaya hai.", threadID);
  }

  return api.sendMessage("❌ Ghalat option! Istemaal karein: lockgroup on/off", threadID);
};

module.exports.handleEvent = async function ({ api, event }) {
  const threadID = event.threadID;
  if (!lockData[threadID]) return;

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const currentName = threadInfo.threadName;
    const currentImage = threadInfo.imageSrc;

    const { name: lockedName, image: lockedImagePath } = lockData[threadID];

    // Name check karo
    if (currentName !== lockedName) {
      await api.setTitle(lockedName, threadID);
      api.sendMessage(`⚠️ Group ka name change kiya gaya tha. Wapas "${lockedName}" set kar diya gaya hai.`, threadID);
    }

    // Photo check karo
    if (lockedImagePath && currentImage) {
      const currentImgRes = await axios.get(currentImage, { responseType: "arraybuffer" });
      const currentBuffer = Buffer.from(currentImgRes.data, "binary");

      const lockedBuffer = fs.readFileSync(lockedImagePath);

      if (!currentBuffer.equals(lockedBuffer)) {
        await api.changeGroupImage(fs.createReadStream(lockedImagePath), threadID);
        api.sendMessage(`🖼️ Group ki photo change kar di gayi thi. Wapas lock wali photo laga di gayi hai.`, threadID);
      }
    }
  } catch (err) {
    console.log("Lockgroup event mein error:", err.message);
  }
};
