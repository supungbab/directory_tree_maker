const express = require('express');
const bodyParser = require('body-parser');
//const mongoose= require('mongoose');
const crawling = require('./api/crawling/index');
//const { MongoClient } = require('mongodb')
const secondModel = require('./models/secondModel');
//https://github.com/arunlalkp/mongo-client 확인
const blu = require('balaan_utils');

const app  = express();
const port = 3000;

// https://attacomsian.com/blog/mongoose-connect-async-await 참조

/* const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open',()=>{
    console.log("mongo db connection OK.");
}); */

app.use(bodyParser.json());

app.use('/crawling',crawling);


//const url = "mongodb://localhost:27017";
const dbName = 'goods_dev';
 
/* MongoClient.connect(url, (err, client) => {
    // ... start the server
    if (err) return console.log(err)
    
    const db = client.db(dbName)
    db2.state.db = db;
    console.log("몽고몽고 연결연결~")
    app.listen(process.env.PORT || 3000, () => {
        console.log('listening on 3000')
    })
}) */

app.listen(port, async ()=>{
    const connectDB = async ()=>{
        try{
            /* const test = await mongoose.connect(`${url}/${dbName}`);
            //await mongoose.connect('mongodb://mdb.balaan.io:27017/goods_dev');
            console.log(test);
            //console.log(test.Collection('mapped')) */

            const {SECOND} = blu.mongo;
            await SECOND;
            const {second} = blu.mongo;

            console.log('몽고~몽고~~~');
            return second;
            
        }catch(err){
            console.log('Failed to connect to MongoDB', err);
        }
    }
    
    secondModel.state.db = await connectDB();
    
    //db.state.goods_dev.mapped.insertOne({a:1,b:2});
    // const url = "mongodb://localhost:27018";
    // const connectDB2 = async () => {
    //     try{

    //         const client = await MongoClient.connect(url);
    //         const dbName = 'goods_dev'
    //         console.log(client.db(dbName));
    //         /* MongoClient.connect(url, {useNewUrlParser: true} , (err, client)=> {
    //             let dbName = 'goods_dev'
    //             Store Database to state.db variable so we can return that variable with get() method.
    //             client.db(dbName);
    //             console.log('몽고몽고~~~');
    //         }) */
    //         /* await db2.connect('mongodb://localhost:27017', (err)=> {
    //             if (err) {
    //                 console.log(err);
    //                 process.exit(1)
    //             }
    //             console.log('몽고몽고~~~');
    //         }) */
    //         await db2.connect(url);
    //         console.log('몽고몽고~~~');
    //     }catch(err){
    //         console.log('Failed to connect to MongoDB', err);
    //     }
    // }
    // const test = await connectDB2();

    // await connectDB2();

    console.log("Test Server");
})