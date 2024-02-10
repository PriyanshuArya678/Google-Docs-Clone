import { useCallback, useEffect, useState } from "react"
import Quill from "quill"
import "quill/dist/quill.snow.css"
import './styles.css'
import {io} from 'socket.io-client'
import { useParams } from "react-router-dom"
const SAVE_INTERVAL_MS = 2000
const TOOLBAR_OPTIONS = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],
  
    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction
  
    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  
    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],
  
    ['clean']
]

export default function TextEditor() {
    const [socket ,setSocket]=useState()
    const [quill ,setQuill]=useState()
    const {id: documentId}=useParams()
    useEffect(()=>{
        const s =io("http://localhost:3001")
        setSocket(s)
        return ()=>{
            s.disconnect()
        }
    },[])
    useEffect(()=>{
      if(socket==null||quill ==null) return
      const interval =setInterval(()=>{
        socket.emit('save-document',quill.getContents())
        console.log('savae')
      },SAVE_INTERVAL_MS)
      return ()=>{
        clearInterval(interval)
      }
    },[socket,quill,documentId])
    useEffect(()=>{
      if(socket==null||quill ==null) return
      //recieve load-document only once and we set the contents of the document 
      socket.once('load-document',document=>{
        quill.setContents(document)
        quill.enable()
      })
      socket.emit('get-document',documentId)//send document id to the socket server so that the server can join a room and send back load-document
    },[socket,quill,documentId])
    useEffect(()=>{
      if(socket==null||quill ==null) return//handle null cases
      const handler=function(delta) {
          // console.log(delta)
          quill.updateContents(delta)//we update content of the document using delta recieved from the server which 
        }
      socket.on('receive-changes',handler );// recieve-changes event recieves changes to the document in the form of delta
        return ()=>{
          socket.off("receive-changes",handler)//turn the socket off
        }
  },[socket,quill])
    useEffect(()=>{
        if(socket==null||quill ==null) return
        const handler=function(delta, oldDelta, source) {
            if (source !== 'user')return 
            socket.emit("send-changes",delta)
            
          }
        quill.on('text-change',handler );
          return ()=>{
            quill.off('text-change',handler)
          }
    },[socket,quill])
  const wrapperRef = useCallback(wrapper => {
    if (wrapper == null) return

    wrapper.innerHTML = ""
    const editor = document.createElement("div")
    wrapper.append(editor)
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    })
    q.disable()
    q.setText('Loading....')
    setQuill(q)
  }, [])
  return <div className="container" ref={wrapperRef}></div>
}