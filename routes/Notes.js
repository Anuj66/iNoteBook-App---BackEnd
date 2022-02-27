const express = require("express");
const fetchUser = require('../middleware/FetchUser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');


const router = express.Router();


//Route to Fetch all Notes
router.get('/fetchAllNotes',fetchUser ,async (req,res) => {
    try{
        const notes = await Notes.find({user: req.user.id})
        res.json(notes)
    }catch(error){
        return res.status(500).send('Internal Server Error')
    }
})


//Route to Add a Note
router.post('/addNote', fetchUser, [
    body('title', 'Please enter the Title').isLength({min: 3}),
    body('description', 'Please enter some description').isLength({min: 5})
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        const note = new Notes({
            title: req.body.title,
            description: req.body.description,
            tags: req.body.tags,
            user: req.user.id
        })
        const savedNote = await note.save()

        return res.status(200).json(savedNote)
    }catch(error){
        return res.status(500).json({error: 'Internal Server Issue'})
    }
})


//Route to Update an existing Note
router.put('/updateNote/:id', fetchUser, async (req, res) => {
    try{
        const {title, description, tag} = req.body

        const note = {}
        if(title){note.title = title}
        if(description){note.description = description}
        if(tag){note.tag = tag}

        let newNote = await Notes.findById(req.params.id)
        if(!newNote){
            return res.status(400).send('Note not found')
        }

        if(newNote.user.toString() !== req.user.id){
            return res.status(400).send('Not authorized')
        }

        newNote = await Notes.findByIdAndUpdate(req.params.id, {$set: note}, {new: true})
        return res.status(200).json(newNote)
    }catch(error){
        return res.status(500).send('Internal Server Error')
    }
})


//Route to Delete a Note
router.delete('/deleteNote/:id', fetchUser, async (req, res) => {
    try{
        const note = await Notes.findById(req.params.id)

        if(!note){
            return res.status(400).send('Note not found')
        }

        if(note.user.toString() !== req.user.id){
            return res.status(400).send('You are not authorized')
        }

        await Notes.findByIdAndDelete(req.params.id)
        return res.status(200).send('Note has been deleted')
    }catch(error){
        return res.status(500).send('Internal Server Error')
    }
})

module.exports = router;