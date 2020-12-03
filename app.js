const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require("lodash");


const app=express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({encoded:true}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-deepak:dee1234@cluster0.un5fc.mongodb.net/todoDB", {useNewUrlParser: true , useUnifiedTopology: true});

const itemsSchema =({
  name:String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your Work Reminder"
});

const item2 = new Item ({
  name: "click the "+"+"+" button to add new tasks"
});

const item3 = new Item ({
  name: "<-- Click here to delete a task"
});

const defaultItems = [item1, item2, item3];

const listSchema = ({
  name: String,
  items : [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get('/', function(req,res){
   
  Item.find({}, function (err, docs) {
    if(docs.length==0){
      Item.insertMany(defaultItems, function(err){
          if(err){
            console.log(err);
          } else {
            console.log("Successfully inserted default array");
          }
        });
        res.redirect("/");
    }else {
      res.render("list" , { listTitle: "Today", newListItem : docs});
    }
    
  });
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items : defaultItems
        });
      
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", { listTitle: foundList.name, newListItem : foundList.items});
      }
    }
    
  });
  

});

app.post("/", function(req,res){
  let itemName = req.body.newItem;
  let listName = req.body.listItem;

  const item = new Item({
    name: itemName
  });

  if(listName == "Today"){
   item.save();
   res.redirect("/");
  } else {
    List.findOne({name : listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});




app.post("/delete", function(req,res){
  const deletedItemId = req.body.deletedItem;
  const listName = req.body.listName;

  if(listName == "Today"){
    Item.findByIdAndRemove(deletedItemId, function(err){
      if(!err){
        console.log("ALL GOOD!");
        res.redirect("/");
      };
  });

  } else {
    List.findOneAndUpdate({name: listName}, {$pull : {items: {_id: deletedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      };
    });
  };
});

let port  = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function(){
    console.log("Server has started successfully");
  
    
});