import { useState} from 'react'
import reactLogo from '../../assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {useNavigate} from "react-router-dom";
import axios from 'axios'
// import {FirebaseStart} from "../../api/firebase.ts";



function App() {
  const [count, setCount] = useState(0)
  const navigate = useNavigate()

  // async function handleTest(){
  //   const res = await axios.get("api/test")
  //   console.log(res)
  // }
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo"/>
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo"/>
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <button onClick={() => navigate("/test")}>
        Go to test page
      </button>
      {/*<button onClick={() =>  FirebaseStart()}>*/}
      {/*  Test Request*/}
      {/*</button>*/}
    </>
  )
}

export default App
