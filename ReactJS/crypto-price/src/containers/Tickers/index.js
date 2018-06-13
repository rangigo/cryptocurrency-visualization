import React, { Component } from 'react'
import classes from './index.css'

import Coin from '../../components/Coin'
import SortButton from '../../components/SortButton'
import Spinner from '../../components/Spinner/Spinner'

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
    data: [],
    coins: [],
    isFiltering: false,
    rankRev: false,
    priceRev: false,
    nameRev: false,
    panelOffsetTop: 0,
    limit: 0,
    counter: 1,
    loading: true
  }

  //Get DOM ref to panel div & tickers
  panelRef = null
  tickersRef = null

  //Init fetch

  fetchData = () => {
    fetch(
      `https://api.coinmarketcap.com/v2/ticker/?convert=BTC&start=${
        this.state.counter
      }`
    )
      .then(res => res.json())
      .then(json => {
        // console.log('counter', this.state.counter)
        //Set total amount of coins
        if (this.state.limit === 0) {
          this.setState({
            limit: json.metadata.num_cryptocurrencies
          })
        }

        //Store the coins
        this.setState({
          data: this.state.data.concat(
            Object.values(json.data).sort(sortHelper.byRank)
          )
        })
        //If we finished fetch first 100 coins, display them
        if (this.state.data.length === 100)
          this.setState({
            coins: this.state.data,
            loading: false,
            rankRev: true
          })

        //Recursion fetch until we have all the coins loaded
        if (this.state.counter <= this.state.limit - (this.state.limit % 100)) {
          // console.log('?')
          this.setState({ counter: this.state.counter + 100 })
          this.fetchData()
        }
      })
      .catch(err => console.log(err))
  }

  componentDidMount() {
    //Fetch coins when component is loaded
    this.fetchData()
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
          document.body.offsetHeight - 1 &&
        !this.state.isFiltering &&
        this.state.coins.length < this.state.limit
      ) {
        this.setState({ loading: true })
        setTimeout(() => {
          this.setState({
            coins: this.state.coins.concat(
              this.state.data.slice(
                this.state.coins.length,
                this.state.coins.length + 100
              )
            ),
            loading: false
          })
        }, 500)
      }
    }
  }

  filterHandle = ev => {
    //If input has values, change state to notify that we are filtering coins
    //else just render initial coins and turn notify off
    if (ev.target.value !== '') {
      this.setState({
        coins: this.state.data.filter(
          el =>
            el.name.toLowerCase().includes(ev.target.value.toLowerCase()) ||
            el.symbol.toLowerCase().includes(ev.target.value.toLowerCase())
        ),
        isFiltering: true
      })
    } else {
      this.setState({
        coins: this.state.data.slice(0, 100).sort(sortHelper.byRank),
        isFiltering: false
      })
    }
  }

  sortHandle = type => {
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

  render() {
    const dynamicNum =
      window.innerWidth > 990
        ? this.state.data.length < this.state.limit
          ? 'Loading coins: '
          : this.state.isFiltering
            ? 'Coins found: '
            : 'Coins displayed: '
        : ''
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
              onChange={this.filterHandle}
              placeholder={placeholderFilter}
              disabled={this.state.data.length < this.state.limit}
            />
            <span className={classes.CoinsAmount}>
              {dynamicNum}
              <strong>
                {this.state.data.length < this.state.limit ? (
                  <div>
                    <i className="fas fa-sync-alt" />
                    {this.state.data.length}/{this.state.limit}
                  </div>
                ) : (
                  `${this.state.coins.length}/${this.state.data.length}`
                )}
              </strong>
            </span>
          </div>
          <div>
            <SortButton
              type={`sort-numeric-${this.state.rankRev ? 'down' : 'up'}`}
              sort={() => this.sortHandle('rank')}
            />
            <SortButton
              type={`sort-alpha-${this.state.nameRev ? 'down' : 'up'}`}
              sort={() => this.sortHandle('name')}
            />
            <SortButton
              type={`sort-amount-${this.state.priceRev ? 'down' : 'up'}`}
              sort={() => this.sortHandle('price')}
            />
          </div>
        </div>
        <div className={classes.Tickers} ref={this.setTickersRef}>
          {this.state.coins.map((el, id) => <Coin data={el} key={id} />)}
        </div>
        {this.state.loading ? <Spinner /> : null}
        <i
          className={`fas fa-arrow-up ${classes.ToTop} fa-2x`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />
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
