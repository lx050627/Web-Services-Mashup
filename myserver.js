var express = require('express');
var app = express();
var fs = require('fs');
var request = require('request');
var querystring= require('querystring');
var bodyParser = require('body-parser'); 
var MongoClient=require('mongodb').MongoClient;
var STR='mongodb://localhost:27017/';
var watson = require('watson-developer-cloud');

//var urlencodedParser = bodyParser.urlencoded({ extended: false });
var urlencodedParser=bodyParser.json();
app.use(express.static('public'));
//app.use(bodyParser.json());
var auth="?username=lx050627;api_key=ac999bc3fe0299f1bfa25f39bc5d16ffd177cae1";
  
app.get('/getresource', function (req, res) 
{
  var rid=req.query.resourceid;
  var rtype=req.query.type;
  console.log("id:"+rid);
  var myurl="https://bigml.io/dev/"+rtype+"/"+rid+auth;
  console.log("url:"+myurl);
  request.get(myurl).pipe(res);
})

app.post('/upload', function (req, res) 
{
  var myurl="https://bigml.io/dev/source"+auth;
  console.log("url:"+myurl);
  req.pipe(request.post(myurl)).pipe(res);
})

app.post('/create', function (req, res) 
{
  var rtype=req.query.type;
  var myurl="https://bigml.io/dev/"+rtype+auth;
  console.log("url:"+myurl);
  var options={
  	url:myurl,
  	'content-type':"application/json"
  };
  req.pipe(request.post(options)).pipe(res);
})

app.get('/deleteresource', function (req, res) 
{
  var rid=req.query.resourceid;
  var rtype=req.query.type;
  var myurl="https://bigml.io/dev/"+rtype+"/"+rid+auth;
  console.log("url:"+myurl);
  request.delete(myurl).pipe(res);
})

app.put('/update', function (req, res) 
{
  var rid=req.query.resourceid;
  var rtype=req.query.type;
  var myurl="https://bigml.io/dev/"+rtype+"/"+rid+auth;
  console.log("url:"+myurl);
  req.pipe(request.put(myurl)).pipe(res);
})

app.post('/pic?', function (req,res) 
{
  var myurl="https://westus.api.cognitive.microsoft.com/vision/v1.0/analyze?"+querystring.stringify(req.query);
  console.log("url:"+myurl);
  req.pipe(request.post(myurl)).pipe(res);
})

app.post('/getkey',function(req, res) 
{
  var username=req.query.username;
  console.log(username);
  MongoClient.connect(STR,function(err,db)
   {
    var myDB=db.db("web");
    myDB.collection("mashup",function(err,collection)
    {
      var doc={"username":username};
      collection.insert(doc,function(err,results)    
      {
        if(err)
        {
           res.send("This username is duplicate.Please try another one:)");
        }
        else
        {
           console.log(results);   
           res.json(results.insertedIds[0]);
           res.status(200);
        }
        res.end();
        myDB.close();
      })  
    })
   })
})

app.post('/authenticate',urlencodedParser,function(req, res) 
{
  var username=req.body.username;
  var password=req.body.password;
  console.log(username+" "+password);
   MongoClient.connect(STR,function(err,db)
   {
    var myDB=db.db("web");
    myDB.collection("mashup",function(err,collection)
    {
       getOne(collection,username,function(da) 
       { 
        console.log(da[0]._id);
        console.log(password);
        console.log(da[0]._id==password);
        if(da.length==0)
        {
            res.json("This username does not exist.");
            res.status(200);
            console.log("This username does not exist.");
            res.end();
        }

        else if(!(da[0]._id==password))
        {
           res.json("This password does not match your username.");
           console.log("This password does not match your username.");
           res.end();
        }

        else
        {
           res.json("OK");
           console.log("Log in successfully.");
           res.end();
        }
        myDB.close();
       });      
    })
   })
})


app.post('/text',urlencodedParser,function (req, res) 
{
 var alchemy_language = watson.alchemy_language({
  api_key:'145a3492287bb42ef1ac67e8a7a5d0c65ff63cfa'
})
//console.log(JSON.stringify(req.body));
 var parameters = {
  text:req.body.text
};
console.log(req.body.text);
alchemy_language.emotion(parameters, function (err, response) {
  if (err)
    console.log('error:', err);
  else{
   res.json(response);
   console.log(response);
   res.end();
  }
}); 
})

function getOne(collection,user,callback)
{
  var query={"username":user};
 // console.log(query);
  var cursor=collection.find(query);
  cursor.toArray().then(function(da){
    callback(da);
  })
}

var server = app.listen(8081, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("The address is http://%s:%s", host, port)
})