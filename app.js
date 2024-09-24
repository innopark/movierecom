const popularMovieList = document.getElementById("popular-movie-list");
const categoryMovieList = document.getElementById("category-movie-list");

const keywords = ["Avengers", "Batman", "Star Wars", "Harry Potter", "Matrix"];

// 특정 영화의 상세 정보를 불러오는 함수
const fetchMovieDetails = (movieId) => {
  return fetch(`https://www.omdbapi.com/?i=${movieId}&apikey=b01668ec&plot=full`)
    .then((response) => response.json())
    .then((data) => data);
};

// 여러 키워드에서 인기 영화 데이터를 가져오는 함수
const fetchPopularMovies = async () => {
  const moviesFromKeywords = await Promise.all(
    keywords.map((keyword) =>
      fetch(`https://www.omdbapi.com/?s=${keyword}&apikey=b01668ec`)
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
  const response = await fetch(`https://www.omdbapi.com/?s=${category}&apikey=b01668ec`);
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

// 영화 목록을 화면에 표시하는 함수
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
    moviePlot.innerText = truncatePlot(movie.Plot); // 스토리 줄이기

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
  if (!plot || plot === "N/A") return "줄거리를 찾을 수 없습니다.";
  return plot.length > 120 ? plot.substring(0, 120) + "..." : plot;
};

// 카테고리 버튼 클릭 시 호출되는 함수
const handleCategoryClick = (category) => {
  fetchMoviesByCategory(category);
};

// 페이지 로드 시 인기 영화를 기본으로 불러옴
document.addEventListener("DOMContentLoaded", () => {
  fetchPopularMovies();
  fetchMoviesByCategory("Action"); // 기본으로 'Action' 카테고리 영화 표시
});

// 검색된 영화와 유사한 영화를 추천하는 함수
const searchMovie = async () => {
  const searchTerm = document.getElementById("movie-search").value; // 검색어 가져오기
  const response = await fetch(`https://www.omdbapi.com/?s=${searchTerm}&apikey=b01668ec`); // API 호출
  const data = await response.json(); // JSON 응답 받기

  if (data.Response === "True") {
    // 검색된 영화 표시
    const movie = data.Search[0]; // 첫 번째 영화를 사용
    displaySearchedMovie(movie); // 검색된 영화 정보를 화면에 표시

    // 영화 소제목을 "추천 영화"로 변경
    document.getElementById("movie-section-title").innerText = "추천 영화";

    // 유사한 영화 추천
    fetchSimilarMovies(movie.imdbID);
  } else {
    alert("영화를 찾을 수 없습니다.");
  }
};

// 검색된 영화를 화면에 표시하는 함수
const displaySearchedMovie = (movie) => {
  const searchedMovieContainer = document.getElementById("searched-movie");
  searchedMovieContainer.innerHTML = ""; // 기존 내용 초기화

  const movieCard = `
    <div class="movie-card-large" style="text-align: center;">
      <img src="${movie.Poster}" alt="${movie.Title}" class="movie-poster-large"/>
      <div class="movie-details-large">
        <h3>${movie.Title}</h3>
        <p>출시연도: ${movie.Year}</p>
        <p>평점: ${movie.imdbRating ? movie.imdbRating : 'N/A'} (IMDb)</p>
        <p>${truncatePlot(movie.Plot)}</p>
      </div>
    </div>
  `;

  searchedMovieContainer.innerHTML = movieCard;
};

// 유사 영화 데이터를 가져오는 함수
const fetchSimilarMovies = async (movieId) => {
  const response = await fetch(
    `https://www.omdbapi.com/?i=${movieId}&apikey=b01668ec&plot=full`
  );
  const data = await response.json();

  if (data) {
    const genre = data.Genre.split(",")[0]; // 첫 번째 장르로 유사 영화 검색
    const responseSimilar = await fetch(
      `https://www.omdbapi.com/?s=${genre}&apikey=b01668ec`
    );
    const similarMovies = await responseSimilar.json();

    if (similarMovies.Response === "True") {
      const moviesWithDetails = await Promise.all(
        similarMovies.Search.map(async (movie) => {
          const movieDetailsResponse = await fetch(
            `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=b01668ec&plot=full`
          );
          const movieDetails = await movieDetailsResponse.json();
          return movieDetails;
        })
      );
      displayMovies(moviesWithDetails, popularMovieList); // 유사 영화들 표시
    } else {
      alert("유사 영화를 찾을 수 없습니다.");
    }
  }
};
