const express = require('express')
const {UserModel,TodoModel} = require('./db')
const app = express()
app.use(express.json())
app.post("/signUp", async function(req, res){

const email = req.body.email
const password = req.body.password
const name = req.body.name

await UserModel.insert({
    email: email,
    password: password,
    name: name,
  
})

    res.json({
      message: "SignUp successful",
      email: email,
      password: password,
      name: name,
    });
})

app.post("/signUp", function(req, res){
    res.json({message:"This is SignUp route"})
})

app.post("/signIn", function (req, res) {
  res.json({ message: "This is SignIn route" });
});

app.post("/todo", function (req, res) {
  res.json({ message: "This is Todo route" });
});

app.get("/todos", function (req, res) {
  res.json({ message: "This is SignUp route" });
});


app.listen(3000);


