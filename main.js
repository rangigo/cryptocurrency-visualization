const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

//Get table body
const table = $('.coin-table tbody')

//Stored data
let coins = []
let filteredCoins = []

//Render coins from JSON data based on passed arguments
const render = (data, sort, reverse) => {
  //Empty previous results
  table.innerHTML = ''
  //Sort option
  switch (sort) {
    case 'name':
      sortByName(data)
      break
    case 'price':
      sortByPrice(data)
      break
    case 'change':
      sortByChange(data)
      break
    default:
      sortByRank(data)
  }

  //Reverse the orders after sorting if informed
  if (reverse) data.reverse()

  //Render after sorting/reversing
  data.forEach(el => {
    let htmlStr = `<tr>
        <td>${el.rank}</td>
        <td><img src='https://s2.coinmarketcap.com/static/img/coins/16x16/${
          el.id
        }.png'>${el.name} (${el.symbol})</td>  
        <td>${el.quotes.USD.price} $</td>
        <td>${el.quotes.USD.percent_change_24h}</td>
      </tr>`
    table.insertAdjacentHTML('beforeend', htmlStr)
  })

  //Colors for percent_change_24h
  $$('tbody tr td:nth-child(4)').forEach(el => {
    if (parseFloat(el.textContent) >= 0 ) {
      el.style.color = 'green'
      el.textContent += '% ↗' 
    }
    else {
      el.style.color = 'red' 
      el.textContent += '% ↘' 
    }
  })
}

//Init fetch and render
fetch('https://api.coinmarketcap.com/v2/ticker/?limit=100')
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
    //Display all
    render(coins)
  } else {
    //Search for the coin
    filteredCoins = coins.filter(
      el =>
        el.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
        el.symbol.toLowerCase().includes(e.target.value.toLowerCase())
    )

    //If filteredCoins is available, display the coin
    if (filteredCoins.length > 0) {
      table.innerHTML = ''
      render(filteredCoins)
    } else {
      //Else display none
      table.innerHTML = ''
    }
  }
})

/*
 * Sort functions take 2 arguments. 1st argument is the array of coins (original data or filtered data)
 */
const sortByRank = data =>
  data.sort((a, b) => (a.rank > b.rank ? 1 : a.rank < b.rank ? -1 : 0))
const sortByName = data =>
  data.sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0))
const sortByPrice = data =>
  data.sort(
    (a, b) =>
      a.quotes.USD.price > b.quotes.USD.price
        ? 1
        : a.quotes.USD.price < b.quotes.USD.price
          ? -1
          : 0
  )
const sortByChange = data =>
  data.sort(
    (a, b) =>
      a.quotes.USD.percent_change_24h > b.quotes.USD.percent_change_24h
        ? 1
        : a.quotes.USD.percent_change_24h < b.quotes.USD.percent_change_24h
          ? -1
          : 0
  )


//Add event for sort button
$$('.sort-button').forEach(el =>
  el.addEventListener('click', e => {
    //Only 1 sort arrow displayed per clicked button
    e.target.classList.add('selected')
    $$(`.sort-button:not(#${e.target.id})`).forEach(el =>
      el.classList.remove('selected')
    )

    //Depends on sort button id, we add the functionality
    //Based on the sort arrow to reverse result
    //If there are filtered results, sort the filter coins else sort the original coins
    switch (e.target.id) {
      case 'rank-sort':
        e.target.classList.toggle('desc')
          ? $('#filter-name').value != ''
            ? render(filteredCoins, 'rank', false)
            : render(coins, 'rank', false)
          : $('#filter-name').value != ''
            ? render(filteredCoins, 'rank', true)
            : render(coins, 'rank', true)
        break
      case 'name-sort':
        e.target.classList.toggle('desc')
          ? $('#filter-name').value != ''
            ? render(filteredCoins, 'name', false)
            : render(coins, 'name', false)
          : $('#filter-name').value != ''
            ? render(filteredCoins, 'name', true)
            : render(coins, 'name', true)
        break
      case 'price-sort':
        e.target.classList.toggle('desc')
          ? $('#filter-name').value != ''
            ? render(filteredCoins, 'price', false)
            : render(coins, 'price', false)
          : $('#filter-name').value != ''
            ? render(filteredCoins, 'price', true)
            : render(coins, 'price', true)
        break
      case 'change-sort':
        e.target.classList.toggle('desc')
          ? $('#filter-name').value != ''
            ? render(filteredCoins, 'change', false)
            : render(coins, 'change', false)
          : $('#filter-name').value != ''
            ? render(filteredCoins, 'change', true)
            : render(coins, 'change', true)
        break
    }
  })
)

