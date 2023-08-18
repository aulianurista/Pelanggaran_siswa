// inisiasi library
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const db = require ("../config")

// implementation 
const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.get("/", (req, res) => {
    // create sql query
    let sql = "select * from pelanggaran" 

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
                pelanggaran: result // isi data
            }            
        }
        res.json(response) // send response
    })
})

app.get("/:id", (req, res) => {
    let data = {
        id_pelanggaran: req.params.id
    }
    // create sql query
    let sql = "select * from pelanggaran where ?"

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
                pelanggaran: result // isi data
            }            
        }
        res.json(response) // send response
    })
})

// end-point menyimpan data pelanggaran
app.post("/", (req,res) => {

    // prepare data
    let data = {
        nama_pelanggaran: req.body.nama_pelanggaran,
        poin: req.body.poin
    }

    // create sql query insert
    let sql = "insert into pelanggaran set ?"

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

// end-point mengubah data pelanggaran
app.put("/:id", (req,res) => {

    // prepare data
    let data = [
        // data
        {
            nama_pelanggaran: req.body.nama_pelanggaran,
            poin: req.body.poin
        },

        // parameter (primary key)
        {
            id_pelanggaran: req.params.id
        }
    ]

    // create sql query update
    let sql = "update pelanggaran set ? where ?"

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

// end-point menghapus data pelanggaran berdasarkan id_pelanggaran
app.delete("/:id", (req,res) => {
    // prepare data
    let data = {
        id_pelanggaran: req.params.id
    }

    // create query sql delete
    let sql = "delete from pelanggaran where ?"

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