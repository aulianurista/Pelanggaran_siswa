const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")    
const app = express()  

app.use(cors())                                    
app.use(bodyParser.json())                          
app.use(bodyParser.urlencoded({extended: true}))


const siswa = require("./router/siswa")
app.use("/siswa", siswa)

const user = require("./router/user")
app.use("/user", user)

const pelanggaran = require("./router/pelanggaran")
app.use("/pelanggaran", pelanggaran)

const pelanggaran_siswa = require("./router/pelanggaran_siswa")
app.use("/pelanggaran_siswa", pelanggaran_siswa)

app.listen(8000, () => {
    console.log("Server run on port 8000")
})