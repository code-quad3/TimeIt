
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {ChartColumnDecreasing} from 'lucide-react';
import {Ban} from 'lucide-react';
import {CirclePause} from 'lucide-react';
import Time from './Time';
function App() {
  

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
        <Time />


      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <div class="flex justify-between  mt-4">
      <button>
      <ChartColumnDecreasing />
      </button>
      <button>
        <Ban />
      </button>
      <button>
       <CirclePause />
      </button>
</div>
    </>
  )
}

export default App
