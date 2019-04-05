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
