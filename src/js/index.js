import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Like from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

const state = {};

// SEARCH CONTROLLER
const controlSearch = async () => {
    // Get query from view
    // const query = searchView.getInput();
    const query = 'pizza';

    if (query) {
        // New search object and add it to state
        state.search = new Search(query);

        try {
            // Prepare UI for results
            searchView.clearInput();
            searchView.clearResults();
            renderLoader(elements.searchResults);

            // Search for recipes
            await state.search.getResults(query);

            // Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (error) {
            alert('Something went wrong with the search');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

// Testing
window.addEventListener('load', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResultsPages.addEventListener('click', e => {
    const button = e.target.closest('.btn-inline');

    if (button) {
        const goToPage = parseInt(button.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
})

// RECIPE CONTROLLER
const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');

    if (id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if (state.search) { searchView.highlightSelected(id) };

        // Create new recipe object
        state.recipe = new Recipe(id);

        try {
            // Get recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calculate servings and time
            state.recipe.calculateTime();
            state.recipe.calculateServings();

            // Render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        } catch (error) {
            alert('Error processing recipe');
        }
    }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// Handling recipe button clicks
elements.recipe.addEventListener('click', element => {
    if (element.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (element.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (element.target.matches('.recipe__btn-add, .recipe__btn-add *')) {
        // Add ingredients to shopping list
        controlList();
    } else if (element.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});

// List Controller
const controlList = () => {
    // Create a new list IF there is none yet
    if (!state.list) { state.list = new List(); }

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(ingredient => {
        const item = state.list.addItem(
            ingredient.count,
            ingredient.unit,
            ingredient.ingredient
        );
        listView.renderItem(item);
    });
};

// Handle delete and update list item events
elements.shopping.addEventListener('click', element => {
    const id = element.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (element.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

        // Handle the count event
    } else if (element.target.matches('.shopping__count-value')) {
        const val = parseFloat(element.target.value);
        state.list.updateCount(id, val);
    }
});

// Like controller
const controlLike = () => {
    if (!state.likes) { state.likes = new Like(); }

    const id = state.recipe.id;
    if (state.likes.isLiked(id)) {
        // Remove like from the state
        state.likes.deleteLike(id);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(id);
    } else {
        // Add like to the state
        const like = state.likes.addLike(
            id,
            state.recipe.title,
            state.recipe.author,
            state.recipe.image,
        );

        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to UI list
        likesView.renderLike(like);
    }
    likesView.toggleLikeMenu(state.likes.getNumberOfLikes());
};

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Like();
    state.likes.readStorage();
    state.likes.likes.forEach(like => { likesView.renderLike(like) });

    likesView.toggleLikeMenu(state.likes.getNumberOfLikes());
});