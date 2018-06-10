import React from 'react'
import classes from './index.css'

const coin = props => {
  const {
    id,
    name,
    symbol,
    rank,
    quotes: {
      USD: { price: price_usd, percent_change_1h, percent_change_24h },
      BTC: { price: price_btc }
    }
  } = props.data

  const change_1h =
    percent_change_1h > 0 ? (
      <span className={classes.Green}>{percent_change_1h}% ↗</span>
    ) : (
      <span className={classes.Red}>{percent_change_1h}% ↘</span>
    )
  const change_24h =
    percent_change_24h > 0 ? (
      <span className={classes.Green}>{percent_change_24h}% ↗</span>
    ) : (
      <span className={classes.Red}>{percent_change_24h}% ↘</span>
    )

  return (
    <div className={classes.Coin}>
      <h4>
        <img
          src={`https://s2.coinmarketcap.com/static/img/coins/16x16/${id}.png `}
          alt="logo"
        />
        {name} ({symbol})
      </h4>
      <h1>${price_usd}</h1>
      <h3>{price_btc.toFixed(9)} BTC</h3>
      <p>
        <strong>Rank: {rank}</strong>
      </p>
      <p>Change past 1h: {change_1h}</p>
      <p>Change past 24h: {change_24h}</p>
    </div>
  )
}

export default coin
