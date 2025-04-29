function displayPopularSeries() {
    const apiUrl = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=ru`;
    const seriesListContainer = document.querySelector('#popular-series .series-list');
    seriesListContainer.innerHTML = ''; // Очищаем перед заполнением

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                data.results.forEach(series => {
                    fetchMovieDetails(series.id, 'tv', seriesListContainer);
                });
            } else {
                seriesListContainer.textContent = 'Не удалось загрузить популярные сериалы.';
            }
        })
        .catch(error => {
            console.error('Ошибка при получении популярных сериалов:', error);
            seriesListContainer.textContent = 'Произошла ошибка при загрузке сериалов.';
        });
}

if (document.querySelector('#popular-series')) {
    displayPopularSeries();
}
