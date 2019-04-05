## 本项目用于验证 useCallback 和 useMomo 对于 functional component performance optimization的作用

## 最开始的项目setup如下
App.js
```js
import React, { useState } from 'react'
import randomColor from 'randomcolor'
import randomLetter from 'random-letter'
import Color from './Color'
import Letter from './Letter'

const App = () => {
  const [color, setColor] = useState('#fff')
  const [letter, setLetter] = useState('start')

  return (
    <div>
      <Color handleChange={() => setColor(randomColor())} color={color} />
      <Letter handleChange={() => setLetter(randomLetter())} letter={letter} />
      <hr />
      <h1 style={{ color }}>{letter}</h1>
    </div>
  )
}

export default App

```

Color.js
```js
import React from 'react'
import PropTypes from 'prop-types'

const Color = props => {
  console.log('Color component rendered')
  return (
    <div>
      <button onClick={props.handleChange}>🖍️</button>
      <h3>{props.color}</h3>
    </div>
  )
}

Color.propTypes = {
  handleChange: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired
}

export default Color
```

Letter.js
```js
import React from 'react'
import PropTypes from 'prop-types'

const Letter = props => {
  console.log('Letter component rendered')
  return (
    <div>
      <button onClick={props.handleChange}>✏️</button>
      <h3>{props.letter}</h3>
    </div>
  )
}

Letter.propTypes = {
  handleChange: PropTypes.func.isRequired,
  letter: PropTypes.string.isRequired
}

export default Letter

```

### 现在的问题是，当你每次点击 Color 或者 Letter button, 两个 component 永远一起re-render, 尽管他们之间实际上没有任何关系

### 原因是，当这两个functional component 的parent component, 也就是 App 随着state的变化 re-render的时候，由于这两个 child components 拿到的props当中， 有一个是 handleChange callback function, 这个function的写法目前是inline的，也就是每次都是一个新的object, 所以child component 肯定会re-render

## 我们把setColor这个inline function 放到一个变量里，同时把Color这个functional component用React.memo包裹，依然没有解决问题, 因为每次放进去的function 尽管不是inline了，但是仍然不是同一个object， 而React.memo默认是进行 shallow comparison
App.js
```js
import React, { useState } from 'react'
import randomColor from 'randomcolor'
import randomLetter from 'random-letter'
import Color from './Color'
import Letter from './Letter'

const App = () => {
  const [color, setColor] = useState('#fff')
  const [letter, setLetter] = useState('start')

  const handleSetColor = () => setColor(randomColor())

  return (
    <div>
      <Color handleChange={handleSetColor} color={color} />
      <Letter handleChange={() => setLetter(randomLetter())} letter={letter} />
      <hr />
      <h1 style={{ color }}>{letter}</h1>
    </div>
  )
}

export default App
```

Color.js
```js
import React from 'react'
import PropTypes from 'prop-types'

const Color = props => {
  console.log('Color component rendered')
  return (
    <div>
      <button onClick={props.handleChange}>🖍️</button>
      <h3>{props.color}</h3>
    </div>
  )
}

Color.propTypes = {
  handleChange: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired
}

export default React.memo(Color, (prevProps, nextProps) => {
  // returns false, which means React.memo DO NOT use memorized version and start re-render
  console.log('compare', prevProps.handleChange === nextProps.handleChange)
})
```

## 所以如果这个handleSetColor callback function可以不变化，或者说可以memorized的话，那么就可以避免当props.color不变化时， Color component不必要的render
解决办法就是useCallback
App.js
```js
import React, { useState, useCallback } from 'react'
import randomColor from 'randomcolor'
import randomLetter from 'random-letter'
import Color from './Color'
import Letter from './Letter'

const App = () => {
  const [color, setColor] = useState('#fff')
  const [letter, setLetter] = useState('start')

  // const handleSetColor = () => setColor(randomColor())
  const handleSetColor = useCallback(() => setColor(randomColor()),[])

  return (
    <div>
      <Color handleChange={handleSetColor} color={color} />
      <Letter handleChange={() => setLetter(randomLetter())} letter={letter} />
      <hr />
      <h1 style={{ color }}>{letter}</h1>
    </div>
  )
}

export default App
```

Color.js
```js
import React from 'react'
import PropTypes from 'prop-types'

const Color = props => {
  console.log('Color component rendered')
  return (
    <div>
      <button onClick={props.handleChange}>🖍️</button>
      <h3>{props.color}</h3>
    </div>
  )
}

Color.propTypes = {
  handleChange: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired
}

export default React.memo(Color)
```

在本例当中，`useMemo` 和 `useCallback`的作用是一样的，只是语法不同
App.js
```js
import React, { useState, useCallback,useMemo } from 'react'
import randomColor from 'randomcolor'
import randomLetter from 'random-letter'
import Color from './Color'
import Letter from './Letter'

const App = () => {
  const [color, setColor] = useState('#fff')
  const [letter, setLetter] = useState('start')

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
```
Letter.js
```js
import React from 'react'
import PropTypes from 'prop-types'

const Letter = props => {
  console.log('Letter component rendered')
  return (
    <div>
      <button onClick={props.handleChange}>✏️</button>
      <h3>{props.letter}</h3>
    </div>
  )
}

Letter.propTypes = {
  handleChange: PropTypes.func.isRequired,
  letter: PropTypes.string.isRequired
}

export default React.memo(Letter)
```

## 上面两种方法在callback function本身不常变化的时候工作良好，参考`https://www.youtube.com/watch?v=tKRWuVOEB2w&t=10s` 这种情况下，callback function会受todo list的影响，每次你点击todo, 都会改变todos的状态，进而产生一个新的callback function(因为这个callback function depend on todos)，所有如果为了避免重新render <Form />component, 则不能使用 useCallback或者useMemo, 而可以考虑使用useReducer, 因为我们传递给Form的function, 不再是一个随时变化的callback function, 而是一个不变的disptach 方法（React保证这个方法稳定不变化），所以可以避免 <Form />component 的re-render


## 总结：
1. useCallback 可以memorize 一个callback function, 这个function传到 child component当中的话，不会被认为是不同的object
2. 在child component 当中，必须配合React.memo()使用，才能避免不必要的re-render
3. 如果这个callback function 受external dependencies的影响，那么有可能工作不如你预期。此时可以参考`https://github.com/benawad/react-hooks-examples` 和 ``https://www.youtube.com/watch?v=tKRWuVOEB2w&t=10s`, 使用useReducer来避免re-render, 尽管useReducer本身的目的不是这个

## 参考文献：
[React Hooks - useCallback & useMemo](https://scrimba.com/c/cyGEEcn)