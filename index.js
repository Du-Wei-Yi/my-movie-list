const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
//設定分頁儲存12部電影
const MOVIES_PER_PAGE = 12

const movies = []
// 為了讓getMoviesByPage也拿到filter後的movies故此設定為全域變數
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image
    rawHTML += `<div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    </div>`
    // console.log(item)
  })
  dataPanel.innerHTML = rawHTML
}
//透過JS來渲染分頁，而必須知道總共有幾部電影
function renderPaginator(amount) {
  //Math.ceil處理過的數字無條件進入
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML

}

//當我輸入此page頁碼時，會回傳對應電影資料
function getMoviesByPage(page) {
  //movies的來源 為array(80)movies or filteredMovies

  // page 1 -> movies 0-11
  // page 2 -> movies 12-23
  // page 3 -> movies 24-35
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

//顯示跳出框之電影的細節內容
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      //response.data.results
      const data = response.data.results
      console.log(data)
      modalTitle.innerText = data.title
      modalDate.innerText = data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    })
    .catch((err) => console.log(err))
}
//新增增加喜好movie的函式
function addToFavorite(id) {
  // function isMovieIdMatched(movie) {
  //   return movie.id === id
  // }
  console.log(id)
  //or運算子優先傳遞左邊為ture的話;favoriteMovies為key值；parse為取出json string的function
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  // 法1: find裡面用function
  // const movie = movies.find(isMovieIdMatched)
  // 法2: arrow funciton
  const movie = movies.find(element => element.id === id)
  if (list.some(element => element.id === id)) {
    return alert('此電影已經在收藏清單中!')
  }
  console.log(movie)
  list.push(movie)
  console.log(list)
  // const jsonString = JSON.stringify(list)
  // console.log('json string: ', jsonString)
  //parse是將string轉換成JSON(javascript objiect資料型式)
  // console.log('json object: ', JSON.parse(jsonString))
  //在localStorage下存入key name is favoriteMovies，並且將相關格式json化
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//以下為addEventListener


//關於button More與 "+"最愛清單之呼叫 onPanelClicked 程式
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // 確定呼叫的DOMstringMap吻合
    // console.log(event.target.dataset) 出來的都是string
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//換頁監聽器
paginator.addEventListener('click', function onPaginatorClicked(event) {
  //點擊其target非<a>元素
  if (event.target.tagName !== 'A') return
  // console.log(event.target.dataset.page)
  const eventpage = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(eventpage))

})


//搜尋函式
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //請瀏覽器不要做預設動作
  event.preventDefault()
  // 把搜尋的文字都變成小寫&trim function 會將input前後空白文刪掉
  const keyword = searchInput.value.trim().toLowerCase()


  //當輸入空字串length=0會alert
  // if (!keyword.length) {
  //   return alert('Please enter a valid string')
  // }
  // 方法1:for of 迴圈  (以電影名稱 title 做搜尋)
  //   for (const element of movies) {
  //     if (element.title.toLowerCase().includes(keyword)) {
  //       filteredMovies.push(element)
  //     }
  //   }

  // 方法2 filter (以電影名稱 title 做搜尋)(為了讓在favorite頁面下也可以進行搜尋)
  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword: ' + keyword)
  }
  //方法3 要加return
  // filteredMovies = movies.filter((movie) => {
  //   return movie.title.toLowerCase().includes(keyword)
  // })
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

//將API內的資料輸入movies此空陣列
axios
  .get(INDEX_URL)
  .then((response) => {
    // 方法1 for of 迴圈
    // for (const movie of response.data.results) {
    //   movies.push(movie)
    // }
    // 方法2
    movies.push(...response.data.results)
    //因未來希望只顯示部分電影，所以要導入getMoviesByPage此function
    renderPaginator(movies.length)
    // console.log(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))

// localStorage.setItem('ddddd', 'uuuuu') 用array的方式存入HTML資料庫
//object 只能用string型態存入
//透過key 叫出value
// console.log(localStorage.getItem('ddddd'))

