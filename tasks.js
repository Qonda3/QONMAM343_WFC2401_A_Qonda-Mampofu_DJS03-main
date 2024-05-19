import { authors } from './data.js';

// Function to create an HTML element for a book
export function createBookElement({ author, id, image, title }) {
    const bookElement = document.createElement('button');
    bookElement.classList = 'preview';
    bookElement.setAttribute('data-preview', id);
    bookElement.innerHTML = `
        <img class="preview__image" src="${image}" />
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;
    return bookElement;
}

// Function to render a list of books
export function renderBookList(bookList) {
    const initialBookList = document.createDocumentFragment();
    for (const book of bookList) {
        initialBookList.appendChild(createBookElement(book));
    }
    document.querySelector('[data-list-items]').appendChild(initialBookList);
}

// Function to create options for genres and authors
export function createOptionElements(data, defaultText) {
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
