const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const type = urlParams.get('type');

const stateButtons = {
    'add-to-planned': 'Заплановано',
    'add-to-watched': 'Переглянуто',
    'add-to-on-hold': 'Відкладено',
    'add-to-dropped': 'Закинуто'
};

async function getDetails(type, id) {
    const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}&language=uk`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        displayMovieDetails(data);
    } catch (error) {
        console.error('Помилка:', error);
        document.getElementById('details-container').innerHTML = '<p>Не вдалося завантажити дані.</p>';
    }
}

function displayMovieDetails(data) {
    const container = document.getElementById('details-container');
    container.innerHTML = '';

    const poster = document.createElement('img');
    poster.src = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'img/no-poster.jpg';
    poster.alt = data.title || data.name;

    const info = document.createElement('div');
    info.classList.add('details-info');

    const title = document.createElement('h1');
    title.textContent = data.title || data.name;

    const meta = document.createElement('div');
    meta.classList.add('meta');

    const rating = document.createElement('span');
    rating.classList.add('rating');
    rating.textContent = `★ ${data.vote_average?.toFixed(1) || '—'}`;

    const genresList = document.createElement('ul');
    genresList.classList.add('genres-list');
    data.genres?.forEach(genre => {
        const li = document.createElement('li');
        li.textContent = genre.name;
        genresList.appendChild(li);
    });

    const runtime = document.createElement('span');
    runtime.classList.add('runtime');
    if (data.runtime) {
        runtime.textContent = `Тривалість: ${Math.floor(data.runtime / 60)} год ${data.runtime % 60} хв`;
    } else if (data.episode_run_time?.length) {
        runtime.textContent = `Тривалість серії: ${data.episode_run_time[0]} хв`;
    }

    meta.append(rating, genresList, runtime);

    const overview = document.createElement('p');
    overview.classList.add('overview');
    overview.textContent = data.overview || 'Опис недоступний.';

    info.append(title, meta, overview);

    const libraryActions = document.createElement('div');
    libraryActions.classList.add('library-actions');
    libraryActions.innerHTML = `
        <h3>Додати до списку:</h3>
        <button id="add-to-favorites">Улюблене</button>
        <button id="add-to-planned">Заплановано</button>
        <button id="add-to-watched">Переглянуто</button>
        <button id="add-to-on-hold">Відкладено</button>
        <button id="add-to-dropped">Закинуто</button>
    `;

    container.append(poster, info, libraryActions);

    setupLibraryButtons();
}

function setupLibraryButtons() {
    let activeState = null;

    const library = JSON.parse(localStorage.getItem('myLibrary')) || {};
    const itemKey = `${type}-${id}`;
    const currentItem = library[itemKey];

    if (currentItem && currentItem.state) {
        const buttonId = Object.keys(stateButtons).find(key => stateButtons[key] === currentItem.state);
        if (buttonId) {
            document.getElementById(buttonId).classList.add('active');
            activeState = buttonId;
            disableOtherStateButtons(buttonId);
        }
    }

    Object.keys(stateButtons).forEach(buttonId => {
        const btn = document.getElementById(buttonId);

        btn.addEventListener('click', () => {
            if (activeState === buttonId) {
                btn.classList.remove('active');
                enableAllStateButtons();
                showNotification(`Фільм видалено зі списку "${stateButtons[buttonId]}"`);
                activeState = null;
                updateLibraryState(id, type, null);
            } else {
                activeState = buttonId;
                disableOtherStateButtons(buttonId);
                btn.classList.add('active');
                showNotification(`Фільм додано до списку "${stateButtons[buttonId]}"`);
                updateLibraryState(id, type, stateButtons[buttonId]);
            }
        });
    });

    const favBtn = document.getElementById('add-to-favorites');
    const favKey = `favorites-${type}-${id}`;
    const isFavorite = localStorage.getItem(favKey);
    if (isFavorite) favBtn.classList.add('active');

    favBtn.addEventListener('click', () => {
        const isFav = localStorage.getItem(favKey);
        if (isFav) {
            localStorage.removeItem(favKey);
            favBtn.classList.remove('active');
            showNotification('Фільм видалено з Улюблених!');
        } else {
            localStorage.setItem(favKey, 'true');
            favBtn.classList.add('active');
            showNotification('Фільм додано до Улюблених!');
        }
    });
}

function updateLibraryState(id, type, state) {
    const key = 'myLibrary';
    const stored = JSON.parse(localStorage.getItem(key)) || {};
    const itemKey = `${type}-${id}`;

    if (state === null) {
        delete stored[itemKey];
    } else {
        stored[itemKey] = { id, type, state };
    }

    localStorage.setItem(key, JSON.stringify(stored));
}

function disableOtherStateButtons(activeButtonId) {
    Object.keys(stateButtons).forEach(buttonId => {
        const button = document.getElementById(buttonId);
        button.disabled = (buttonId !== activeButtonId);
    });
}

function enableAllStateButtons() {
    Object.keys(stateButtons).forEach(buttonId => {
        const button = document.getElementById(buttonId);
        button.disabled = false;
    });
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    notification.textContent = message;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

getDetails(type, id);
