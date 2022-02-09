
const args = process.argv;
const mongoUsr = args[2];
const mongoPsswrd = args[3];

var express = require('express');
var app = express();
const cors = require('cors');
app.use(cors());


var mongoose = require('mongoose');
//var mongoDB = 'mongodb://127.0.0.1:27017/test';
var mongoDB = "mongodb+srv://"+mongoUsr+':'+mongoPsswrd+"@cluster0.1lgfk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const Messagedb = require('./schemas_models/message');
const Admindb = require('./schemas_models/admin');
const Userdb = require('./schemas_models/user');

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(makeDB())
    .then(() => app.listen(8080))
    .then(console.log("connected to mongo and server listening on port 8080"));



app.get('/screen=:id', function (request, response) {

    const screen = request.params.id;

    Messagedb.find({ clientId: screen.toString() })
        .then((obj) => { response.send(obj) });
});

app.get('/checkUser=:user', (request, response) => {

    const userName = request.params.user;

    Userdb.findOne({ userName: userName })
        .then((usr) => response.send(usr));
});

app.get('/userLogIn=:usrId', (request, response) => {

    const usrId = request.params.usrId;

    Userdb.findOne({ userName: usrId })
        .then((usr) => {
            usr.connected = true;
            usr.save();
        });

    response.send(true);
});


app.get('/userLogOut=:usrId', (request, response) => {

    const usrId = request.params.usrId;

    Userdb.findOne({ userName: usrId })
        .then((usr) => {
            usr.connected = false;
            usr.save();
        });

    response.send(true);
});


app.get('/template=:id', function (request, response) {

    const template = request.params.id;


    if (template == "A") {

        response.sendFile(__dirname + "/templateHolders/templateA.html");

    } else if (template == "B") {

        response.sendFile(__dirname + "/templateHolders/templateB.html");
    }
    else if (template == "C") {

        response.sendFile(__dirname + "/templateHolders/templateC.html")

    } else {
        response.status(404).send("<div>Sorry page does not exist </div>");
    }
});



app.get('/admin', (request, response) => {
    
  response.sendFile(__dirname+ "/public/adminLogin.html")
});

app.get('/admin=:userName&:passWord', (request, response) => {

    let userName = request.params.userName;
    let passWord = request.params.passWord;

    Admindb.exists({ userName: userName.toString(), passWord: passWord.toString() }, (res, err) => {

        if (!err) {

            response.send('access denied');
        } else {
            response.sendFile(__dirname + '/public/admin.html');
        }
    });
});


app.get('/adminPassChange=:userName&:passWord&:newUser&:newPass', (request, response) => {

    let userName = request.params.userName;
    let passWord = request.params.passWord;
    let newUser = request.params.newUser;
    let newPass = request.params.newPass;

    Admindb.findOne({ userName: userName.toString(), passWord: passWord.toString() })
        .then((obj) => {

            if (obj == null) {
                response.send('user does not exist, failed to update');
                return;
            }

            obj.userName = newUser;
            obj.passWord = newPass;
            obj.save();
            response.send('user was updated');
        })
});


app.get('/updateMessage=:messageText&:messageTime&:msgID&:screenID&:newScreen', function (request, response) {

    const messageText = request.params.messageText;
    const messageTime = request.params.messageTime;
    const messageID = request.params.msgID;
    const screenID = request.params.screenID;
    const newScreen = request.params.newScreen;

    
    //delete message
    if (messageText == '0' && messageTime == '0') {

        Messagedb.findById(messageID, (err, success) => {

            success.delete();
        });

    } else {

        Messagedb.findById(messageID, (err, success) => {

            if (success) {

                success.clientId = newScreen;
                success.text = messageText.split(' ');
                success.length = messageTime;
                success.save();

            } else {
                Messagedb.create({ template: 'A', clientId: screenID.toString(), text: messageText.split(' '), length: messageTime });

            }
        });
    }
    response.send(true);
});


app.get('/getUsers', (request, response) => {

    Userdb.find({})
        .then((usrs) => response.send(usrs));
});


app.get('/adminEditUser=:Pass&:id', (request, response) => {
    const pass = request.params.Pass;
    const id = request.params.id;

    if (pass == '') {
        response.send(true);
        return;
    }
    if ( pass == '0') {
        Userdb.findById(id, (err, success) => {

            success.delete();
        });

    } else {

        Userdb.findById(id)
            .then((usr) => {
                usr.passWord = pass;
                usr.save();
            });
    }
    response.send(true);
});

app.get('/userPassWordChange=:userId&:PassWord', (request, response) => {

    const usrId = request.params.userId;
    const pssWrd = request.params.PassWord;


    if (pssWrd == '') {
        response.send('pass word has not been changed');
        return;
    }


    Userdb.findOne({userName:usrId})
        .then((usr) => {
            usr.passWord = pssWrd;
            usr.save();
        });

    response.send('pass word was updated successfully');
    return;    
});



async function makeDB() {

    await Admindb.deleteMany({});
    await Messagedb.deleteMany({});
    await Userdb.deleteMany({});

    Admindb.create({ userName: "yona", passWord: "123" });
    Admindb.create({ userName: "liraz", passWord: "123" });
    Admindb.create({ userName: "luay", passWord: "123" });

    Userdb.create({ userName: "1", passWord: "123", connected: false });
    Userdb.create({ userName: "2", passWord: "123", connected: false });
    Userdb.create({ userName: "3", passWord: "123", connected: false });


    const msgArr = require('./message.json');
    Messagedb.insertMany(msgArr);

    return;
}