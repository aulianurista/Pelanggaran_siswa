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
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(__dirname))//directory file

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // set file storage
        cb(null, 'image/asset');
    },
    filename: (req, file, cb) => {
        // generate file name 
        cb(null, "asset - "+ Date.now() + path.extname(file.originalname))
    }
})

let upload = multer({storage: storage})


validateToken = () => {
    return (req, res, next) => {
        // cek keberadaan "Token" pada request header
        if (!req.get("Token")) {
            // jika "Token" tidak ada
            res.json({
                message: "Access Forbidden"
            })
        } else {
            // tampung nilai Token
            let token  = req.get("Token")
            
            // decrypt token menjadi id_user
            let decryptToken = crypt.decrypt(token)

            // sql cek id_user
            let sql = "select * from user where ?"

            // set parameter
            let param = { id_user: decryptToken}

            // run query
            db.query(sql, param, (error, result) => {
                if (error) throw error
                 // cek keberadaan id_user
                if (result.length > 0) {
                    // id_user tersedia
                    next()
                } else {
                    // jika user tidak tersedia
                    res.json({
                        message: "Invalid Token"
                    })
                }
            })
        }

    }
}


// end-point akses data siswa
// app.get("/", (req, res) => {
//     // create sql query
//     let sql = "select * from siswa"

//Authentication and Authorization
    app.get("/",validateToken(), (req, res) => {
        // create sql query
        let sql = "select * from siswa"

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
                siswa: result // isi data
            }            
        }
        res.json(response) // send response
    })
})

// end-point akses data siswa berdasarkan id_siswa tertentu
app.get("/:id", (req, res) => {
    let data = {
        id_siswa: req.params.id
    }
    // create sql query
    let sql = "select * from siswa where ?"

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
                siswa: result // isi data
            }            
        }
        res.json(response) // send response
    })
})

// end-point menyimpan data siswa
app.post("/",upload.single ("asset"), (req,res) => {

    // prepare data
    let data = {
        nis: req.body.nis,
        nama_siswa: req.body.nama_siswa,
        kelas: req.body.kelas,
        poin: req.body.poin,
        asset: req.file.filename
    }
    if (!req.file) {
        // jika tidak ada file yang diupload
        res.json({
            message: "Tidak ada file yang dikirim"
        })
    } else {
        // create sql insert
        let sql = "insert into siswa set ?"

        // run query
        db.query(sql, data, (error, result) => {
            if(error) throw error
            res.json({
                message: result.affectedRows + " data berhasil disimpan"
            })
        })
    }
})


// end-point mengubah data siswa
app.put("/:id", upload.single ("asset"), (req,res) => {

    let data = null, sql =  null
    // parameter perubahan data
    let param = {
        id_siswa : req.params.id
    }
    
    if (!req.file) {
        // jika tidak ada file yang dikirim = update data saja
        data = {
            nip : req.body.nip,
            nama_siswa : req.body.nama_siswa,
            tgl_lahir : req.body.tgl_lahir,
            alamat : req.body.alamat
        }
    } else {
        // jika mengirim file = update data + reupload
        data = {
            nip : req.body.nip,
            nama_siswa : req.body.nama_siswa,
            tgl_lahir : req.body.tgl_lahir,
            alamat : req.body.alamat,
            asset : req.file.filename
        }

        // get data yang akan diupdate untuk mendapatkan nama file yang lama

        sql = "select * from siswa where ?"
        // run query
        db.query(sql, param, (error, result) => {
            if (error) throw error
            // tampung nama file yang lama
            let filename = result[0].asset

            // hapus file yang lama
            let dir = path.join(__dirname,"asset",filename)
            fs.unlink(dir, (error) => {})
        })
    }
    
    // create sql update
    sql = "update siswa set ? where ?"

    // jalankan sql update
    db.query(sql, [data,param], (error, result) => {
        if (error) {
            res.json({
                message: error.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data berhasil diubah"
            })
        }
    })

})

// end-point menghapus data siswa berdasarkan id_siswa
app.delete("/:id", (req,res) => {
    // prepare data
    let param = {id_siswa: req.params.id}

    // ambil data yang akan dihapus
    let sql = "select * from siswa where ?"
    // jalankan query
    db.query(sql, param, (error, result) => {
        if (error) throw error
        
        // tampung nama file yang lama
        let fileName = result[0].asset

        // hapus file yg lama
        let dir = path.join(__dirname,"asset",fileName)
        fs.unlink(dir, (error) => {})
    })

    // create sql delete
    sql = "delete from siswa where ?"

    // jalankan query
    db.query(sql, param, (error, result) => {
        if (error) {
            res.json({
                message: error.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data berhasil dihapus"
            })
        }      
    })
})




module.exports = app