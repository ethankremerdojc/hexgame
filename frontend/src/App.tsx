import { useState } from 'react'

import { Counter } from '@/features/counter/Counter'
import { Board } from '@/features/board/Board'

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <Board />
        {/* <Counter /> */}
      </section>
    </>
  )
}

export default App
