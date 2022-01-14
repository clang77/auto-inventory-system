//Phase I (LA 13) - Intro CRM Setup

//Set up Database Libraries

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://data_user:Lang2310@cluster0.bzv49.mongodb.net/autoinventorydb?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("auto").collection("vehicles");
  // perform actions on the collection object
  client.close();
});


//Set up more libraries and Middleware - Introducing Express here
let express = require('express') //express is a web framework, https://expressjs.com
let app = express()
let bodyParser = require('body-parser') //this is the middleware
let http = require('http').Server(app)

//Middleware setup
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))
app.set('views', '.');
app.set('view engine', 'pug') //Reference to PUG file

//Create link to index.html file
app.get('/', function(req, res) {
  res.sendFile('/index.html', {root:'.'})
})

//Load get.html function
app.get('/get', function (req, res) {
  res.sendFile('/get.html', {root:'.'});
});

//Reference record function (referenced within get.html file)
app.get('/get-client', function (req, res){
  client.connect(err => {
    client.db("autoinventorydb").collection("vehicles").findOne({vin: req.query.vin}, function(err, result) {      //crmdb
      if (err) throw err;
      res.render('update', {oldmanu: result.manu, oldmodel: result.model, oldyear: result.year, oldvin: result.vin, oldpurchase: result.purchase, manu: result.manu, model: result.model, year: result.year, vin: result.vin, purchase: result.purchase});
    });
  });
});

//Load create.html function
app.get('/create', function (req, res) {
  res.sendFile('/create.html', {root:'.'});
});

//Reference create function (referenced within create.html)
app.post('/create', function(req, res, next) {
  client.connect(err => {
    const customers = client.db("autoinventorydb").collection("vehicles"); 

    let customer = { manu: req.body.manu, model: req.body.model, year: req.body.year, vin: req.body.vin, purchase: req.body.purchase};
    customers.insertOne(customer, function(err, res) {
      if (err) throw err;
      console.log("1 vehicle inserted");
    });
  })
  res.send(`Vehicle ${req.body.vin} Created`);
})

//Reference update function (referenced within update.pug template)
app.post('/update', function(req, res) {
  client.connect(err => {
    if (err) throw err;
    let query = { manu: req.body.oldmanu, model: req.body.oldmodel, year: req.body.oldyear, vin: req.body.oldvin, purchase: req.body.oldpurchase };
    let newvalues = { $set: {manu: req.body.manu, model: req.body.model, year: req.body.year, vin: req.body.vin, purchase: req.body.purchase } };
    client.db("autoinventorydb").collection("vehicles").updateOne(query, newvalues, function(err, res) {       
      if (err) throw err;
      console.log("1 document updated");
    });
  });
  res.send(`Vehicle ${req.body.vin} Updated`);
})

//Reference delete function (referenced within update.pug template)
app.post('/delete', function(req, res) {
  client.connect(err => {
    if (err) throw err;
    let query = {manu: req.body.manu, model: req.body.model ? req.body.model : null, year: req.body.year ? req.body.year : null, vin: req.body.vin ? req.body.vin : null, price: req.body.price ? req.body.price: null};
    client.db("autoinventorydb").collection("vehicles").deleteOne(query, function(err, obj) {         
      if (err) throw err;
      console.log("1 document deleted");
      res.send(`Vehicle ${req.body.vin} Deleted`);
    });
  });
})


//Spin up the webapp on port 5000
app.set('port', process.env.PORT || 5000)
http.listen(app.get('port'), function() {
  console.log('listening on port', app.get('port'))
})

