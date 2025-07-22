const express = require('express');
const route = express.Router();
const get_video_qulity = require('../controller/yt_kanu_getvideo');
const download_yt = require("../controller/yt_kanu");
const jwt_token = require("../middlerware/jwt_token")
const {fetchInstagramReelInfo,
  downloadInstagramReel} = require("../controller/insta_grame");

route.post("/getvideo",get_video_qulity);
route.post("/download_yt",jwt_token,download_yt);
route.post("/insta",fetchInstagramReelInfo);
route.post("/download_insta",jwt_token,downloadInstagramReel);



module.exports = route;