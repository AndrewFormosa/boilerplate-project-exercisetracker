const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


//MY CODE BELLOW

// Setup mongodb Database parameters
let mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const username_schema = new mongoose.Schema({
  username: {
    type: String,
  },
  log:[
    { description:String,
      duration:Number,
      date:String
    }
  ]
});

let person = mongoose.model('username', username_schema);


//post & create new users
const create_user = (user,done)=>{
  let newUser = new person({username:user});
  newUser.save().then(
   res=> done(null,res),
  ).catch(
   err =>console.log(err)
  );
}

const bodyParser = require("body-parser");
app.use("/api/users",bodyParser.urlencoded({extended: false}));
app.route('/api/users').post((req,res)=>{
 user=req.body.username;
 create_user(user,function(err,data){
  res.json({"username":data.username, "_id":data._id});
 })
});

//get all users
const get_all_users=(done)=>{
  person.find({}).select('username _id').then(
    res=>done(null,res)
  ).catch(
    err=>console.log(err)
  );
}

app.get('/api/users',(req,res)=>{
  get_all_users(function(err,data){
    res.send(data)
  })
  }
);

//post & create excercise logs

const dateString=(dateInput)=>{
  var dateObject;
  if(dateInput==null||dateInput==""){
    dateObject=new Date();
  }else{
    dateObject=new Date(dateInput);
  }
  return dateObject.toDateString();
}

const add_exercises=(exercises,done)=>{
  const exerciseToAdd={description:exercises.description,duration:exercises.duration,date:exercises.date};
  person.findById(exercises._id).then(
    res=>{
      res.log.push(exerciseToAdd);
      res.save().then(
        resp=>{
        response={username:res.username,description:exerciseToAdd.description,duration:exerciseToAdd.duration,date:exerciseToAdd.date,_id:res._id}
        done(null,response)
      }
      )
    }
  ).catch(
    err=>console.log(err)
  );
}

app.use("/api/users/:_id/exercises",bodyParser.urlencoded({extended: false}));
app.route('/api/users/:_id/exercises').post((req,res)=>{
  var _id=req.params._id; 
  var _id=req.params._id;
  var date=dateString(req.body.date);
  var duration = req.body.duration;
  var description = req.body.description;
  exerciseData={_id:_id, description:description, duration:Number(duration),date:date};
 add_exercises(exerciseData,function(err,data){
  res.send(data);
 })
});

//get exercise log of user
const get_log_data=(_id,query,done)=>{

  //find the userdata from the _id parameter
  person.findById(_id)
  .select('-log._id')
  .then(res=>{
   console.log(res);
   console.log(res.log);

   //filter logs within dates, slice the array to the limited size
     //magae query data using query parameter
  var startDate=new Date(1900-01-01);
  var endDate=new Date();
  var limit=res.log.length;
  if(query.to!=null){endDate=new Date(query.to)}
  if(query.from!=null){startDate=new Date( new Date(query.from).getTime()-(24*60*60*1000) )}//subract 1 day from the date.
  if(query.limit!=null){limit=query.limit}

  //create a new log array based on the filtered data
   var newLog = res.log.filter(function(data){
      var logDate = new Date(data.date);
      return (logDate>startDate&&logDate<=endDate);
   }).slice(0,limit);

   //create response object and send back with the done call back parameter.
    var response={username:res.username,count:res.log.length,_id:_id,log:newLog};  
    done(null,response);
  })
  .catch(err=>{console.log(err)});
}

app.get('/api/users/:_id/logs',(req,res)=>{
  get_log_data(req.params._id,req.query,function(err,data){
    res.send(data)
  })
  }
);




// MY CODE ABOVE

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
