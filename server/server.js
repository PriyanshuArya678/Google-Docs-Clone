const mongoose = require('mongoose');
const Document =require('./Document')
mongoose.connect('mongodb://127.0.0.1:27017/google-docs-clone');
const io =require('socket.io')(3001,{
    cors:{
        origin:"http://localhost:5173",
        method: ['GET','POST']
    }
})// import socket
const defaultValue=''//default value of the data of the newly created document

//on connection with socket a callback runs
io.on("connection",socket=>{
    socket.on('get-document',async documentId=>{
         const data=''
         const document =await findOrCreateDocument(documentId)//finds the document by using document id , if document by that document id is not present then it creates a new document with the new id and data
         socket.join(documentId)//join a socket room using documentId
         socket.emit('load-document',document.data)//send back load document
         socket.on("send-changes",delta=>{//send back changes in the form of delta
            socket.broadcast.to(documentId).emit("receive-changes",delta)
        })
        socket.on('save-document',async data=>{
            await Document.findByIdAndUpdate(documentId,{data})
        })
    })    
})
async function findOrCreateDocument(id){
    if(id==null)return// safety check
    const document =await Document.findById(id)//find the document
    if(document) return document//if document exists return the document
    return await Document.create({_id: id,data: defaultValue})//if document doesn't exist return a newly created document 
}