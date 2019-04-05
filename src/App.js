import React, { useState, useCallback,useMemo } from 'react'
import randomColor from 'randomcolor'
import randomLetter from 'random-letter'
import Color from './Color'
import Letter from './Letter'

const App = () => {
  const [color, setColor] = useState('#fff')
  const [letter, setLetter] = useState('start')

  // const handleSetColor = () => setColor(randomColor())
  const handleSetColor = useCallback(() => setColor(randomColor()),[])
  const handleSetLetter = useMemo(() => () => setLetter(randomLetter()), [])

  return (
    <div>
      <Color handleChange={handleSetColor} color={color} />
      <Letter handleChange={handleSetLetter} letter={letter} />
      <hr />
      <h1 style={{ color }}>{letter}</h1>
    </div>
  )
}

export default App
