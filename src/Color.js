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
