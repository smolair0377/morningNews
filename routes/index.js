var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');

var uid2 = require('uid2')
var SHA256 = require('crypto-js/sha256')
var encBase64 = require('crypto-js/enc-base64')

var userModel = require('../models/users')
var articleModel = require('../models/articles')


router.post('/sign-up', async function(req,res,next){

  var error = []
  var result = false
  var saveUser = null
  var token = null

  const data = await userModel.findOne({
    email: req.body.emailFromFront
  })

  if(data != null){
    error.push('utilisateur déjà présent')
  }

  if(req.body.usernameFromFront == ''
  || req.body.emailFromFront == ''
  || req.body.passwordFromFront == ''
  ){
    error.push('champs vides')
  }


  if(error.length == 0){

    var salt = uid2(32)
    var newUser = new userModel({
      username: req.body.usernameFromFront,
      email: req.body.emailFromFront,
      password: SHA256(req.body.passwordFromFront+salt).toString(encBase64),
      token: uid2(32),
      salt: salt,
      lang: 'fr',
    })
  
    saveUser = await newUser.save()
  
    
    if(saveUser){
      result = true
      token = saveUser.token
    }
  }
  

  res.json({result, saveUser, error, token})
})

router.post('/sign-in', async function(req,res,next){

  var result = false
  var user = null
  var error = []
  var token = null
  
  if(req.body.emailFromFront == ''
  || req.body.passwordFromFront == ''
  ){
    error.push('champs vides')
  }

  if(error.length == 0){
    const user = await userModel.findOne({
      email: req.body.emailFromFront,
    })
  
    
    if(user){
      const passwordEncrypt = SHA256(req.body.passwordFromFront + user.salt).toString(encBase64)

      if(passwordEncrypt == user.password){
        result = true
        token = user.token
      } else {
        result = false
        error.push('mot de passe incorrect')
      }
      
    } else {
      error.push('email incorrect')
    }
  }
  

  res.json({result, user, error, token})


})

router.post('/wishlist-article', async function(req, res, next){
  var result = false

  var user = await userModel.findOne({token: req.body.token})

  if(user != null){
    var userArticles = await articleModel.find({userId:user});
    console.log(userArticles)
    var filteredArticles = userArticles.filter((article)=>{
     return (article.title === req.body.name);
    });
    console.log(req.body.name)
    console.log(filteredArticles)
    if(filteredArticles.length <1){
      var newArticle = new articleModel({
        title: req.body.name,
        description: req.body.desc,
        urlToImage: req.body.img,
        content: req.body.content,
        lang: req.body.lang,
        userId: user._id,
      })
      var articleSave = await newArticle.save()
      if(articleSave.name){
        result = true
      }
    }
    else{
      result = false
    }    
  }
  res.json({result})
})

router.delete('/wishlist-article', async function(req,res,next){
  var result = false
  var user = await userModel.findOne({token: req.body.token})

  if(user != null){
    var returnDb = await articleModel.deleteOne({title: req.body.title, userId: user._id})

    if(returnDb.deletedCount == 1){
      result = true
    }
  }

  res.json({result})
})


router.get('/news', async function(req, res, next){
  var langue = req.query.language;
  var country = req.query.country;
  const data = await fetch(`https://newsapi.org/v2/sources?language=${langue}&country=${country}&apiKey=3af4856608034437b4a20325f4d35731`);
  const body = await data.json()
  var sources = body.sources;
  res.json({sources});

})

router.get('/articles', async function(req, res, next){
  var sources = req.query.sources;
  //const data = await fetch(`https://newsapi.org/v2/sources?language=${langue}&country=${country}&apiKey=3af4856608034437b4a20325f4d35731`);
  const data = await fetch(`https://newsapi.org/v2/top-headlines?sources=${sources}&apiKey=189771adbd2f40d4a27117edd90ff089`)
  const body = await data.json()
  var articles = body.articles;
  res.json({articles});

})



router.get('/wishlist-article', async function(req,res,next){
  var articles = []
  var user = await userModel.findOne({token: req.query.token})
  
  if(user != null){
    if(req.query.lang!==''){
      articles = await articleModel.find({userId:user._id, lang: req.query.lang})
    } else {
      articles = await articleModel.find({userId:user._id})
    }
    
  }

  res.json({articles})
})

router.get('/user-lang', async function(req,res,next){
  var lang = null
  var user = await userModel.findOne({token: req.query.token})

  if(user != null){
    lang = user.lang
  }

  res.json({lang})
})

router.post('/user-lang', async function(req,res,next){
  var result = false
  var user = await userModel.updateOne({token: req.body.token}, {lang:req.body.lang})

  if(user != null){
    result = true
  }

  res.json({result})
})

module.exports = router;
