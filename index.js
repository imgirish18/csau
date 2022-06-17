const express = require('express');
const Joi = require('joi');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require("fs");
const mysql = require("mysql");

var data;

fs.readFile("./csau.json", "utf-8", (err, jsonString) => {
    data = JSON.parse(jsonString);
})
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const port = 3000;

const members = [
    {name: 'Girish', regno: '2020103522', dept: 'cse', tag: 'brown', domain: 'tech', mobile: '7305077771', email: 'imgirish18@gmail.com'}
];

const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "CSAU"
})
db.connect((err) => {
    if(err) {
        throw(err);
    }
    console.log("MySQL connected");
})

app.get('/maxAge', (req, res) => {
   let obj = data.people.sort((a, b) => (a.age<b.age)?1:(a.age>b.age)?-1:0);
   let temp = obj[0];
   let maxAge = obj.filter(obj => obj.age === temp.age);
   res.send(maxAge);
})

app.get('/phoneMatch', (req, res) => {
    let arr = [];
    let obj = data.people;
    for(let i=0; i<obj.length; i++) {
        let temp = obj[i];
        if(temp.number[temp.number.length-1]==temp.number[0]) {
            arr.push(temp);
        }
    }
    res.send(arr);
})

app.post('/api/members', (req, res) => {
    const schema = {
        name: Joi.string().min(3).required(),
        regno: Joi.number().required(),
        dept: Joi.string().required(),
        tag: Joi.string().required(),
        domain: Joi.string().required(),
        mobile: Joi.string().required(),
        email: Joi.string().regex(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9]+.[a-zA-Z0-9]+$/)
        //email: Joi.string().regex(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/)
    };
    const result = Joi.validate(req.body, schema);
    if(result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }
    const member = {
        name: req.body.name,
        regno: req.body.regno,
        dept: req.body.dept,
        tag: req.body.tag,
        domain: req.body.domain,
        mobile: req.body.mobile,
        email: req.body.email
    }
    members.push(member);
    db.query('INSERT INTO Register (name, regno, dept, tag, domain, mobile, email) VALUES(?, ?, ?, ?, ?, ?, ?)', [member.name, member.regno, member.dept, member.tag, member.domain, member.mobile, member.email],
    (err, result) => {
        if(err) {
            console.log(err);
            res.send("Error");
        }
        else {
            res.send(member);
        }
    })
})

app.listen(port, ()=>console.log("App is listening at port 3000"));
