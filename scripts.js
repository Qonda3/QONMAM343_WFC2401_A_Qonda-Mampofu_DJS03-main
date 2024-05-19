import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';
import { createBookElement } from './tasks.js';

let currentPage = 1;
let filteredBooks = books;

// Function to render a list of books
function renderBookList(bookList) {
    const initialBookList = document.createDocumentFragment();
    for (const book of bookList) {
        initialBookList.appendChild(createBookElement(book));
    }
    document.querySelector('[data-list-items]').appendChild(initialBookList);
}

// Function to create options for genres and authors
function createOptionElements(data, defaultText) {
    const fragment = document.createDocumentFragment();
    const defaultOption = document.createElement('option');
    defaultOption.value = 'any';
    defaultOption.innerText = defaultText;
    fragment.appendChild(defaultOption);

    for (const [id, name] of Object.entries(data)) {
        const optionElement = document.createElement('option');
        optionElement.value = id;
        optionElement.innerText = name;
        fragment.appendChild(optionElement);
    }
    return fragment;
}

// Function to handle theme change
function handleThemeChange(theme) {
    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
}

function init() {
    renderBookList(filteredBooks.slice(0, BOOKS_PER_PAGE));
    document.querySelector('[data-search-genres]').appendChild(createOptionElements(genres, 'All Genres'));
    document.querySelector('[data-search-authors]').appendChild(createOptionElements(authors, 'All Authors'));
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.querySelector('[data-settings-theme]').value = 'night'
        handleThemeChange('night');
    } else {
        document.querySelector('[data-settings-theme]').value = 'day'
        handleThemeChange('day');
    }

    document.querySelector('[data-list-button]').innerText = `Show more (${books.length - BOOKS_PER_PAGE})`
    document.querySelector('[data-list-button]').disabled = (filteredBooks.length - (currentPage * BOOKS_PER_PAGE)) <= 0

    document.querySelector('[data-list-button]').innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${(filteredBooks.length - (currentPage * BOOKS_PER_PAGE)) > 0 ? (filteredBooks.length - (currentPage * BOOKS_PER_PAGE)) : 0})</span>
    `

    addEventListeners();
}

// Function to add event listeners
function addEventListeners() {
    document.querySelector('[data-search-cancel]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = false
    })

    document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = false
    })

    document.querySelector('[data-header-search]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = true
        document.querySelector('[data-search-title]').focus()
    })

    document.querySelector('[data-header-settings]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = true
    })

    document.querySelector('[data-list-close]').addEventListener('click', () => {
        document.querySelector('[data-list-active]').open = false
    })

    document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
        event.preventDefault()
        const formData = new FormData(event.target)
        const { theme } = Object.fromEntries(formData)
        handleThemeChange(theme)
        document.querySelector('[data-settings-overlay]').open = false
    })

    document.querySelector('[data-search-form]').addEventListener('submit', handleSearch);

    document.querySelector('[data-list-button]').addEventListener('click', () => {
        const fragment = document.createDocumentFragment();
        for (const book of filteredBooks.slice(currentPage * BOOKS_PER_PAGE, (currentPage + 1) * BOOKS_PER_PAGE)) {
            fragment.appendChild(createBookElement(book));
        }
        document.querySelector('[data-list-items]').appendChild(fragment);
        currentPage += 1;
    });

    document.querySelector('[data-list-items]').addEventListener('click', handleBookClick);
}

// Function to handle search form submission
function handleSearch(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    filteredBooks = books.filter(book => {
        const matchesTitle = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
        const matchesAuthor = filters.author === 'any' || book.author === filters.author;
        const matchesGenre = filters.genre === 'any' || book.genres.includes(filters.genre);
        return matchesTitle && matchesAuthor && matchesGenre;
    });

    currentPage = 1;
    document.querySelector('[data-list-items]').innerHTML = '';
    renderBookList(filteredBooks.slice(0, BOOKS_PER_PAGE));
    document.querySelector('[data-list-message]').classList.toggle('list__message_show', filteredBooks.length < 1);
    document.querySelector('[data-list-button]').disabled = filteredBooks.length <= currentPage * BOOKS_PER_PAGE;

    document.querySelector('[data-list-button]').innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${filteredBooks.length - currentPage * BOOKS_PER_PAGE})</span>
    `;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('[data-search-overlay]').open = false;
}

// Function to handle book click
function handleBookClick(event) {
    const pathArray = Array.from(event.path || event.composedPath())
    let active = null

    for (const node of pathArray) {
        if (active) break

        if (node?.dataset?.preview) {
            let result = null

            for (const singleBook of books) {
                if (result) break;
                if (singleBook.id === node?.dataset?.preview) result = singleBook
            }

            active = result
        }
    }

    if (active) {
        document.querySelector('[data-list-active]').open = true
        document.querySelector('[data-list-blur]').src = active.image
        document.querySelector('[data-list-image]').src = active.image
        document.querySelector('[data-list-title]').innerText = active.title
        document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`
        document.querySelector('[data-list-description]').innerText = active.description
    }
}
init();