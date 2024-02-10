import { useState } from 'react'
import './TextEditor'
import TextEditor from './TextEditor'
import {v4 as uuidV4} from 'uuid'
import {BrowserRouter as Router , Routes,Route,Navigate} from 'react-router-dom'
function App() {

  return <Router>
  <Routes>
    <Route path="/" exact element={<Navigate to={`/documents/${uuidV4()}`} />}></Route>
    <Route path="/documents/:id" element={<TextEditor />}></Route>
  </Routes>
</Router>
}

export default App
