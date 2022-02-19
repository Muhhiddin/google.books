const token = localStorage.getItem('token');
let totalCount = document.getElementById('count');
let cardTemplate = document.querySelector('.card-template').content;
let cardContainer = document.querySelector('#books-container');
let searchEl = document.getElementById('search');
let searchBtn = document.getElementById('search-btn');
let sortBtn = document.querySelector('.sort-btn');
let logout = document.querySelector('#logout');
// let moreBtn = document.querySelector('.more-btn');
let modalTemplate = document.getElementById('modal-template');
let modal = document.getElementById('modal_content');
let modalBg = document.getElementById('modal_content_bg');
let body = document.querySelector('body');
let addEl = document.querySelector('.edit-card');
let bookmarkTamplate = document.getElementById('bookmark-template').content;
let booksmarks = document.getElementById('booksmarks');
const bookmarkTable = 'books';

if (!token) {
    window.location.replace('auth.html');
}

const api = {
        async getUsers(q = "js", orderBy = false) {
            let query = "";
            if (q) {
                query = `?q=${q}`;
            }

            if (orderBy) {
                query = query + `&orderBy=newest`;
            }
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes${query}&maxResults=39`);
            return await response.json();
        },
        async getBookById(id) {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
            return await response.json();
        },
    }

;(async () => {
    const books = await api.getUsers();
    renderBooks(books);
    renderBookmarks();
})();

/**
 * logout
 */
logout.addEventListener('click', async () => {
    localStorage.removeItem('token')
    window.location.replace('auth.html');
});

/** search
 *
 */
searchBtn.addEventListener('click', async () => {
    const books = await api.getUsers(searchEl.value.trim);
    if (!books) {
        alert("Not found")
    }
    renderBooks(books);
});

/**
 * sort
 */
sortBtn.addEventListener('click', async () => {
    const sort = await api.getUsers(searchEl.value ? searchEl.value : "js", true)
    renderBooks(sort);
});

/**
 * Modal background toggle
 */

modalBg.addEventListener("click", () => {
    modal.innerHTML = "";
    modalBg.classList.remove('active');
    body.classList.remove('modal-active');
});

function renderBooks(books) {
    totalCount.innerHTML = books.totalItems;
    cardContainer.innerHTML = "";
    for (let book of books.items) {
        //  console.log(book.volumeInfo.title);

        let cardItemEl = document.importNode(cardTemplate, true);
        cardItemEl = drawElementConfig(cardItemEl, {
            ".card-title": {
                text: book.volumeInfo.title
            },
            "#card-author": {
                text: book.volumeInfo.publisher
            },
            ".card-year": {
                text: book.volumeInfo.publishedDate
            },
            ".card-img-top": {
                attr: {
                    src: book.volumeInfo.imageLinks.smallThumbnail
                }
            },
        });
        let moreBtn = cardItemEl.querySelector('.more-btn');
        let bookMark = cardItemEl.querySelector('.bookmark-btn');
        moreBtn.dataset.bookId = book.id;
        showModal(moreBtn);

        bookMark.addEventListener('click', event => {
            addTodos(book);
        });

        cardContainer.appendChild(cardItemEl);
    }
}

function getTodos() {
    let todos = localStorage.getItem(bookmarkTable) || "[]";
    return JSON.parse(todos)
}

function deleteTodos(id) {
    let todos = getTodos()
    todos = todos.filter(element => element.id != id)
    localStorage.setItem(bookmarkTable, JSON.stringify(todos));
    renderBookmarks();
}

function addTodos(todo) {
    const todos = getTodos();
    let issetElement = todos.find(ele => ele.id === todo.id);
    if (!issetElement) {
        todos.push(todo);
        localStorage.setItem(bookmarkTable, JSON.stringify(todos));
        renderBookmarks();
    }
}

function renderBookmarks() {
    booksmarks.innerHTML = '';
    getTodos().forEach((book) => {
        let bookmarkTamplateItem = document.importNode(bookmarkTamplate, true);
        let bookmarkItem = drawElementConfig(bookmarkTamplateItem, {
            ".bookmark-title": {
                text: book.volumeInfo.title
            },
            ".bookmark-author": {
                text: book.volumeInfo.title,
            },
            ".bookmark-remove": {
                attr: {
                    onclick: `deleteTodos("${book.id}")`
                }
            },
        });

        let moreBtn = bookmarkItem.querySelector('.bookmark-more');
        moreBtn.dataset.bookId = book.id;
        showModal(moreBtn);

        /*let bookMarkRemove = bookmarkItem.querySelector('.bookmark-remove');

        bookMarkRemove.addEventListener('click', event => {

        });*/

        booksmarks.appendChild(bookmarkItem);
    });
}

function showModal(moreBtn) {
    moreBtn.addEventListener("click", async event => {

        body.classList.add('modal-active');
        modalBg.classList.add('active');


        let bookId = event.target.dataset.bookId;
        let bookData = await api.getBookById(bookId);

        let modalContainer = document.importNode(modalTemplate, true).content;

        modalContainer = drawElementConfig(modalContainer, {
            ".modal-title": {
                text: bookData.volumeInfo.title
            },
            ".modal_description": {
                text: bookData.volumeInfo.description
            },
            ".modal_author": {
                text: bookData.volumeInfo.authors.join(', ')
            },
            ".modal_published": {
                text: bookData.volumeInfo.publishedDate
            },
            ".modal_publishers": {
                text: bookData.volumeInfo.publisher
            },
            ".modal_categories": {
                text: bookData.volumeInfo.categories
            },
            ".Pages_Count": {
                text: bookData.volumeInfo.pageCount
            },
            ".more-info-img": {
                attr: {
                    src: bookData.volumeInfo.imageLinks.thumbnail
                }
            },
        });

        let modalElementClose = modalContainer.querySelector('#close');

        modal.innerHTML = '';
        modal.appendChild(modalContainer);

        modalElementClose.addEventListener('click', (event) => {
            modal.innerHTML = "";
            modalBg.classList.remove('active');
            body.classList.remove('modal-active');
        });

    })
}

/*function renderData(data, page = 1) {
    /!**
     * Pagination
     *!/
    let btn_next = document.getElementById("btn_next");
    let btn_prev = document.getElementById("btn_prev");
    let page_span = document.getElementById("page");
    // Validate page
    if (page < 1) page = 1;

    page_span.innerHTML = page;

    if (page > numPages(data)) page = numPages(data);

    if (page == 1) {
        btn_prev.style.visibility = "hidden";
    } else {
        btn_prev.style.visibility = "visible";
    }

    if (page == numPages(data)) {
        btn_next.style.visibility = "hidden";
    } else {
        btn_next.style.visibility = "visible";
    }
}

function prevPage()
{
    if (current_page > 1) {
        current_page--;
        renderData(users, current_page);
    }
}

function nextPage(data = users)
{
    if (current_page < numPages(data)) {
        current_page++;
        renderData(data, current_page);
    }
}

function numPages(data)
{
    return Math.ceil(data.length / records_per_page);
}


page_span.innerHTML = page;*/

/**
 * Utils
 * @param item
 * @param params
 * */
const drawElementConfig = (item, params) => {
    for (let elementClass in params) {
        let elementConfigs = params[elementClass];

        // Устанавливаем текст
        if (elementConfigs.text) {
            item.querySelector(elementClass).innerHTML = elementConfigs.text;
        }

        // Добавьляем атрибутов
        if (elementConfigs.attr) {
            Object.keys(elementConfigs.attr).forEach(attrName => {
                if (elementConfigs.attr[attrName]) {
                    item.querySelector(elementClass).setAttribute(attrName, elementConfigs.attr[attrName]);
                }
            });
        }
    }
    return item;
}