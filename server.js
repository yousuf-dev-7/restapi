const express = require('express');

var bodyParser = require('body-parser')

const app = express();
const redis = require('redis');



// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }))

// // parse application/json
// app.use(bodyParser.json());

app.use(express.urlencoded({extended : true}));

const client = redis.createClient();
client.connect();

client.on('error', (error) => console.log(error))


const vehicleRouter = require('./routers/vehicles');

app.use('/vehicles', vehicleRouter);

app.post('/store',  (req, res) => {
    console.log("here");
    console.log(req.body);
    console.log(req.body.vname)
    console.log(req.body.vtype)
    console.log(req.body.vTime)

    res.status(201).send('namemme')
})

app.listen(3001, () => console.log("running in port 3001") );
