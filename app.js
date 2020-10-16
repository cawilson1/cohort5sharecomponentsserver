require("dotenv").config();
const express = require("express");
const sql = require("mysql2/promise");
const cors = require("cors");
const PORT = 4000;
const authorizeUser = require("./authorize/functions");
const aws = require("aws-sdk");
// const serverless = require('serverless-http');

aws.config.setPromisesDependency();
aws.config.update({
  accessKeyId: process.env.s3TokenKey,
  secretAccessKey: process.env.s3Secret,
  region: "us-east-1",
});
const s3 = new aws.S3();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const pool = sql.createPool({
  host: process.env.host,
  user: process.env.users,
  password: process.env.password,
});

app.post("/user", authorizeUser, async (req, resp) => {
  console.log("get user hit");
  try {
    const conn = await pool.getConnection();
    const username = req.decodedToken["cognito:username"];

    const response = await conn.execute(
      `SELECT * FROM componentsDb.users WHERE username=?`,
      [username]
    );
    conn.release();
    resp.status(200).send(response[0][0]);
  } catch (error) {
    resp.status(500).send(error);
    console.log(error);
  }
});

app.post("/create-user", authorizeUser, async (req, resp) => {
  console.log("create user hit");
  try {
    const conn = await pool.getConnection();
    const username = req.decodedToken["cognito:username"];
    const avatar = req.body.avatar;

    const response = await conn.execute(
      "INSERT INTO componentsDb.users (username, avatar) VALUES (?,?)",
      [username, avatar]
    );

    conn.release();
    resp.status(200).send(response);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
});

app.post("/get-s3-pic", authorizeUser, async (req, resp) => {
  console.log("get s3 pic hit");
  try {
    const username = req.decodedToken["cognito:username"];
    const conn = await pool.getConnection();
    const response = await conn.execute(
      "SELECT * FROM componentsDb.users WHERE username=?",
      [username]
    );
    conn.release();
    console.log("response", response[0][0]);
    const avatarPath = `public/${response[0][0].avatar}`;
    console.log("file path:", avatarPath);

    const params = {
      Bucket: "cohortgroupbucket135153-cohortfive",
      Key: avatarPath,
      Expires: 30,
    };

    s3.getSignedUrlPromise("getObject", params)
      .then((url) => {
        console.log(url);
        resp.status(200).send(url);
      })

      .catch((err) => resp.status(500).send(err));
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
});

app.put("/update-pic", authorizeUser, async (req, resp) => {
  try {
    const conn = await pool.getConnection();
    const username = req.decodedToken["cognito:username"];
    const avatar = req.body.avatar;
    const result = await conn.execute(
      "UPDATE componentsDb.users SET avatar=? WHERE username=?",
      [avatar, username]
    );
    conn.release();
    resp.status(201).send(result);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
});

app.get("/s3-component-url", async (req, resp) => {
  try {
    // const username = req.decodedToken["cognito:username"];
    const conn = await pool.getConnection();
    // const response = await conn.execute(
    //   "SELECT * FROM componentsDb.users WHERE username=?",
    //   [username]
    // );
    // console.log("response", response[0][0]);
    conn.release();

    const componentPath =
      "public/mike/components/fb04417d-934a-43b2-a809-f1992c457ba4.js";
    console.log("file path:", componentPath);

    const params = {
      Bucket: "cohortgroupbucket135153-cohortfive",
      Key: componentPath,
      Expires: 30,
    };

    s3.getSignedUrlPromise("getObject", params)
      .then((url) => {
        console.log(url);
        resp.status(200).send(url);
      })

      .catch((err) => resp.status(500).send(err));
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
});

app.listen(PORT, () => console.log("app is listening on", PORT));
