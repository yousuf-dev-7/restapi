const express = require('express');
const { route } = require('express/lib/application');
const app = express();

app.use(express.json())
const router = express.Router()

app.use(express.urlencoded({extended : true}));



const redis = require('redis')
const client = redis.createClient();
const v8 = require('v8');
client.connect();

client.on('error', function() {
    console.log('Connected!');
  });
//get all vehicles

router.get('/', (req, res) => {
res.send('Hello world')
})

// get one


router.post('/getavaliablelot' , async (req , res) => {
  console.log("Request for Lots")
  const value = await client.LLEN("LOT:"+req.body.LOT)
  const value2 = await client.exists(req.body.vnumber);
  console.log(value2)
  if(value !=null)
  {
    if(value2 == 1)
    {

      res.status(200).send("duplicate")
    }
    else if(value == 0){
      res.status(400).send("not avaliable");
    }else
    {
      const lotname = await client.rPop("LOT:"+req.body.LOT);
      res.status(201).send(lotname);
    }
      }
      else
      {
          res.status(400).send(value)
      }
    });


//initilize
let initilized = false;
router.post('/start', async (req, res) => {

if(!initilized){
  initilized = true;
  client.FLUSHALL();
  console.log("storing default values")
  let c ='A';
let lot = 'LOT:'
for(let j=0; j< 4;j++){
for(let i =1; i< req.body.capacity;i++)
{
  await client.LPUSH( lot+c, c+i ,(err, reply) => {
    if(err)
    res.status(400).send(err);
});
}
c = getNextChar(c)
}
}
res.status(400)
});

function getNextChar(char) {
  return String.fromCharCode(char.charCodeAt(0) + 1);
}

//check slot is avaliable 


router.post('/avaliable', async (req, res) => {
    console.log(req.body.LOT);

    return new Promise((resolve, reject) => {
        const val = client.LLEN(req.body.LOT, (err, reply) => {
          if(err) {
            reject(err);
          } else {
            resolve(reply);
          }
        });
      });
})



//create


router.post('/store', async (req, res) => {
    await client.hSet(req.body.vnumber ,{ 'VehicleNumber' : req.body.vnumber ,
     'VehicleType' : req.body.vtype, 
     'CheckIN' : req.body.vTime,
     'LotAlloted' : req.body.LotAlloted}, (err, reply) => {
         if(err)
         res.status(400).send(err);
         else
         res.status(201).send(reply);
     });
 })



//delete

router.post('/delete', async (req, res) => {

  const value = await client.del(req.body.vnumber)
  const isattached = await client.rPush("LOT:"+req.body.LOT.charAt(0) , req.body.LOT)
  console.log(value)
  if(value !=null)
  {
    
      res.status(201).send(value);
   
      }
      else
      {
          res.status(400).send(value)
      }
    });

//getvehicle



router.post('/checkout' , async (req , res) => {
  console.log(req.body)
  let result = await client.hGetAll(req.body.vnumber)
  if(result !=null)
  {
    console.log(result);
    // add the available lot to list
    client.LPUSH("LOT:"+result.LotAlloted.charAt(0), result.LotAlloted);
    // delete the vehicle from database
    client.del(req.body.vnumber);

    res.status(201).send(result)
  }
    });

    //find

    router.post('/find' , async (req , res) => {
      let result = await client.hGetAll(req.body.vnumber)
      if(Object.keys(result).length)
      {
        res.status(201).send(result)
      }
      else
      {
        res.status(400).send(result);
      }
        });

    //store history
    
    router.post('/storehistory' , async (req , res) => {
      console.log(req.body)
      let data = {
        "VehicleNumber" : req.body.vnumber,
        "CheckIN" : req.body.CheckIN,
        "CheckOUT" : req.body.CheckOUT,
        "FLOOR" : req.body.FLOOR,
        "Date": req.body.DATE
      }
      let jsondata = JSON.stringify(data)

      console.log("jsondata")
      console.log(jsondata);
      
      let result = await client.LPUSH("history" , jsondata)
      if(Object.keys(result).length)
      {
        res.status(201)
      }
      else
      {
        res.status(400)
      }
        });

    // get history

    router.get('/gethistory' , async (req , res) => {
      console.log(req.body)
      
      let result = await client.LRANGE("history" , "0" , "-1")
      
      let list = result;
    

      if(Object.keys(result).length)
      {
        res.status(201).send(result)
      }
      else
      {
        res.status(400)
      }
        });

      //get capacity 
      router.get('/getcapacity' , async (req , res) => {
        let c = 'A';
         let array = [];
         for(let i=1 ; i < 5; i++)
         {
          let result = await client.LLEN("LOT:"+c)
          array.push(result);
          c = getNextChar(c);
         }
          
          res.status(201).send(array)
      
          });
          
          //checkduplicate

          router.post('/exits' , async (req , res) => {
            console.log(req.body)
            console.log("In exits")
            let value = await client.exists(req.body.vnumber);
            console.log(value)
              if(value === 0)
              res.status(201).send("0")
              else
              res.status(400).send("1");
          
              });
              

module.exports = router;