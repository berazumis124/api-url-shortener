var express = require('express');
var mongo = require('mongodb').MongoClient;
var app = express();
var bodyparser = require('body-parser');
var validUrl = require('valid-url');
var url = process.env.MONGOURL;
var resJson = {};
var PORT = process.env.PORT || 4998;

app.use(bodyparser.json());
app.use(express.static("public"));

// GET /add/* adding new URL to shorten
app.get('/add/*', function(req, res){
    resJson = {};
    var urlParam = req.params[0];
    if (validUrl.isWebUri(urlParam)) {
        mongo.connect(url, function(err, db){
        if (err) throw err;
        db.collection('shorturls').count(function(err, counter){
            if (!err) {
                db.collection('shorturls').insert({
                    urlid: counter,
                    url: urlParam
                }, function (err, data){
                    console.log(data.ops[0].urlid);
                    resJson.full_url = urlParam;
                    resJson.short_url = req.protocol + '://' + req.get('host') + '/' + data.ops[0].urlid;
                    db.close();
                    res.status(200).json(resJson);
                });    
            } 
        });            
        });    
    } else {
        resJson.error = "URL is not valid!";
        res.status(200).json(resJson);
    }       
    });

// GET /:urlid find shorten URL and redirect
app.get('/:urlid', function(req, res){
    var shorturlid = parseInt(req.params.urlid);
    mongo.connect(url, function(err, db){
        if (err) throw err;
        db.collection('shorturls').findOne({
            urlid: shorturlid
        }, function(err, result){
            if (result != null){
                res.redirect(result.url);
            } else {
                res.end("URL doesn't exist!");
            }           
            db.close();
        });
    });
});

app.listen(PORT);