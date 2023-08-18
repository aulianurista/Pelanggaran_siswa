// inisiasi library
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const mysql = require("mysql")
const md5 = require("md5")
const multer = require("multer")//mengolah file
const path = require("path")//memanggil directory file contoh:"jika kita mengambil foto dari folder luar dan kemudian dimasukkan ke dalam folder yang ada di pelanggaran siswa"
const fs = require("fs")//mengakses file system
const db = require("../config")
const { validateHeaderName } = require("http")
const Cryptr = require("cryptr")
const crypt = new Cryptr("140533601726") // secret key, boleh diganti kok

// implementation 
const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// endpoint login user (authentication)
app.post("/auth", (req, res) => {
    // tampung username dan password
    let param = [
        req.body.username, //username
        md5(req.body.password) // password
    ]
    

    // create sql query
    let sql = "select * from user where username = ? and password = ?"

    // run query
    db.query(sql, param, (error, result) => {
        if (error) throw error

        // cek jumlah data hasil query
        if (result.length > 0) {
            // user tersedia
            res.json({
                message: "Logged",
                token: crypt.encrypt(result[0].id_user), // generate token
                data: result
            })
        } else {
            // user tidak tersedia
            res.json({
                message: "Invalid username/password"
            })
        }
    })
})

app.get("/", (req, res) => {
    // create sql query
    let sql = "select * from user" 

    // run query
    db.query(sql, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message // pesan error
            }            
        } else {
            response = {
                count: result.length, // jumlah data
                user: result // isi data
            }            
        }
        res.json(response) // send response
    })
})

app.get("/:id", (req, res) => {
    let data = {
        id_user: req.params.id
    }
    // create sql query
    let sql = "select * from user where ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message // pesan error
            }            
        } else {
            response = {
                count: result.length, // jumlah data
                user: result // isi data
            }            
        }
        res.json(response) // send response
    })
})

// end-point menyimpan data user
app.post("/", (req,res) => {

    // prepare data
    let data = {
        nama_user: req.body.nama_user,
        username: req.body.username,
        password: md5(req.body.password)
    }

    // create sql query insert
    let sql = "insert into user set ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data inserted"
            }
        }
        res.json(response) // send response
    })
})

// end-point mengubah data user
app.put("/:id", (req,res) => {

    // prepare data
    let data = [
        // data
        {
            nama_user: req.body.nama_user,
            username: req.body.username,
            password: md5(req.body.password),
        },

        // parameter (primary key)
        {
            id_user: req.params.id
        }
    ]

    // create sql query update
    let sql = "update user set ? where ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data updated"
            }
        }
        res.json(response) // send response
    })
})

// end-point menghapus data user berdasarkan id_user
app.delete("/:id", (req,res) => {
    // prepare data
    let data = {
        id_user: req.params.id
    }

    // create query sql delete
    let sql = "delete from user where ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data deleted"
            }
        }
        res.json(response) // send response
    })
})

module.exports = app