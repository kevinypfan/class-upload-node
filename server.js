const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const mongoose = require('mongoose');
const Upload = require('./models/upload');
const User = require('./models/user');
const multer = require('multer');


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    console.log(file)
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const uploadFile = multer({ storage })

const app = express();

mongoose.connect('mongodb://localhost/studentUpload', { useNewUrlParser: true }).then(() => {
  console.log("Connected to Database!")
}).catch((err) => {
  console.log("Not Connected to Database ERROR! ", err);
});

app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/hello', (req, res, next) => {
  res.send('hello world!')
})

app.get('/upload', (req, res) => {
  Upload.find().then((result) => {
    res.send(result);
  })
})

app.post('/upload', uploadFile.single('file'), (req, res) => {
  const filePath = req.file.path;
  const body = _.pick(req.body, ['name', 'studentId'])
  body.filePath = filePath;
  const upload = new Upload(body);
  upload.save().then((result) => {
    res.send(result)
  })
})

app.post('/signup', (req, res) => {
  const body = _.pick(req.body, ['username', 'password'])
  const user = new User(body);
  user.save().then(user => {
    return user.generateAuthToken()
  }).then((token) => {
    res.send('註冊成功');
  }).catch(err => {
    res.status(400).send(err)
  })
})

app.post('/login', (req, res) => {
  const body = _.pick(req.body, ['username', 'password'])
  User.findOne({ username: body.username }).then(user => {
    if (!user) {
      res.send(401, "Can't find the user!")
      return;
    }
    return user.userAuthentication(body.password)
  }).then(result => {
    if (result) {
      return user.generateAuthToken()
    } else {
      res.send(401, "password have some wrong!" + err)
    }
  }).then(token => {
    res.send('登入成功!');
  }).catch(err => {
    res.send(401, "password have some wrong!" + err)
  })
})


app.listen(3000, () => {
  console.log('server start up port: ' + 3000);
})


/*
會員登入才能上傳跟觀看所有的上傳檔案
上傳的會給編號 學號 名字 時間 管理員功能有開啟上傳跟關閉上
*/