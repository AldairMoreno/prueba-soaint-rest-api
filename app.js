const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();



// Iniciar servidor
const iniciarServidor = async() =>{
    try{
        app.listen(process.env.PORT, () =>{
            console.log(`El servidor se ha iniciado correctamente en http://${process.env.HOST}:${process.env.PORT}`);
        });
    } catch(error) {
        console.log(`Error al iniciar el servidor: ${error}`);
    }
}

iniciarServidor();

// Configuración de la conexión a la base de datos MongoDB Atlas
const uri = "mongodb+srv://aldairMoreno:cgJQ3CDd6P1lGelM@pruebasoaint.bnltffz.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Conexión a MongoDB Atlas establecida correctamente");

    } catch (error) {
        console.error("Error al conectar a MongoDB Atlas:", error);
    }
}

connectToDatabase();

// Definición del modelo
const Schema = mongoose.Schema;
const fileInfoSchema = new Schema({
  id: String,
  name: String,
  age: String,
  gender: String
});
const FileInfo = mongoose.model('FileInfo', fileInfoSchema);

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// Ruta POST para subir archivo y guardar en la base de datos
app.post('/uploadFile', upload.single('file'), async (req, res) => {
  try {
    const fileContent = fs.readFileSync(path.join(__dirname, 'uploads', req.file.filename), 'utf-8');
    const lines = fileContent.split('\n');

    for (const line of lines) {
      const [id, name, age, gender] = line.split(',');
      await FileInfo.create({ id, name, age, gender });
    }

    res.status(200).json({ message: 'Archivo cargado de manera correcta' });
  } catch (err) {
    console.error('Error al cargar el archivo:', err);
    res.status(500).json({ error: 'A ocurrido un error mientras se cargaba el archivo' });
  }
});

// Ruta GET para obtener información por ID
app.get('/getInfo/:id', async (req, res) => {
  try {
    const fileInfo = await FileInfo.findOne({ id: req.params.id });
    if (fileInfo) {
      res.status(200).json(fileInfo);
    } else {
      res.status(404).json({ error: 'El ID no Existe' });
    }
  } catch (err) {
    console.error('Error al obtener el ID:', err);
    res.status(500).json({ error: 'Se presento un error mientras se cargaban los datos' });
  }
});