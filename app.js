const popularMovieList = document.getElementById("popular-movie-list");
const categoryMovieList = document.getElementById("category-movie-list");

const keywords = ["Avengers", "Batman", "Star Wars", "Harry Potter", "Matrix"];

// 특정 영화의 상세 정보를 불러오는 함수
const fetchMovieDetails = (movieId) => {
  return fetch(`http://www.omdbapi.com/?i=${movieId}&apikey=b01668ec&plot=full`)
    .then((response) => response.json())
    .then((data) => data);
};

// 여러 키워드에서 인기 영화 데이터를 가져오는 함수
const fetchPopularMovies = async () => {
  const moviesFromKeywords = await Promise.all(
    keywords.map((keyword) =>
      fetch(`http://www.omdbapi.com/?s=${keyword}&apikey=b01668ec`)
        .then((response) => response.json())
        .then(async (data) => {
          if (data.Response === "True") {
            const moviesWithDetails = await Promise.all(
              data.Search.slice(0, 2).map((movie) => fetchMovieDetails(movie.imdbID))
            );
            return moviesWithDetails;
          }
          return [];
        })
    )
  );
  const popularMovies = moviesFromKeywords.flat();
  displayMovies(popularMovies, popularMovieList);
};

// 선택된 카테고리의 영화를 가져오는 함수
const fetchMoviesByCategory = async (category) => {
  const response = await fetch(`http://www.omdbapi.com/?s=${category}&apikey=b01668ec`);
  const data = await response.json();
  if (data.Response === "True") {
    const moviesWithDetails = await Promise.all(
      data.Search.map((movie) => fetchMovieDetails(movie.imdbID))
    );
    displayMovies(moviesWithDetails, categoryMovieList);
  } else {
    categoryMovieList.innerHTML = "<p>해당 카테고리의 영화를 찾을 수 없습니다.</p>";
  }
};

// 영화 목록을 화면에 표시하는 함수 (인기 영화와 카테고리별 영화 모두 사용)
const displayMovies = (movies, targetElement) => {
  targetElement.innerHTML = ""; // 기존 내용 지우기
  movies.forEach((movie) => {
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");

    const moviePoster = document.createElement("img");
    moviePoster.src = movie.Poster;
    moviePoster.alt = movie.Title;
    moviePoster.classList.add("movie-poster");

    const movieDetails = document.createElement("div");
    movieDetails.classList.add("movie-details");

    const movieTitle = document.createElement("h3");
    movieTitle.innerText = movie.Title;

    const movieYear = document.createElement("p");
    movieYear.innerText = `출시연도: ${movie.Year}`;

    const moviePlot = document.createElement("p");
    moviePlot.innerText = truncatePlot(movie.Plot);

    movieDetails.appendChild(movieTitle);
    movieDetails.appendChild(movieYear);
    movieDetails.appendChild(moviePlot);
    movieCard.appendChild(moviePoster);
    movieCard.appendChild(movieDetails);
    targetElement.appendChild(movieCard);
  });
};

// 스토리 줄거리를 줄이는 함수
const truncatePlot = (plot) => {
  if (!plot) return "줄거리를 찾을 수 없습니다.";
  return plot.length > 120 ? plot.substring(0, 120) + "..." : plot;
};

// 카테고리 버튼 클릭 시 호출되는 함수
const handleCategoryClick = (category) => {
  fetchMoviesByCategory(category);
};

// 페이지 로드 시 인기 영화를 기본으로 불러옴
document.addEventListener("DOMContentLoaded", () => {
  fetchPopularMovies();
});

// 페이지 로드 시 기본 카테고리 영화를 불러오는 부분
document.addEventListener("DOMContentLoaded", () => {
    fetchPopularMovies();
    fetchMoviesByCategory('Action'); // 페이지 로드 시 기본으로 'Action' 카테고리 영화 표시
  });
  