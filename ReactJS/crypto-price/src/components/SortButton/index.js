import React from 'react'

import classes from './index.css'

const sortButton = (props) => {
  return (
    <i className={[classes.SortButton, `fas fa-${props.type} fa-2x`].join(' ')} onClick={props.sort} />
  )
}

export default sortButton
