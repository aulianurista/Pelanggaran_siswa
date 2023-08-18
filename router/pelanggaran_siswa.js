// inisiasi library
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const db = require ("../config")
const moment = require ("moment")

// implementation 
const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// end-point menambahkan data pelanggaran siswa 

app.post("/", (req,res) => {
    // prepare data to pelanggaran_siswa
    let data = {
        waktu: moment().format('YYYY-MM-DD HH:mm:ss'), // get current time
        id_siswa: req.body.id_siswa,
        id_user: req.body.id_user
    }

    // parse to JSON
    let pelanggaran = JSON.parse(req.body.pelanggaran)

    // create query insert to pelanggaran_siswa
    let sql = "insert into pelanggaran_siswa set ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        
        if (error) {
            res.json({message: error.message, position: "pelanggaran_siswa"})
        } else {
            
            // get last inserted id_pelanggaran
            let lastID = result.insertId

            // prepare data to detail_pelanggaran
            let dataPelanggaran = []
            for (const item of pelanggaran){
                dataPelanggaran.push([lastID, item.id_pelanggaran]);
            }

            // create query insert detail_pelanggaran
            let sql = "insert into detail_pelanggaran_siswa values ?"

            db.query(sql, [dataPelanggaran], (error, result) => {
                if (error) {
                    res.json({message: error.message, position: "detail_pelanggaran_siswa"})
                } else {
                    res.json({message: "Data has been inserted"})
                }
            })
        }
    })
})

// end-point menampilkan data pelanggaran siswa
app.get("/", (req,res) => {
    // create sql query
    let sql = "select p.id_pelanggaran_siswa, p.id_siswa,p.waktu, s.nis, s.nama_siswa, p.id_user, u.nama_user " +
     "from pelanggaran_siswa p join siswa s on p.id_siswa = s.id_siswa " +
     "join user u on p.id_user = u.id_user"

    // run query
    db.query(sql, (error, result) => {
        if (error) {
            res.json({ message: error.message})   
        }else{
            res.json({
                count: result.length,
                pelanggaran_siswa: result
            })
        }
    })
})

// end-point untuk menampilkan detail pelanggaran
app.get("/:id_pelanggaran_siswa", (req,res) => {
    let param = { id_pelanggaran_siswa: req.params.id_pelanggaran_siswa}

    // create sql query
    let sql = "select p.nama_pelanggaran, p.poin " + 
    "from detail_pelanggaran_siswa dps join pelanggaran p "+
    "on p.id_pelanggaran = dps.id_pelanggaran " +
    "where ?"

    db.query(sql, param, (error, result) => {
        if (error) {
            res.json({ message: error.message})   
        }else{
            res.json({
                count: result.length,
                detail_pelanggaran_siswa: result
            })
        }
    })
})

// end-point untuk menghapus data pelanggaran_siswa
app.delete("/:id_pelanggaran_siswa", (req, res) => {
    let param = { id_pelanggaran_siswa: req.params.id_pelanggaran_siswa}

    // create sql query delete detail_pelanggaran
    let sql = "delete from detail_pelanggaran_siswa where ?"

    db.query(sql, param, (error, result) => {
        if (error) {
            res.json({ message: error.message})
        } else {
            let param = { id_pelanggaran_siswa: req.params.id_pelanggaran_siswa}
            // create sql query delete pelanggaran_siswa
            let sql = "delete from pelanggaran_siswa where ?"

            db.query(sql, param, (error, result) => {
                if (error) {
                    res.json({ message: error.message})
                } else {
                    res.json({message: "Data has been deleted"})
                }
            })
        }
    })

})

module.exports = app