const axios = require("axios")
const fsPromises = require("fs/promises")
const fs = require("fs")
const path = require("path")
const qs = require("qs")
// const winston = require("winston")
// const format = winston.format

let dateStr = new Date()
  .toLocaleString("zh-CN", { hour12: false })
  .replace(/[\/:]/g, "-")

// const logFile = winston.createLogger({
//   level: "info",
//   format: format.combine(
//     format.timestamp({
//       format: "YYYY-MM-DD HH:mm:ss",
//     }),
//     format.splat(),
//     format.simple()
//   ),
//   transports: [
//     new winston.transports.File({
//       filename: dateStr + ".log",
//     }),
//   ],
// })

console.log("log start", dateStr)

const configPath = path.join(__dirname, "./config.json")
const config = fs.readFileSync(configPath, {
  encoding: "utf-8",
})
const configObj = JSON.parse(config)

console.log("settings ", {
  username:
    configObj.username.slice(0, 1) + "***" + configObj.username.slice(4),
  password:
    configObj.password.slice(0, 1) + "***" + configObj.password.slice(4),
  root: configObj.root.slice(0, 1) + "***" + configObj.root.slice(4),
})
// logFile.info("log start")

let isBan = (client) => {
  if (!client || typeof client !== "string") return false
  return client.match(/(-XL0012-)|(Xunlei)|(^7\.)|(QQDownload)/i)
}

let main = async () => {
  // logFile.info("mission start")
  // number of peers be baned
  let banCount = 0
  const configPath = path.join(__dirname, "./config.json")
  const config = await fsPromises.readFile(configPath, {
    encoding: "utf-8",
  })
  const configObj = JSON.parse(config)

  const commonHeader = {
    Host: configObj.root,
    Origin: "http://" + configObj.root,
    Pragma: "no-cache",
    Referer: "http://" + configObj.root + "/",
    "Accept-Encoding": "gzip, deflate, br",
  }

  // login
  let loginRes = await axios.request({
    url: "http://" + configObj.root + "/api/v2/auth/login",
    method: "post",
    headers: {
      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      Accept: "*/*",
      ...commonHeader,
    },
    data: qs.stringify({
      username: configObj.username,
      password: configObj.password,
    }),
  })

  let cookieStr = loginRes.headers?.["set-cookie"]?.[0]
  let cookie = cookieStr.match(/(.*?);/)[1]

  // logFile.info("cookie %s", cookie.slice(0, 4) + "********" + cookie.slice(12))

  // get all mission info
  let allMission = await axios.request({
    url: "http://" + configObj.root + "/api/v2/sync/maindata",
    method: "get",
    headers: {
      Accept: "application/json",
      ...commonHeader,
      cookie,
    },
  })

  let torrents = allMission.data.torrents
  let torrentsArr = Object.keys(torrents)
  // logFile.info("torrents")
  // console.log(torrents)

  // get all user in each mission
  for (let i = 0; i < torrentsArr.length; i++) {
    let usersInOneM = await axios.request({
      url: "http://" + configObj.root + "/api/v2/sync/torrentPeers",
      method: "get",
      headers: {
        Accept: "application/json",
        ...commonHeader,
        cookie,
      },
      params: {
        hash: torrentsArr[i],
      },
    })
    let peers = usersInOneM.data.peers
    let peersArr = Object.keys(peers)
    for (let j = 0; j < peersArr.length; j++) {
      try {
        if (isBan(peers[peersArr[j]].client)) {
          console.log("屏蔽 ", [peersArr[j], peers[peersArr[j]].client])
          // logFile.info("屏蔽 ", [peersArr[j], peers[peersArr[j]].client])
          banCount++
          // maybe 404 , user has been baned
          let banUser = await axios.request({
            url: "http://" + configObj.root + "/api/v2/transfer/banPeers",
            method: "post",
            headers: {
              Accept: "application/json",
              ...commonHeader,
              cookie,
            },
            data: qs.stringify({
              hash: torrentsArr[i],
              peers: peersArr[j],
            }),
          })
          // logFile.info("ban success ", peersArr[j])
        }
      } catch (e) {
        throw new Error(e)
        console.log(e)
        // logFile.info(e.toString())
      }
    }
  }

  if (banCount === 0) {
    // logFile.info("no peers to ban")
    console.log("no peers to ban")
  }

  // logFile.info("mission end")
}


setInterval(async () => {
  try {
    await main()
  } catch (e) {
    console.log(e)
    // logFile.info(e.toString())
  }
}, 60 * 1000)
