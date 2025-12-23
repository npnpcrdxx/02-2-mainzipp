const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "pair",
  version: "1.0.0", 
  hasPermssion: 0,
  credits: "D-Jukie (Modified by RDX)",
  description: "Pairing - Find your soulmate",
  commandCategory: "Love", 
  usages: "pair [@mention optional]", 
  cooldowns: 0
};

const cacheDir = path.join(__dirname, "cache");

const maleNames = ["ali", "ahmed", "muhammad", "hassan", "hussain", "sardar", "rdx", "usman", "bilal", "hamza", "asad", "zain", "fahad", "faisal", "imran", "kamran", "adnan", "arslan", "waqas", "waseem", "irfan", "junaid", "khalid", "nadeem", "naveed", "omer", "qasim", "rizwan", "sajid", "salman", "shahid", "tariq", "umar", "yasir", "zahid"];
const femaleNames = ["fatima", "ayesha", "maria", "sana", "hira", "zara", "maryam", "khadija", "sara", "amina", "bushra", "farah", "iqra", "javeria", "kinza", "laiba", "maham", "nadia", "rabia", "saima", "tahira", "uzma", "zainab", "anam", "asma", "dua", "esha", "fiza", "huma", "iram"];

function detectGender(name) {
  if (!name) return "unknown";
  const lowerName = name.toLowerCase();
  if (femaleNames.some(n => lowerName.includes(n))) return "female";
  if (maleNames.some(n => lowerName.includes(n))) return "male";
  return "unknown";
}

async function getThreadMembers(api, threadID) {
  return new Promise((resolve) => {
    api.getThreadInfo(threadID, (err, info) => {
      if (err) return resolve([]);
      resolve(info.participantIDs || []);
    });
  });
}

async function getUserInfo(api, uid) {
  return new Promise((resolve) => {
    api.getUserInfo(uid, (err, info) => {
      if (err) return resolve({});
      resolve(info[uid] || {});
    });
  });
}

function isValidName(name) {
  if (!name || name.trim() === '') return false;
  const lower = name.toLowerCase();
  if (lower === 'facebook' || lower === 'facebook user' || lower.includes('facebook user')) return false;
  if (lower === 'unknown' || lower === 'user') return false;
  return true;
}

async function getProperName(api, uid, Users) {
  try {
    if (Users && Users.getNameUser) {
      const name = await Users.getNameUser(uid);
      if (isValidName(name)) return name;
    }
    const info = await getUserInfo(api, uid);
    if (isValidName(info.name)) return info.name;
    if (isValidName(info.firstName)) return info.firstName;
    if (isValidName(info.alternateName)) return info.alternateName;
    return 'Jaan';
  } catch (e) {
    return 'Jaan';
  }
}

async function downloadImage(url, filePath) {
  try {
    const response = await axios.get(url, { 
      responseType: "arraybuffer",
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    fs.writeFileSync(filePath, Buffer.from(response.data));
    return true;
  } catch (e) {
    return false;
  }
}

function cleanupFiles(...files) {
  for (const file of files) {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch (e) {}
  }
}

module.exports.run = async function({ api, event, Users }) {
  const { threadID, messageID, senderID } = event;
  const mention = Object.keys(event.mentions || {});
  
  const timestamp = Date.now();
  const avtPath = path.join(cacheDir, `avt_${timestamp}.png`);
  const gifPath = path.join(cacheDir, `giflove_${timestamp}.gif`);
  const avt2Path = path.join(cacheDir, `avt2_${timestamp}.png`);

  try {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    let one = senderID;
    let two;
    let senderInfo = await getUserInfo(api, senderID);
    let senderGender = senderInfo.gender === 1 ? "female" : senderInfo.gender === 2 ? "male" : detectGender(senderInfo.name || "");

    if (mention[0]) {
      two = mention[0];
    } else {
      const members = await getThreadMembers(api, threadID);
      const botID = api.getCurrentUserID();
      const filteredMembers = members.filter(m => m !== senderID && m !== botID);

      if (filteredMembers.length === 0) {
        return api.sendMessage("┏━•❃°•°❀°•°❃•━┓\n\n❌ 𝐍𝐨 𝐦𝐞𝐦𝐛𝐞𝐫𝐬 𝐟𝐨𝐮𝐧𝐝 𝐭𝐨 𝐩𝐚𝐢𝐫!\n\n┗━•❃°•°❀°•°❃•━┛", threadID, messageID);
      }

      let oppositeGenderMembers = [];
      const checkLimit = Math.min(filteredMembers.length, 30);
      
      for (let i = 0; i < checkLimit; i++) {
        const uid = filteredMembers[i];
        try {
          const info = await getUserInfo(api, uid);
          const memberGender = info.gender === 1 ? "female" : info.gender === 2 ? "male" : detectGender(info.name || "");
          
          if (senderGender === "male" && memberGender === "female") {
            oppositeGenderMembers.push(uid);
          } else if (senderGender === "female" && memberGender === "male") {
            oppositeGenderMembers.push(uid);
          } else if (senderGender === "unknown" || memberGender === "unknown") {
            oppositeGenderMembers.push(uid);
          }
        } catch (e) {
          oppositeGenderMembers.push(uid);
        }
      }

      if (oppositeGenderMembers.length === 0) {
        oppositeGenderMembers = filteredMembers;
      }

      two = oppositeGenderMembers[Math.floor(Math.random() * oppositeGenderMembers.length)];
    }

    var tle = Math.floor(Math.random() * 101);
    var namee = await getProperName(api, senderID, Users);
    var name = await getProperName(api, two, Users);

    var arraytag = [];
    arraytag.push({id: senderID, tag: namee});
    arraytag.push({id: two, tag: name});

    const avatar1Url = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avatar2Url = `https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const gifUrl = `https://i.ibb.co/wC2JJBb/trai-tim-lap-lanh.gif`;

    await Promise.all([
      downloadImage(avatar1Url, avtPath),
      downloadImage(gifUrl, gifPath),
      downloadImage(avatar2Url, avt2Path)
    ]);

    var imglove = [];
    if (fs.existsSync(avtPath)) imglove.push(fs.createReadStream(avtPath));
    if (fs.existsSync(gifPath)) imglove.push(fs.createReadStream(gifPath));
    if (fs.existsSync(avt2Path)) imglove.push(fs.createReadStream(avt2Path));

    var msg = {
      body: `┏━•❃°•°❀°•°❃•━┓

𝐎𝐰𝐧𝐞𝐫 ·˚ ༘₊·꒰➳: ̗̀➛ 🍓 𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗

┗━•❃°•°❀°•°❃•━┛ 

✦ ━━━━ ༺♡༻ ━━━━ ✦

[❝ 𝑇𝑢𝑗ℎ𝑘𝑜 𝑑𝑒𝑘ℎ 𝑘𝑒 𝑏𝑎𝑠 𝑒𝑘 𝑘ℎ𝑦𝑎𝑎𝑙 𝑎𝑎𝑡𝑎 ℎ𝑎𝑖,
𝐷𝑖𝑙 𝑘𝑎ℎ𝑡𝑎 ℎ𝑎𝑖 𝑘𝑎𝑠ℎ 𝑡𝑢 𝑠𝑎𝑎𝑡ℎ ℎ𝑜... ❞]

✦ ━━━━ ༺♡༻ ━━━━ ✦

[❝ 𝐸𝑘 𝑊𝑎𝑞𝑡 𝑎𝑎𝑦𝑒 𝑍𝑖𝑛𝑑𝑎𝑔𝑖 𝑚𝑒𝑖𝑛...

𝐽𝑎ℎ𝑎𝑎𝑛 𝑡𝑢 𝑣𝑖 𝑚𝑒𝑟𝑒 𝑝𝑦𝑎𝑟 𝑚𝑒𝑖𝑛 ℎ𝑜 ❞]

✦ ━━━━ ༺♡༻ ━━━━ ✦

┌──═━┈━═──┐

➻ 𝐍𝗔ɱɘ ✦ ${namee}

➻ 𝐍𝗔ɱɘ ✦ ${name}

└──═━┈━═──┘

✦ ━━━━ ༺♡༻ ━━━━ ✦

🌸🍁𝐘𝐎𝐔𝐑 𝐋𝐎𝐕𝐄 𝐋𝐄𝐕𝐄𝐋💝 : ╰┈➤ ${tle}%

${namee} 🌺 ${name}`,
      mentions: arraytag,
      attachment: imglove.length > 0 ? imglove : undefined
    };

    return api.sendMessage(msg, threadID, () => {
      setTimeout(() => {
        cleanupFiles(avtPath, gifPath, avt2Path);
      }, 3000);
    }, messageID);

  } catch (error) {
    console.error("Pair command error:", error);
    cleanupFiles(avtPath, gifPath, avt2Path);
    return api.sendMessage("┏━•❃°•°❀°•°❃•━┓\n\n❌ 𝐄𝐫𝐫𝐨𝐫 𝐜𝐫𝐞𝐚𝐭𝐢𝐧𝐠 𝐩𝐚𝐢𝐫!\n\n┗━•❃°•°❀°•°❃•━┛", threadID, messageID);
  }
};
