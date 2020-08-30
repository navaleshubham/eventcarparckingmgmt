require('dotenv').config()
const express = require('express')
bodyParser = require('body-parser')
cors = require('cors')
const app = express()
app.use(express.json())
app.use(bodyParser.json())
app.use(cors());
var Parkloc = require('./modal/parkingloc')
var cureent = require('./modal/logs')
const MongoClient = require('mongodb').MongoClient
var moongose = require('mongoose')
const { Cursor } = require('mongodb')
var uri = process.env.uri;

async function connectdb() {
  await moongose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true })
  console.log('connected')
}
connectdb()
var cl;
MongoClient.connect(uri, { useUnifiedTopology: true }, async function (err, client) {
  if (err) {
    console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
  }
  else {
    console.log('Connected...')
    cl = client
    //  var cl2 = client.db('r2it').collection('plogs').createIndex({name:"text",car_no:'text',mob_no:"text"})
  }
});
function rand(max) {
  let randomNum = Math.random() * (max - 1) + 1;
  return Math.round(randomNum);
}
app.get('/reset', (req, res) => {
  cl.db('r2it').collection('parkinglocs').deleteMany().then((err, result) => {
    console.log(err, result)
  })
  var locs = []
  for (let i = 1; i < 1000; i++) {
    doc = {}
    doc.id = parseInt(i)
    doc.isempty = true
    locs.push(doc)
  }
  cl.db('r2it').collection('parkinglocs').insertMany(locs).then((err, result) => {
    console.log(err, result)
    console.log('intialized')
    return res.send('hello')
  })

})

app.post('/in', (req, res) => {
  var name = req.body.name
  var in_time = Date()
  var mob_no = req.body.mob_no
  var car_no = req.body.car_no
  var isparked = true
  var i;
  var pipeline = [{
    $match: {
      isempty: true
    }
  }, {
    $project: {
      _id: 0,
      id: 1
    }
  }]
  Parkloc.aggregate(pipeline, (err, result) => {
    i = rand(result.length)
    park_loc = result[i].id
    var doc = { name, in_time, mob_no, car_no, isparked, park_loc }
    // console.log(doc)
    var newcar = new cureent(doc)
    newcar.save(( err,result) => {
      if(err){
        // console.log(err)
        return res.send('please check the car number')
      }
      else if(result.name!='MongoError'){
        // console.log(result)
        Parkloc.updateOne({ id: park_loc }, { $set: { isempty:false } }, { upsert: true }).then((resul, err) => {
          console.log(err,resul)
          if (err) {
            // console.log(err)
            return res.send(err)
          }
          // console.log(resul)
          if (resul) { return res.send(result) }
        })
      }
      else{
        res.send('please check the car number')
      }
      
    })

  })




})
app.get('/out/:locid', (req, res) => {
  var park_loc = parseInt(req.params.locid)
  var out_time = Date()
  var isparked = false
  var doc = { park_loc, out_time, isparked }
  cureent.updateOne({ 'park_loc': park_loc }, { $set: doc }, { upsert: true }).then((result, err) => {
    if (err) {
      console.log(err)
      return res.send(403)
    }
    if (result) {

      Parkloc.updateOne({ id: park_loc }, { $set: { isempty: true } }, { upsert: true }).then((result, err) => {
        if (err) {
          console.log(err)
          return res.send(403)
        }
        // console.log(result)
        if (result) { return res.send(true) }
      })
    }
    else{
      res.send('please try again later')
    }
  })

})
app.get('/find/:que',(req,res)=>{
  var quer=req.params.que
    cureent.find({$and:[{ $text: { $search:quer, $caseSensitive: false}},{isparked:true}]}).then((result,err)=>{
      console.log(err,result)
      res.send(result)
    })
})
app.get('/lists',(req,res)=>{
    cureent.find().then((result,err)=>{
      // console.log(err,result)
      res.send(result)
    })
})
// Server running on http://0.0.0.0:4000
const port = process.env.PORT || 4000;
const server = app.listen(port, function () {
  console.log('Listening on port ' + port);
});
// when someone parked a car, storing their name. mobile number and car's number. It should be able to mark event when someone unparked and the spot got empty.

// It should be able to search by name or car's number (even if the input is incomplete, it should return all matching entries).

// It should store the timestamp automatically when someone parked a car or when someone unparked a car.