import { elements } from './base';

export const getInput = () => elements.searchInput.value;

export const renderResults = (recipes, page = 1, resultsPerPage = 10) => {
    // Render results of current page
    const start = (page - 1) * resultsPerPage;
    const end = page * resultsPerPage;

    recipes.slice(start, end).forEach(renderRecipe);
    
    // Render pagination buttons
    renderButtons(page, recipes.length, resultsPerPage);
};

const renderRecipe = recipe => {
    const markup = `
        <li>
            <a class="results__link results__link--active" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${recipe.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;

    elements.searchResultList.insertAdjacentHTML('beforeend', markup);
};

const renderButtons = (page, numberOfResults, resultsPerPage) => {
    const pages = Math.ceil(numberOfResults / resultsPerPage);

    let button;
    if(page === 1 && pages > 1) {
        // Button to go to next page
        button = createButton(page, 'next');
    } else if(page < pages) {
        // Both buttons
        button = `
            ${createButton(page, 'next')}
            ${createButton(page, 'prev')}
        `;
    } else if (page === pages && pages > 1) {
        // Only button to go to prev page
        button = createButton(page, 'prev');
    }

    elements.searchResultsPages.insertAdjacentHTML('afterbegin', button);
}

// type: 'prev' or 'next
const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>
`;

const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if(title.length > limit) {
        title.split(' ').reduce((acc, cur) => {
            if (acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0);
    }
    return `${newTitle.join(' ')} ...`;
}

export const clearInput = () => {
    elements.searchInput.value = '';
};

export const clearResults = () => {
    elements.searchResultList.innerHTML = '';
    elements.searchResultsPages.innerHTML = '';
};