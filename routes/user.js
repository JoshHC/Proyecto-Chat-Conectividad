var express = require('express');
var Cryptojs = require('crypto-js');
var router = express.Router();

//JWT
var jwt = require('jsonwebtoken')
var jwts = require('jwt-simple')

//CONECTIVIDAD CON MONGODB
const mongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'
const dbName = 'Proyecto'


/* Generacion del Token */
function TokenGeneration(Json, Keyword)
{
  jwts.encode(Json, Keyword)
  return token = jwt.sign(Json, Keyword, {
    expiresIn: "3m"
  })
}
  
/* Verificacion del Token */
function VerifyToken(req, res, next) {
  const bearerHeader = req.headers.authorization
    if(bearerHeader){
      jwt.verify(bearerHeader,"SecretWord", function(err, decoded){
        if(err) return next(createError(500))
        delete decoded.iat
        delete decoded.exp
        const newtoken = TokenGeneration(decoded,"SecretWord");
        return res.status(200).json(newtoken)
       // return next();
      })
    }else{
    res.sendStatus(403)
    }
  }


  router.post('/autenticacion', (req,res) =>{
    mongoClient.connect(url,{ useNewUrlParser: true},(err,client)=>{
      if(err) return next(createError(500))
      const database = client.db(dbName)
      const collection = database.collection('Usuarios')
      collection.findOne({username:req.body.username, password: req.body.password},function(err,doc){
        if(err) return next(createError(500))
        if(doc){
          const token =   TokenGeneration(doc,"SecretWord")
          res.status(200).json(token).end()
        }else{
          res.status(404).end()
        }
  
      })
    })
  })

 /* Validacion del SplashScreen */
  router.get('/verify', VerifyToken, (req,res)=>{})

  router.post('/login', (req,res) =>{
    mongoClient.connect(url,{ useNewUrlParser: true},(err,client)=>{
      if(err) return next(createError(500))
      const database = client.db(dbName)
      const collection = database.collection('Usuarios')
      var encrypted = Cryptojs.SHA256(req.body.Password,"SecretWord").toString();
      collection.findOne({username:req.body.username, password: encrypted},function(err,doc){
        if(err) return next(createError(500))
        if(doc){          
          const token =   TokenGeneration(doc, "SecretWord")
          res.status(200).json(token)
        }else{
          res.status(404).end()
        }
  
      })
    })
  })
  
  /*Se Obtienen todos los usuarios de la base de Datos*/
  router.get('/', function(req, res, next) {
    mongoClient.connect(url,{ useNewUrlParser: true},(err,client)=>{
      if(err) return next(createError(500))
      const database = client.db(dbName)
      const collection = database.collection('Usuarios')
      collection.find({}).toArray((err, docs)=>{
        if(err) return next(CreateError(500))
        res.status(200).json(docs)
      })
    })
  })

  router.get('/:username', function(req, res,next) {
    var parametro = req.params.username
   // req.params.password = crypto (req.params.password);
    mongoClient.connect(url,{ useNewUrlParser: true},(err,client)=>{
      if(err) return next(createError(500))
      const database = client.db(dbName)
      const collection = database.collection('Usuarios')
      collection.findOne({username:parametro},function(err,doc){
        if(err) return next(createError(500))
        if(doc){
          res.status(200).json(doc)
        }else{
          res.status(404).end()
        }
      })
    })
  })

  //Obtencion de las conversaciones relacionadas con el Usuario Emisor.
  router.get('/mensajes', function(req, res,next) {
    mongoClient.connect(url,{ useNewUrlParser: true},(err,client)=>{
      if(err) return next(createError(500))
      const database = client.db(dbName)
      const collection = database.collection('Conversaciones')
      collection.findOne({Emisor: req.params.Emisor, Receptor: req.params.Receptor},function(err,doc){
        if(err) return next(createError(500))
        if(doc){
          res.status(200).json(doc)
        }else{
          res.status(404).end()
        }
      })
    })
  })


  //Actualizar Conversacion 
  router.put('/mensajes', function(req, res,next) {
    mongoClient.connect(url,{ useNewUrlParser: true},(err,client)=>{
      if(err) return next(createError(500))
      const database = client.db(dbName)
      const collection = database.collection('Conversaciones')
      collection.updateOne(req.body,function(err,doc){
        if(err) return next(createError(500))
        if(doc){
          res.status(200).json(doc)
        }else{
          res.status(404).end()
        }
      })
    })
  })

  /*Para Registro de Usuarios a la Base de Datos*/
 router.post('/registro', function(req,res,next){
    mongoClient.connect(url,{ useNewUrlParser: true},(err,client)=>{
      if(err) return next(createError(500))
      const database = client.db(dbName)
      const collection = database.collection('Usuarios')
      collection.findOne({username:req.body.username, password: req.body.password},function(err,doc){
        if(err) return next(createError(500))
        if(doc){
          res.status(409).end()
        }else{
          var encrypted = Cryptojs.SHA256(req.body.Password,"SecretWord").toString();
          req.body.password = encrypted;
          collection.insertOne(req.body,err=>{
            if(err) return next(createError(500))
            const token =  TokenGeneration(req.body, "SecretWord")
            res.status(200).json(token)
          })
        }
      })
    })
  })

  /*Para Validar Correo*/
  router.post('/email', function(req,res,next){
    mongoClient.connect(url,{ useNewUrlParser: true},(err,client)=>{
      if(err) return next(createError(500))
      const database = client.db(dbName)
      const collection = database.collection('Usuarios')
      collection.findOne({email:req.body.email},function(err,doc){
        if(err) return next(createError(500))
        if(doc){
          res.status(409).end()
        }else{
          res.status(200).end();
          }
        })
    })
  })
  


var UserList = [
  {
      "id": 1,
      "name": 'Josue',
      "lastname": 'Higueros',
      "birthday": '10/12/1997',
      "phone": '34500209',
      "email":  'davidhigueros@gmail.com',
      "username": 'Josh',
      "password": 'Hola1234'
  }
]

module.exports = router;
