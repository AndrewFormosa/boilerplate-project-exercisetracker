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


let mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const username_schema = new mongoose.Schema({
  username: {
    type: String,
  }
});



let person = mongoose.model('username', username_schema);

const create_user = (user,done)=>{
  let newUser = new person({username:user});
  newUser.save().then(
   res=> done(null,res),
  ).catch(
   err =>console.log(err)
  );
}

const get_all_users=(done)=>{
  person.find({}).select('username _id').then(
    res=>done(null,res)
  ).catch(
    err=>console.log(err)
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

app.get('/api/users',(req,res)=>{
  get_all_users(function(err,data){
    console.log(data)
    res.send(data)
  })
  }
);






// MY CODE ABOVE

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
