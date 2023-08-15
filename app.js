import express from "express"; 
// "type": "module" needed to be added in the package.json file to use import statement
import bodyParser from "body-parser";
import ejs from "ejs";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import alert from "alert";
import multer from "multer";
import path from "path";


const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
mongoose.connect("mongodb://127.0.0.1:27017/registerDB", { useNewUrlParser: true }).then(
    ()=> console.log("DB connected")
);


const storage = multer.diskStorage({
    destination : (req,file,cb)=>{
        cb(null,"./public/")
    },
    filename : (req,file,cb)=>{
        cb(null,file.originalname)
    }

});
let speakerName,aboutEvent,EventBanner,speakerImage ;

const upload = multer({storage:storage});
app.post("/speakerRegistration",upload.fields([{name:'speakerImage',maxCount:1},{name:'eventBanner',maxCount:1}]),async function(req,res){
    let currDate = new Date().toISOString().split('T')[0]
    let currTime = new Date().toLocaleTimeString('en-gb').substring(0,5);
    //console.log(req.files.speakerImage[0].filename);
    //console.log(req.files.eventBanner[0].filename);
    speakerName = req.body.speakerName;
    aboutEvent = req.body.aboutEvent;
    speakerImage = req.files.speakerImage[0].filename;
    EventBanner = req.files.eventBanner[0].filename;
    res.render("registerEvent",{admin:"ADMIN LOGOUT",presentDate:currDate,presentTime:currTime,register:"",log:"LOGOUT"});
    // res.render("innerEventPage",{speakerName:speakerName,aboutEvent:aboutEvent,speakerImage:speakerImage,EventBanner:EventBanner})
})
let presentEventName;
let pastEventName;
let pastDates;
let presentDates;
let presentImages;
let pastImages;
let presentTimes;
let pastTimes;
let eventName,eventDate,eventTime;
let key_points;

const eventDetailsSchema = new mongoose.Schema({
    presentEventName:{
        type:String,
        default: '',
        unique:true
    },pastEventName :{
        type:String,
        default: '',
        unique:true
    },presentDates:{
        type:String,
        default: '',
        unique:true
    
    },pastDates:{
        type:String,
        default: '',
        unique:true
        
    },presentTimes:{
        type:String,
        default: '',
        unique:true
        
    },pastTimes:{
        type:String,
        default: '',
        unique:true
        
    },presentImages:{
        type:String,
        default: '',
        unique:true
        
    },pastImages:{
        type:String,
        default: '',
        unique:true
        
    }
})
const eventDetail = mongoose.model("eventDetail",eventDetailsSchema);

app.post("/registerForm",upload.single('image'),async function(req,res){
   try{
    var date = req.body.date;
    var date1 = new Date();
    var currYear = new Date().toISOString().slice(0, 4);
    var currMonth = new Date().toISOString().slice(5,7);
    var currDay = new Date().toISOString().slice(8,10);
    var hours = date1.getHours();
    eventDate = req.body.date;
    eventTime = req.body.time;
    var minutes = date1.getMinutes();
    eventName = req.body.eventName;
    key_points = req.body.keyPoints;
    if(date.substring(0,4)>currYear || (date.substring(0,4)==currYear && date.substring(5,7)>currMonth) || (date.substring(0,4)==currYear && date.substring(5,7)==currMonth && date.substring(8,10)>currDay) || (date.substring(0,4)==currYear && date.substring(5,7)==currMonth && date.substring(8,10)==currDay && hours<time.substring(0,2)) || (date.substring(0,4)==currYear && date.substring(5,7)==currMonth && date.substring(8,10)==currDay && hours==time.substring(0,2) && minutes<time.substring(3,5))){ 
        presentDates = req.body.date;
        presentEventName = req.body.eventName;
        presentImages = req.file.filename;
        presentTimes = req.body.time;
        let neweventDetail = new eventDetail({
            presentEventName,presentDates,presentTimes,presentImages
        })
        neweventDetail.save();
    }else{
        pastDates = req.body.date;
        pastEventName = req.body.eventName;
        pastImages = req.file.filename;
        pastTimes = req.body.time;
        let neweventDetail = new eventDetail({
            pastEventName,pastDates,pastTimes,pastImages
        })
        neweventDetail.save();
    }
    // const exist = await eventDetail.findOne({eventName});
    eventDetail.find({}).then((data) =>{   
        console.log(data);
        res.render("home",{admin:"ADMIN LOGOUT",message:'',log:"LOGOUT",register:"",data:data});
    })
}
   catch(err){
    console.log(err);
   }
   
    // presentDates.sort();
    // pastDates.sort();

    
  
})
const UsersSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },email:{
        type:String,
        required:true
    },password:{
        type:String,
        required:true
    },confirmPassword:{
        type:String,
        required:true
    }
})
const user = mongoose.model("user",UsersSchema);

const eventRegistersSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },email:{
        type:String,
        required:true,
        unique:true
    },password:{
        type:String,
        required:true,
        unique:true
    },eventName:{
        type:String
    }
})
const eventRegister = mongoose.model("eventRegister",eventRegistersSchema);

let startingHeading ="Key-Points Of The Events";

app.get("/",function(req,res){
    eventDetail.find({}).then((data) =>{   
        console.log(data);
        res.render("home",{admin:"ADMIN LOGIN",message:'',log:"LOGIN",register:"REGISTER",data:data});
    })
})
app.get("/home",function(req,res){
    eventDetail.find({}).then((data) =>{   
        console.log(data);
        res.render("home",{admin:"ADMIN LOGIN",message:'',log:"LOGIN",register:"REGISTER",data:data});
    })
})
app.get("/contact", function(req,res) {
    res.render("contact");
})
app.get("/register",function(req,res){
    res.render("register",{admin:"ADMIN LOGIN",message1:'',message2:'',message3:''});
})
let message;

app.post("/register",async function(req,res){
    try{
        const {username,email,password,confirmPassword} = req.body;
        const exist = await user.findOne({email});
        if(exist){
            eventDetail.find({}).then((data) =>{   
                console.log(data);
                res.render("home",{admin:"ADMIN LOGOUT",message:"USER REGISTERED ALREADY!!!",log:"LOGIN",register:"",data:data});
            })
        }
        if(password!=confirmPassword){
            res.render("register",{admin:"ADMIN LOGIN",message1:'',message2:'',message3:"Password Not Matched!!"});

        }
        let newUser = new user({
            username,email,password,confirmPassword
        })
        
        if(!exist){
            newUser.save();
            eventDetail.find({}).then((data) =>{   
                console.log(data);
                res.render("home",{admin:"ADMIN LOGIN",message:"USER REGISTERED SUCCESSFULLY!!!",log:"LOGIN",register:"",data:data});
            })
        }
    }
    catch(err){
        console.log(err);
        res.render("register",{admin:"ADMIN LOGIN",message1:'',message2:'',message3:"Server Error"});

    }
    
})
app.get("/login",function(req,res){
    res.render("login",{message1:'',message2:'',message3:''});
})
app.post("/login",async(req,res)=>{
    try{
        const {email,password} = req.body;
        const exist = await user.findOne({email});
        if(!exist){
            res.render("login",{message1:'',message2:'',message3:"User Doesn't Exist"});
        }
        if(exist.password != password){
            res.render("login",{message1:'',message2:'',message3:"Invalid Password!!!"});
            
        }
        else{
            eventDetail.find({}).then((data) =>{   
                console.log(data);
                res.render("home",{admin:"ADMIN LOGIN",message:"USER LOGGED IN SUCCESSFULLY!!!",log:"LOGOUT",register:"",data:data});
            })
    }

    }catch(err){
        console.log(err);
        res.render("login",{message1:'',message2:'',message3:"Server Error"});

    }
})

app.get("/adminlogin",function(req,res){
    res.render("adminLogin");
})
app.get("/registerEvent",function(req,res){
    res.render("speakerRegister",{admin:"ADMIN LOGOUT",register:"",log:"LOGOUT"});
})
app.post("/adminLogin",function(req,res){
    var adminName = req.body.adminname;
    var password = req.body.password;
    if(adminName == "kalyani" && password=="kalyani@179"){
        res.render("adminOptions",{register:"",log:"LOGOUT",admin:"ADMIN LOGOUT"})
        // res.render("speakerRegister",{register:"",log:"LOGOUT"});
        // res.render("registerEvent",{register:"",log:"LOGOUT"});
    }
    else{
        return res.status(400).send("Invalid AdminLogin!!!");
    }
})

app.get("/innerEventPage",function(req,res){
    res.render("innerEventPage",{message:"",register:"Register",key_points:key_points,eventDate:eventDate,eventTime:eventTime,eventName:eventName,speakerName:speakerName,aboutEvent:aboutEvent,speakerImage:speakerImage,EventBanner:EventBanner});
})
app.post("/registerUserToEvent",async function(req,res){
    try{
        const {username,email,password} = req.body;
        const exist = await eventRegister.findOne({email});

        
            let newEventRegister = new eventRegister({
                username,email,password,eventName
            })
            newEventRegister.save();
            res.render("innerEventPage",{message:"USER REGISTERED TO THE EVENT SUCCESSFULLY!!!",register:"Cancel Registration",key_points:key_points,eventDate:eventDate,eventTime:eventTime,eventName:eventName,speakerName:speakerName,aboutEvent:aboutEvent,speakerImage:speakerImage,EventBanner:EventBanner});  
}
        
    catch(err){
        console.log(err);
        res.render("innerEventPage",{message:"SERVER ERROR!!",register:"Register",key_points:key_points,eventDate:eventDate,eventTime:eventTime,eventName:eventName,speakerName:speakerName,aboutEvent:aboutEvent,speakerImage:speakerImage,EventBanner:EventBanner});     }

})
app.get("/showRegisters",function(req,res){
    eventRegister.find({}).then((data) =>{   
        console.log(data);
        res.render("registered_users",{data:data});
    })
   
})
// app.get("/innerEventRegisterButton",function(req,res){
//     res.render("innerEventPage",{register:"Registered"});
// })

app.listen(3000,function(){
    console.log("The app is running on port 3000");
})
// app.post("/query-mail", (req, res) => {
//     const userName = req.body.userName;
//     const email = req.body.email;
//     const query = req.body.query;

//     let transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: "dantulurikalyani999@gmail.com",
//             pass: "ihmwfquaqzrjnhtq"
//         }
//     });
//     var mailOptions = {
//         from: email,
//         replyTo: email,
//         to: "dantulurikalyani999@gmail.com",
//         subject: userName + " sent you a message",
//         text: query
//     }
//     transporter.sendMail(mailOptions, function(err, info) {
//         res.redirect("/contact");
//     })

// });

