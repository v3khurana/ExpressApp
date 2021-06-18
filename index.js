const express = require('express')
const speakeasy = require('speakeasy')
const uuid = require('uuid')
const QRCode = require('qrcode')
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig')

const app = express()

app.use(express.json())

const db = new JsonDB(new Config("myDataBase", true, false, '/'));

app.get('/api',(req,res)=>{
    res.json({"message": "Welcome to 2 factor authentication example"})
})

app.post('/api/register',(req,res)=>{
    const id = uuid.v4()
    const tempSecret = speakeasy.generateSecret()
    try{
        const path = `/user/${id}`
        db.push(path, {id, tempSecret})
        res.json({id, "Secret":tempSecret.base32})
    }catch(err){
        console.log(err)
        res.json({"message":"Error generating a secret"})
    }

    res.json({"message": "Welcome to 2 factor authentication example"})
})

app.get('/users/qrcode',(req,res)=>{
    try{
        userId = req.query.userId
        console.log(userId)
        const path = `/user/${userId}`
        console.log(path)
        const user = db.getData(path)
        
        // Get the data URL of the authenticator URL
        if(user.tempSecret!=undefined){
            console.log(user.tempSecret)
            QRCode.toDataURL(user.tempSecret.otpauth_url, function(err, data_url) {
                console.log(data_url);
                // Display this data URL to the user in an <img> tag
                res.send('<img src="' + data_url + '">');
            });
        }else{
            res.json({"message":"user already registered"})
        }
    }catch(err){
        console.log(err)
    }
})

//Verify token and make secret permanent

app.post('/api/verify',(req, res)=>{
    const {token, userId} = req.body
    try{
        const path = `/user/${userId}`
        const user = db.getData(path)

        //Renaming base32 to 'secret' by "base32:secret"
        const {base32:secret} = user.tempSecret


        const verified = speakeasy.totp.verify({secret, encoding:'base32', token})
        if(verified){
            db.push(path, {id:userId, secret})
            res.json({"verified": true})
        }else{
            res.json({"verified": false})
        }
    }catch(err){
        console.log(err)
        res.json({"message":"Error finding user"})
        
    }
})

app.post('/api/validate',(req, res)=>{
    const {token, userId} = req.body
    try{
        const path = `/user/${userId}`
        const user = db.getData(path)
        const secret = user.secret
        const validated = speakeasy.totp.verify({secret, encoding:'base32', token})
        if(validated){
            res.json({"validated": true})
        }else{
            res.json({"validated": false})
        }
    }catch(err){
        console.log(err)
        res.json({"message":"Error finding user"})
        
    }
})


app.listen('4000',()=>{console.log("App running at port 4000")})