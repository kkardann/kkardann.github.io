const apiKey = '098fd185c0226f48ab7a946a330681cf';

// Функция для загрузки деталей фильма
function fetchMovieDetails(id, type, container) {
    const language = 'uk'; // Фиксированный украинский язык

    let apiUrl = '';
    if (type === 'movie') {
        apiUrl = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=${language}`;
    } else if (type === 'tv') {
        apiUrl = `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=${language}`;
    }

    fetch(apiUrl)
        .then(response => response.json())
        .then(details => {
            const card = document.createElement('div');
            card.classList.add(type === 'movie' ? 'movie-card' : 'series-card');
            card.style.cursor = 'pointer';

            card.addEventListener('click', () => {
                window.location.href = `details.html?type=${type}&id=${id}`;
            });

            const imageContainer = document.createElement('div');
            imageContainer.classList.add('card-image-container');

            const posterPath = details.poster_path ? `https://image.tmdb.org/t/p/w200${details.poster_path}` : 'images/no-poster-small.jpg';
            const poster = document.createElement('img');
            poster.src = posterPath;
            poster.alt = details.title || details.name || 'Без назви';
            imageContainer.appendChild(poster);
            card.appendChild(imageContainer);

            const cardDetails = document.createElement('div');
            cardDetails.classList.add('card-details');

            const title = document.createElement('h3');
            title.textContent = details.title || details.name || 'Без назви';
            cardDetails.appendChild(title);

            const year = (details.release_date || details.first_air_date || '').substring(0, 4);
            const genre = details.genres && details.genres.length > 0 ? details.genres[0].name : 'Без жанру';
            const detailsText = document.createElement('p');
            detailsText.textContent = `${year}, ${genre}`;
            cardDetails.appendChild(detailsText);

            card.appendChild(cardDetails);
            container.appendChild(card);
        })
        .catch(error => {
            console.error(`Помилка при отриманні деталей для ${type} ID ${id}:`, error);
        });
}

// Пошук
function handleSearch(event) {
    event.preventDefault();
    const searchInput = document.querySelector('#search-input');
    if (searchInput) {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `search.html?query=${encodeURIComponent(query)}`;
        } else {
            alert('Будь ласка, введіть запит для пошуку.');
        }
    }
}

// Додавання до бібліотеки
function setupLibraryButtons() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const id = urlParams.get('id');

    const buttons = {
        favorites: document.getElementById('add-to-favorites'),
        planned: document.getElementById('add-to-planned'),
        watched: document.getElementById('add-to-watched'),
        onHold: document.getElementById('add-to-on-hold'),
        dropped: document.getElementById('add-to-dropped')
    };

    for (const [category, button] of Object.entries(buttons)) {
        if (button) {
            button.addEventListener('click', () => addToLibrary(category, type, id));
        }
    }
}

function addToLibrary(category, type, id) {
    if (!type || !id) {
        alert('Помилка: не знайдено type або id');
        return;
    }
    const key = `library_${category}`;
    let items = JSON.parse(localStorage.getItem(key)) || [];

    const alreadyExists = items.some(item => item.id === id && item.type === type);
    if (!alreadyExists) {
        items.push({ id, type });
        localStorage.setItem(key, JSON.stringify(items));
        alert(`Додано до "${getCategoryName(category)}"!`);
    } else {
        alert(`Вже є в "${getCategoryName(category)}"!`);
    }
}

function getCategoryName(category) {
    switch (category) {
        case 'favorites': return 'Улюблене';
        case 'planned': return 'Заплановане';
        case 'watched': return 'Переглянуте';
        case 'onHold': return 'В очікуванні';
        case 'dropped': return 'Кинуто';
        default: return category;
    }
}
