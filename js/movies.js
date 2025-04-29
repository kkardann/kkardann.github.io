// js/movies.js

function displayMovies(page = 1) {
    const apiKey = '098fd185c0226f48ab7a946a330681cf';
    let apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=ru&page=${page}&sort_by=popularity.desc`;
    const movieListContainer = document.querySelector('#movie-catalog .movie-list');
    const paginationContainer = document.querySelector('#movie-catalog .pagination');

    if (movieListContainer) {
        movieListContainer.innerHTML = '<p>Загрузка фильмов...</p>';

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                movieListContainer.innerHTML = '';

                let moviesToDisplay = data.results || [];

                if (moviesToDisplay.length > 0) {
                    moviesToDisplay.forEach(movie => {
                        fetchMovieDetails(movie.id, 'movie', movieListContainer);
                    });

                    if (paginationContainer && data.total_pages > 1) {
                        paginationContainer.innerHTML = ''; // Очищаем контейнер пагинации

                        const totalPages = data.total_pages;
                        const visiblePages = 5; // Количество видимых страниц в пагинации

                        // Кнопка "Назад"
                        if (page > 1) {
                            const prevButton = document.createElement('button');
                            prevButton.textContent = '<';
                            prevButton.addEventListener('click', () => displayMovies(page - 1));
                            paginationContainer.appendChild(prevButton);
                        }

                        // Первая страница
                        if (page > Math.ceil(visiblePages / 2) + 1) {
                            const firstPageButton = document.createElement('button');
                            firstPageButton.textContent = '1';
                            firstPageButton.addEventListener('click', () => displayMovies(1));
                            paginationContainer.appendChild(firstPageButton);
                            const dotsStart = document.createElement('span');
                            dotsStart.textContent = '...';
                            paginationContainer.appendChild(dotsStart);
                        }

                        // Отображение видимых страниц вокруг текущей
                        const startPage = Math.max(1, page - Math.floor(visiblePages / 2));
                        const endPage = Math.min(totalPages, page + Math.floor(visiblePages / 2));

                        for (let i = startPage; i <= endPage; i++) {
                            const pageButton = document.createElement('button');
                            pageButton.textContent = i;
                            if (i === page) {
                                pageButton.classList.add('active'); // Добавим класс для текущей страницы
                            }
                            pageButton.addEventListener('click', () => displayMovies(i));
                            paginationContainer.appendChild(pageButton);
                        }

                        // Последняя страница
                        if (page < totalPages - Math.floor(visiblePages / 2)) {
                            const dotsEnd = document.createElement('span');
                            dotsEnd.textContent = '...';
                            paginationContainer.appendChild(dotsEnd);
                            const lastPageButton = document.createElement('button');
                            lastPageButton.textContent = totalPages;
                            lastPageButton.addEventListener('click', () => displayMovies(totalPages));
                            paginationContainer.appendChild(lastPageButton);
                        }

                        // Кнопка "Вперед"
                        if (page < totalPages) {
                            const nextButton = document.createElement('button');
                            nextButton.textContent = '>';
                            nextButton.addEventListener('click', () => displayMovies(page + 1));
                            paginationContainer.appendChild(nextButton);
                        }
                    }
                } else {
                    movieListContainer.textContent = 'Фильмы не найдены.';
                }
            })
            .catch(error => {
                console.error('Ошибка при получении списка фильмов:', error);
                movieListContainer.textContent = 'Произошла ошибка при загрузке фильмов.';
            });
    }
}

if (window.location.pathname.includes('movies.html')) {
    displayMovies(); // По умолчанию
}