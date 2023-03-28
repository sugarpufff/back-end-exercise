const express = require('express');
const app = express();
const users = require('./users');
const port = 3000;
const path = require("path");
const cors = require('cors');
const moment = require('moment')
const morgan = require('morgan')
const multer = require("multer")
const fs = require("fs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors({
  origin: 'http://127.0.0.1:5500',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

const log = (req, res, next) => {
    console.log(`${moment().format("LLLL")} - ${req.ip} - ${req.originUrl}`)
    next();
};
app.use(log);
app.use(morgan("combined"));

app.get('/users', (req, res) => {
  res.json(users);
});

app.get('/users/:name', (req, res) => {
  const name = req.params.name.toLowerCase();
  const user = users.find(user => user.name.toLowerCase() === name);
  
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ massage : 'Data user tidak ditemukan' });
  }
});

app.post("/users", (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ error: "Name is required" });
  } else {
    const newUser = {
      id: users.length + 1,
      name,
    };
    users.push(newUser);
    res.json(newUser);
  }
});
const upload = multer({ dest: "public" });
app.get("/upload", (req, res) => {
  res.send("Halaman upload");
})
app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  if (file){
      // membuat target penyimpanan file di forlder bernama "public"
      const target = path.join(__dirname, "public", file.originalname);
      fs.renameSync(file.path, target); // mengubah nama file kembali ke nama aslinya
      res.send("file berhasil diupload");
  } else{
      res.send("file gagal diupload");
  }
});

app.put("/users/:name", (req, res) => {
  const name = req.params.name.toLowerCase();
  const { newName } = req.body;

  const user = users.find((u) => u.name.toLowerCase() === name);

  if (!user) {
    res.status(404).json({ error: "User not found" });
  } else if (!newName) {
    res.status(400).json({ error: "New name is required" });
  } else {
    user.name = newName;
    res.json(user);
  }
});

app.delete("/users/:name", (req, res) => {
  const name = req.params.name.toLowerCase();

  const index = users.findIndex((u) => u.name.toLowerCase() === name);

  if (index === -1) {
    res.status(404).json({ error: "User not found" });
  } else {
    users.splice(index, 1);
    res.json({ message: "User deleted successfully" });
  }
});

const notFound = (req, res, next) => {
    res.json({
      status: "error",
      message: "resource tidak ditemukan",
    });
    };
app.use(notFound);
app.use((err, req, res, next) => {
    res.json({
      status:"error",
      message: `terjadi kesalahan pada server:${err}`,
  })
})
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
