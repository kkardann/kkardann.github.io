function searchMoviesAndSeries() {
    const searchInputHeader = document.querySelector('header #search-input');
    const searchResultsContainer = document.querySelector('#search-results');
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');

    if (searchResultsContainer && query) {
        if (searchInputHeader) {
            searchInputHeader.value = query; // Заполняем поле поиска в хедере на странице результатов
        }
        searchResultsContainer.innerHTML = '<p>Поиск...</p>';
        const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=ru&query=${encodeURIComponent(query)}`;

        fetch(searchUrl)
            .then(response => response.json())
            .then(data => {
                searchResultsContainer.innerHTML = '';
                if (data.results && data.results.length > 0) {
                    data.results.forEach(result => {
                        if (result.media_type === 'movie' || result.media_type === 'tv') {
                            fetchMovieDetails(result.id, result.media_type, searchResultsContainer, result);
                        }
                    });
                } else {
                    searchResultsContainer.textContent = 'Ничего не найдено по вашему запросу.';
                }
            })
            .catch(error => {
                console.error('Ошибка при поиске:', error);
                searchResultsContainer.textContent = 'Произошла ошибка при выполнении поиска.';
            });
    } else if (searchResultsContainer) {
        searchResultsContainer.textContent = 'Пожалуйста, введите запрос для поиска.';
    }
}

if (document.querySelector('#search-results')) {
    searchMoviesAndSeries();
}
