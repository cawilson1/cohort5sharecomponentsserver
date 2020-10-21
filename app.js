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
  user: process.env.sqluser,
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

app.post("/creator", authorizeUser, async (req, resp) => {
  console.log("get creator hit");
  try {
    const conn = await pool.getConnection();
    const creator = req.body.creator;

    const response = await conn.execute(
      `SELECT * FROM componentsDb.users WHERE username=?`,
      [creator]
    );
    conn.release();
    resp.status(200).send(response[0][0]);
  } catch (error) {
    resp.status(500).send(error);
    console.log(error);
  }
});

app.post("/update-user", authorizeUser, async (req, resp) => {
  console.log("update user hit");
  try {
    const username = req.decodedToken["cognito:username"];
    const name = req.body.name;
    const aboutMe = req.body.aboutMe;
    const conn = await pool.getConnection();
    const response = await conn.execute(
      "UPDATE componentsDb.users SET name=?, about=? WHERE username=?",
      [name, aboutMe, username]
    );

    conn.release();

    resp.status(201).send(response);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
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

//home page, list all comps from all users
app.post("/get-all-comps", authorizeUser, async (req, resp) => {
  console.log("get all comps hit");
  try {
    const username = req.decodedToken["cognito:username"];
    const conn = await pool.getConnection();
    const response = await conn.execute(
      "SELECT * FROM componentsDb.components"
    );

    conn.release();
    resp.status(200).send(response[0]);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
});

app.post("/get-user-comps", authorizeUser, async (req, resp) => {
  console.log("get user comps hit");
  try {
    const username = req.decodedToken["cognito:username"];
    const conn = await pool.getConnection();
    const response = await conn.execute(
      "SELECT * FROM componentsDb.components WHERE creator=?",
      [username]
    );

    conn.release();
    resp.status(200).send(response[0]);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
});

app.post("/get-creator-comps", authorizeUser, async (req, resp) => {
  console.log("get user comps hit");
  try {
    const creator = req.body.creator;
    const conn = await pool.getConnection();
    const response = await conn.execute(
      "SELECT * FROM componentsDb.components WHERE creator=?",
      [creator]
    );

    conn.release();
    resp.status(200).send(response[0]);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
});

app.post("/get-s3-component-screenshot2", async (req, resp) => {
  console.log("get s3 component screenshot2@@@@@@@@");
  try {
    // const conn = await pool.getConnection();
    const screenshotPath = "public/" + req.body.path;
    // const screenshotPath =
    //   'public/mike/components/TestComponent/Itachi Uchiha.jpg';
    const params = {
      Bucket: "cohortgroupbucket135153-cohortfive",
      Key: screenshotPath,
      Expires: 30,
    };

    s3.getSignedUrlPromise("getObject", params)
      .then((url) => {
        console.log(url);
        resp.status(200).send(url);
      })

      .catch((err) => resp.status(500).send(err));

    // conn.release();
    //resp.status(200).send(response)
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
});

//get s3 component screenshot needs to take path and get s3pic from storage
app.post("/get-s3-component-screenshot", async (req, resp) => {
  console.log("get s3 component screenshot");
  try {
    // const conn = await pool.getConnection();
    //const screenShotPath = "public/" + req.body.screenshotPath
    const screenshotPath =
      "public/mike/components/TestComponent/Itachi Uchiha.jpg";
    const params = {
      Bucket: "cohortgroupbucket135153-cohortfive",
      Key: screenshotPath,
      Expires: 30,
    };

    s3.getSignedUrlPromise("getObject", params)
      .then((url) => {
        console.log(url);
        resp.status(200).send(url);
      })

      .catch((err) => resp.status(500).send(err));

    // conn.release();
    //resp.status(200).send(response)
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
});

app.post("/get-s3-component-js2", async (req, resp) => {
  console.log("get s3 component js file");
  try {
    // const conn = await pool.getConnection()
    const jsPath = "public/" + req.body.path;
    const params = {
      Bucket: "cohortgroupbucket135153-cohortfive",
      Key: jsPath,
      Expires: 30,
    };

    s3.getSignedUrlPromise("getObject", params)
      .then((url) => {
        console.log(url);
        resp.status(200).send(url);
      })

      .catch((err) => resp.status(500).send(err));

    // conn.release()
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
});

//get s3 component js needs be changed to take path to js file
app.post("/get-s3-component-js", async (req, resp) => {
  console.log("get s3 component js file");
  try {
    // const conn = await pool.getConnection()
    const jsPath = "public/mike/components/TestComponent/recursion.js";
    const params = {
      Bucket: "cohortgroupbucket135153-cohortfive",
      Key: jsPath,
      Expires: 30,
    };

    s3.getSignedUrlPromise("getObject", params)
      .then((url) => {
        console.log(url);
        resp.status(200).send(url);
      })

      .catch((err) => resp.status(500).send(err));

    // conn.release()
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
});

//get s3 read me needs to be changed to take readme path
app.post("/get-s3-component-readme", async (req, resp) => {
  console.log("get s3 component readme");
  try {
    // const conn = await pool.getConnection()
    const readMePath = "public/mike/components/TestComponent/private.txt";
    const params = {
      Bucket: "cohortgroupbucket135153-cohortfive",
      Key: readMePath,
      Expires: 30,
    };

    s3.getSignedUrlPromise("getObject", params)
      .then((url) => {
        console.log(url);
        resp.status(200).send(url);
      })

      .catch((err) => resp.status(500).send(err));

    // conn.release()
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
});

//get s3 read me needs to be changed to take readme path
app.post("/get-s3-component-readme2", async (req, resp) => {
  console.log("get s3 component readme");
  try {
    // const conn = await pool.getConnection()
    const readMePath = "public/" + req.body.path;
    const params = {
      Bucket: "cohortgroupbucket135153-cohortfive",
      Key: readMePath,
      Expires: 30,
    };

    s3.getSignedUrlPromise("getObject", params)
      .then((url) => {
        console.log(url);
        resp.status(200).send(url);
      })

      .catch((err) => resp.status(500).send(err));

    // conn.release()
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
});

//works for other users too? or make a seperate route?
//if there is something in the request body for creater, get that
//if not get user?
//following, editing, searching and tagging components

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

app.post("/get-creator-s3-pic", authorizeUser, async (req, resp) => {
  console.log("get creator s3 pic hit");
  try {
    const creator = req.body.creator;
    const conn = await pool.getConnection();
    const response = await conn.execute(
      "SELECT * FROM componentsDb.users WHERE username=?",
      [creator]
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

app.post("/create-component", authorizeUser, async (req, resp) => {
  console.log("create component hit");
  try {
    const componentUuid = req.body.componentUuid;
    const title = req.body.title;
    const creator = req.decodedToken["cognito:username"];
    const mainFile = req.body.mainFileUrl.key;
    const readMe = req.body.readMeUrl.key;
    const screenshot = req.body.screenshotUrl.key;
    const timeCreated = Date.now();

    const conn = await pool.getConnection();
    const response = await conn.execute(
      "INSERT INTO componentsDb.components (componentUuid, title, creator, mainFile, readMe, screenshot, timeCreated) VALUES (?,?,?,?,?,?,?)",
      [componentUuid, title, creator, mainFile, readMe, screenshot, timeCreated]
    );

    conn.release();
    resp.status(201).send(response);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
});

app.post("/update-component", authorizeUser, async (req, resp) => {
  console.log("update hit");
  try {
    const componentUuid = req.body.componentUuid;
    const title = req.body.title;
    const creator = req.decodedToken["cognito:username"];
    const mainFile = req.body.mainFileUrl;
    const readMe = req.body.readMeUrl;
    const screenshot = req.body.screenshotUrl;
    const timeCreated = Date.now();

    console.log(componentUuid);
    console.log(title);
    console.log(creator);
    console.log(mainFile);
    console.log(readMe);
    console.log(screenshot);
    console.log(timeCreated);

    const conn = await pool.getConnection();

    const response = await conn.execute(
      "UPDATE componentsDb.components SET title=?, creator=?, mainFile=?, readMe=?, screenshot=?, timeCreated=? WHERE componentUuid=?",
      [title, creator, mainFile, readMe, screenshot, timeCreated, componentUuid]
    );
    conn.release();
    resp.status(201).send({ message: "successful update" });
  } catch (error) {
    resp.status(500).send(error);
    console.log(error);
  }
});

app.post("/delete-component", authorizeUser, async (req, resp) => {
  console.log("delete comp hit");
  try {
    const componentId = req.body.componentId;
    const conn = await pool.getConnection();

    const response = await conn.execute(
      "DELETE FROM componentsDb.components WHERE componentId=?",
      [componentId]
    );

    conn.release();
    resp.status(200).send({ message: "successfully deleted" });
  } catch (error) {
    resp.status(500).send(error);
    console.log(error);
  }
});

//follow-user
app.post("/follow-user", authorizeUser, async (req, resp) => {
  try {
    const follower = req.decodedToken["cognito:username"];
    const followedUser = req.body.followedUser;

    const conn = await pool.getConnection();
    const response = await conn.execute(
      `INSERT INTO componentsDb.following (follower, followedUser) VALUES (?,?)`,
      [follower, followedUser]
    );

    conn.release();
    resp.status(201).send(response);
  } catch (error) {
    console.log(error);
    resp.status(500).send({ message: error });
  }
});

app.post("/get-followed-user", authorizeUser, async (req, resp) => {
  try {
    const follower = req.decodedToken["cognito:username"];
    const conn = await pool.getConnection();
    const response = await conn.execute(
      `SELECT * FROM componentsDb.following WHERE follower=?`,
      [follower]
    );
    conn.release();
    resp.status(201).send(response[0]);
  } catch (error) {
    console.log(error);
    resp.status(500).send({ message: error });
  }
});

app.post("/delete-followed-user", authorizeUser, async (req, resp) => {
  try {
    const follower = req.decodedToken["cognito:username"];
    const followedUser = req.body.followedUser;

    const conn = await pool.getConnection();
    const unfollowed = await conn.execute(
      `DELETE FROM componentsDb.following WHERE follower = ? AND followedUser = ?`,
      [follower, followedUser]
    );
    conn.release();
    resp.status(200).send({ message: "successfully unfollowed user" });
  } catch (error) {
    console.log(error);
    resp.status(500).send({ message: error });
  }
});
//post for get s3 image which is the users avatar

app.listen(PORT, () => console.log("app is listening on", PORT));
