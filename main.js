const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

//Get table body
const table = $('.coin-table tbody')

let coins = []
let result = []

//Render coins from JSON data based on passed arguments
const render = (data, s) => {
  //Sort option
  switch (s) {
    case 'name':
      sortByName(data)
      break
    case 'price':
      sortByPrice(data)
      break
    default:
      sortByRank(data)
  }

  //Render after sorting
  data.forEach(el => {
    let htmlStr = `<tr>
        <td>${el.rank}</td>
        <td><img src='https://s2.coinmarketcap.com/static/img/coins/16x16/${
          el.id
        }.png'>${el.name} (${el.symbol})</td>  
        <td>${el.quotes.USD.price}$</td>
        <td>${el.quotes.USD.percent_change_24h}%</td>
      </tr>`
    table.insertAdjacentHTML('beforeend', htmlStr)
  })
}

//Init fetch and render
fetch('https://api.coinmarketcap.com/v2/ticker/?limit=50')
  .then(res => res.json())
  .then(json => {
    //Store fetched JSON to variable
    coins = Object.values(json.data)

    //render all
    render(coins)
  })
  .catch(err => console.log(err))

//Filter name input function
$('#filter-name').addEventListener('keyup', e => {
  //If blank, display all
  if (e.target.value == '') {
    //Clear the previous result
    table.innerHTML = ''
    //Display all
    render(coins)
  } else {
    //Search for the coin
    result = coins.filter(
      el =>
        el.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
        el.symbol.toLowerCase().includes(e.target.value.toLowerCase())
    )

    //If result is available, display the coin
    if (result.length > 0) {
      table.innerHTML = ''
      render(result)
    } else {
      //Else display none
      table.innerHTML = ''
    }
  }
})

/*
 * Sort functions
 */
const sortByRank = data =>
  data.sort((a, b) => (a.rank > b.rank ? 1 : a.rank < b.rank ? -1 : 0))
const sortByName = data =>
  data.sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0))
const sortByPrice = data =>
  data.sort((a, b) => (a.price > b.price ? 1 : a.price < b.price ? -1 : 0))
const sortByChange = data =>
  data.sort((a, b) => (a.change > b.change ? 1 : a.change < b.change ? -1 : 0))


$('#rank-sort').addEventListener('click', (e) => {
  render(coins)
  if (e.target.classList.contains('selected')) {
    e.target.classList.remove('desc')
  }
  else {
    e.target.classList.add('desc')
  }
})
