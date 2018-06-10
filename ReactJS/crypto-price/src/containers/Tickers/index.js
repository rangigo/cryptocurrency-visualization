import React, { Component } from 'react'
import classes from './index.css'

import Coin from '../../components/Coin'
import SortButton from '../../components/SortButton'

//Sort helper functions
const sortHelper = {
  byRank: (a, b) => (a.rank > b.rank ? 1 : a.rank < b.rank ? -1 : 0),
  byName: (a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0),
  byPrice: (a, b) =>
    a.quotes.USD.price > b.quotes.USD.price
      ? 1
      : a.quotes.USD.price < b.quotes.USD.price
        ? -1
        : 0,
  byChange24h: (a, b) =>
    a.quotes.USD.percent_change_24h > b.quotes.USD.percent_change_24h
      ? 1
      : a.quotes.USD.percent_change_24h < b.quotes.USD.percent_change_24h
        ? -1
        : 0
}

export class Tickers extends Component {
  state = {
    coins: [],
    filterCoins: [],
    isFiltering: false,
    // isReverseSort: false,
    rankRev: false,
    priceRev: false,
    nameRev: false,
    panelOffsetTop: 0,
    counter: 101
  }

  //Get DOM ref to panel div & tickers
  panelRef = null
  tickersRef = null

  componentDidMount() {
    fetch('https://api.coinmarketcap.com/v2/ticker/?convert=BTC')
      .then(res => res.json())
      .then(json => {
        this.setState({
          coins: Object.values(json.data).sort(sortHelper.byRank),
          rankRev: true
        })
        console.log(this.state)
      })
      .catch(err => console.log(err))

    //On scroll event to add fixed header
    window.addEventListener('scroll', this.handleScroll)
    //Set initial offsetTop of panel
    this.setState({ panelOffsetTop: this.panelRef.offsetTop })

    //Resize window => number of coins display shorten
    window.addEventListener('resize', () => {
      this.setState({ windowWidth: window.innerWidth })
    })
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll = () => {
    if (this.panelRef !== null && this.tickersRef !== null) {
      if (window.pageYOffset >= this.state.panelOffsetTop) {
        this.panelRef.classList.add(classes.FixedHeader)
        this.tickersRef.style.marginTop = this.panelRef.clientHeight + 10 + 'px'
      } else {
        this.panelRef.classList.remove(classes.FixedHeader)
        this.tickersRef.style.marginTop = '3em'
      }

      if (
        window.innerHeight + window.pageYOffset >=
        document.body.offsetHeight && !this.state.isFiltering
      ) {
        fetch(`https://api.coinmarketcap.com/v2/ticker/?convert=BTC&start=${this.state.counter}`)
          .then(res => res.json())
          .then(json => {
            const newCoins = [...this.state.coins]
            Object.values(json.data)
              .sort(sortHelper.byRank)
              .forEach(el => newCoins.push(el))
            this.setState({coins: newCoins, counter: this.state.counter + 100})
          })
          .catch(err => console.log(err))
      }
    }
  }

  filterHandle = ev => {
    //If input has values, change state to notify that we are filtering coins
    //else just render initial coins and turn notify off
    if (ev.target.value !== '') {
      this.setState({
        filterCoins: this.state.coins.filter(
          el =>
            el.name.toLowerCase().includes(ev.target.value.toLowerCase()) ||
            el.symbol.toLowerCase().includes(ev.target.value.toLowerCase())
        ),
        isFiltering: true
      })
    } else {
      this.setState({ isFiltering: false })
    }
  }

  sortHandle = type => {
    //Sort filtering coins or initial coins based on isFiltering
    if (this.state.isFiltering) {
      //Each case will check for reverse sort and then set new states
      switch (type) {
        case 'rank':
          this.state.rankRev
            ? this.setState({
                filterCoins: [...this.state.filterCoins]
                  .sort(sortHelper.byRank)
                  .reverse(),
                rankRev: false
              })
            : this.setState({
                filterCoins: [...this.state.filterCoins].sort(
                  sortHelper.byRank
                ),
                rankRev: true
              })
          break
        case 'name':
          this.state.nameRev
            ? this.setState({
                filterCoins: [...this.state.filterCoins]
                  .sort(sortHelper.byName)
                  .reverse(),
                nameRev: false
              })
            : this.setState({
                filterCoins: [...this.state.filterCoins].sort(
                  sortHelper.byName
                ),
                nameRev: true
              })
          break
        case 'price':
          this.state.priceRev
            ? this.setState({
                filterCoins: [...this.state.filterCoins].sort(
                  sortHelper.byPrice
                ),
                priceRev: false
              })
            : this.setState({
                filterCoins: [...this.state.filterCoins]
                  .sort(sortHelper.byPrice)
                  .reverse(),
                priceRev: true
              })
          break
        default:
      }
    } else {
      switch (type) {
        case 'rank':
          this.state.rankRev
            ? this.setState({
                coins: [...this.state.coins].sort(sortHelper.byRank).reverse(),
                rankRev: false
              })
            : this.setState({
                coins: [...this.state.coins].sort(sortHelper.byRank),
                rankRev: true
              })
          break
        case 'name':
          this.state.nameRev
            ? this.setState({
                coins: [...this.state.coins].sort(sortHelper.byName).reverse(),
                nameRev: false
              })
            : this.setState({
                coins: [...this.state.coins].sort(sortHelper.byName),
                nameRev: true
              })
          break
        case 'price':
          this.state.priceRev
            ? this.setState({
                coins: [...this.state.coins].sort(sortHelper.byPrice),
                priceRev: false
              })
            : this.setState({
                coins: [...this.state.coins].sort(sortHelper.byPrice).reverse(),
                priceRev: true
              })
          break
        default:
      }
    }
  }


  render() {
    //Render coins based on filter input
    const coins = this.state.isFiltering
      ? this.state.filterCoins.map(el => <Coin data={el} key={el.id} />)
      : this.state.coins.map(el => <Coin data={el} key={el.id} />)

    const dynamicNum = window.innerWidth > 990 ? 'Number of coins: ' : ''
    const placeholderFilter =
      window.innerWidth < 765
        ? window.innerWidth < 500
          ? 'Name'
          : 'Name/symbol'
        : 'Enter coin name/symbol here to filter'

    return (
      <main className={classes.MainContent}>
        <div className={classes.FunctionPanel} ref={this.setPanelRef}>
          <div className={classes.FilterPanel}>
            <input
              className={classes.Filter}
              type="text"
              onChange={ev => this.filterHandle(ev)}
              placeholder={placeholderFilter}
            />
            <span className={classes.CoinsAmount}>
              {dynamicNum}
              <strong>
                {this.state.isFiltering
                  ? this.state.filterCoins.length
                  : this.state.coins.length}
              </strong>
            </span>
          </div>
          <div className={classes.SortPanel}>
            <SortButton
              type={`sort-numeric-${this.state.rankRev ? 'up' : 'down'}`}
              sort={() => this.sortHandle('rank')}
            />
            <SortButton
              type={`sort-alpha-${this.state.nameRev ? 'up' : 'down'}`}
              sort={() => this.sortHandle('name')}
            />
            <SortButton
              type={`sort-amount-${this.state.priceRev ? 'up' : 'down'}`}
              sort={() => this.sortHandle('price')}
            />
          </div>
        </div>
        <div className={classes.Tickers} ref={this.setTickersRef}>
          {coins}
        </div>
        <i className={`fas fa-arrow-up ${classes.ToTop} fa-2x`} onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}></i>
      </main>
    )
  }

  setPanelRef = ref => {
    this.panelRef = ref
  }
  setTickersRef = ref => {
    this.tickersRef = ref
  }
}

export default Tickers
