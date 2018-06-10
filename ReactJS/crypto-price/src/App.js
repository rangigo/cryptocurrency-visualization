import React, { Component } from 'react'
import classes from './App.css'

import Tickers from './containers/Tickers'

class App extends Component {
  render() {
    return (
      <React.Fragment>
        <header className={classes.PageHeader}>
          <h1>Cryptocurrency Coins Visualization</h1>
        </header>
        <Tickers />
      </React.Fragment>
    )
  }
}

export default App
