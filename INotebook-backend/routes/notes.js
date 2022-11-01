const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const User = require('../models/Notes');

//ROUTE:1 Get all the Notes using GET "/api/notes/fetchallnotes" . login required
router.get('/fetchallnotes',fetchuser,async (req,res)=>{
    try{
    const notes = await Notes.find({user: req.user.id})
    res.json(notes)
    }
    catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Occured");
    }
})

//ROUTE:2 Add a new Notes using:POST "/api/notes/addnewnotes" . login required
router.post('/addnewnotes',fetchuser,[
    body('title','Enter a valid Title minimum 3 letters').isLength({ min: 3 }),
    body('description','Enter a valid Description minimum contain 5 letters').isLength({ min: 5 }),
],async (req,res)=>{

    try{
    const {title,description,tag,} = req.body;
    // If there are error return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const note = new Notes({
        title,description,tag,user : req.user.id
    })
    const savedNote = await note.save();
    res.json(savedNote)
    }
    catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Occured");
    }
    
})

//ROUTE:3 Update Notes using:PUT "/api/notes/updatenote/id" . login required

router.put('/updatenote/:id',fetchuser,async (req,res)=>{

    try{
    const {title,description,tag} = req.body;
    
    //Create newNote object
    const newNote = {};
    if(title){newNote.title = title};
    if(description){newNote.description = description};
    if(tag){newNote.tag = tag};

    // cheack if Note is there and No other person is updating some other Note
    let note = await Notes.findById(req.params.id);
    if(!note){
        return res.status(404).send('Not Found')
    }
    if(note.user.toString() !== req.user.id){
        return res.status(401).send('Not Allowed')
    }

    //Find the node to be updated and update  it
    note = await Notes.findByIdAndUpdate(req.params.id,{$set: newNote}, {new:true});

    res.json({note})
    }
    catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Occured");
    }
})

//ROUTE:4 Delete Notes using:DELETE "/api/notes/deletenote/id" . login required

router.delete('/deletenote/:id',fetchuser,async (req,res)=>{

    try{
        const {title,description,tag} = req.body;
        
        // cheack if Note is there and No other person is updating some other Note
        let note = await Notes.findById(req.params.id);
        if(!note){
            return res.status(404).send('Not Found')
        }
        //Allow the user who only own the node
        if(note.user.toString() !== req.user.id){
            return res.status(401).send('Not Allowed')
        }
    
        //Find the node to be Deleted and delete  it
        note = await Notes.findByIdAndDelete(req.params.id);
    
        res.json({"Success":"Note has been deleted",note:note.title});
        }
        catch(error){
            console.error(error.message);
            res.status(500).send("Internal Server Occured");
        }

})

module.exports = router