function fetchMovieDetails(id, type, container) {
    const language = 'uk';
    let apiUrl = type === 'movie'
        ? `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=${language}`
        : `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=${language}`;

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

            const posterPath = details.poster_path
                ? `https://image.tmdb.org/t/p/w200${details.poster_path}`
                : 'images/no-poster-small.jpg';
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
            const genre = details.genres?.[0]?.name || 'Без жанру';
            const detailsText = document.createElement('p');
            detailsText.textContent = `${year}, ${genre}`;
            cardDetails.appendChild(detailsText);

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Видалити';
            removeBtn.classList.add('delete-button');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeMovieFromLibrary(id, type);
                card.remove();
            });

            card.appendChild(cardDetails);
            card.appendChild(removeBtn);
            container.appendChild(card);
        })
        .catch(error => {
            console.error(`Помилка при отриманні деталей для ${type} ID ${id}:`, error);
        });
}

function loadLibrary() {
    const library = JSON.parse(localStorage.getItem('myLibrary')) || {};
    const categories = ['favorites', 'planned', 'watched', 'onHold', 'dropped'];

    categories.forEach(category => {
        const items = library[category] || [];
        const container = document.querySelector(`#${category} .${category}-list`);
        if (!container) return;

        container.innerHTML = '';

        items.forEach(item => {
            fetchMovieDetails(item.id, item.type, container);
        });
    });
}

function removeMovieFromLibrary(id, type) {
    const library = JSON.parse(localStorage.getItem('myLibrary')) || {};

    for (const category in library) {
        library[category] = library[category].filter(item => !(item.id == id && item.type === type));
    }

    localStorage.setItem('myLibrary', JSON.stringify(library));
    updateLibraryList();
}

function updateLibraryList() {
    const library = JSON.parse(localStorage.getItem('myLibrary')) || {};
    const categories = ['favorites', 'planned', 'watched', 'onHold', 'dropped'];

    categories.forEach(category => {
        const container = document.querySelector(`#${category} .${category}-list`);
        if (!container) return;

        const items = library[category] || [];
        container.innerHTML = '';

        items.forEach(item => {
            const movieItem = document.createElement('div');
            movieItem.classList.add('movie-item');
            movieItem.innerHTML = `
                <h3>${item.type === 'movie' ? 'Фільм' : 'Серіал'} – ID: ${item.id}</h3>
                <button class="remove-from-library" data-id="${item.id}" data-type="${item.type}">Видалити</button>
            `;
            container.appendChild(movieItem);
        });
    });

    document.querySelectorAll('.remove-from-library').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const type = button.getAttribute('data-type');
            removeMovieFromLibrary(id, type);
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('library-container');
    const library = JSON.parse(localStorage.getItem('myLibrary')) || {};

    if (Object.keys(library).length === 0) {
        container.innerHTML = '<p>Бібліотека порожня.</p>';
        return;
    }

    for (const key in library) {
        const { id, type, state } = library[key];
        try {
            const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}&language=uk`);
            const data = await res.json();

            const card = document.createElement('div');
            card.classList.add('library-card');

            const img = document.createElement('img');
            img.src = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'img/no-poster.jpg';
            img.alt = data.title || data.name;

            const title = document.createElement('h3');
            title.textContent = data.title || data.name;

            const stateText = document.createElement('p');
            stateText.textContent = `Стан: ${state}`;

            card.append(img, title, stateText);
            card.addEventListener('click', () => {
                window.location.href = `details.html?type=${type}&id=${id}`;
            });

            container.appendChild(card);
        } catch (e) {
            console.error('Помилка при завантаженні елемента бібліотеки:', e);
        }
    }
});

window.addEventListener('storage', () => {
    loadLibrary();
    updateLibraryList();
});
