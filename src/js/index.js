import Search from './models/Search';
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from './views/base';

const state = {};

const controlSearch = async () => {
    // Get query from view
    const query = searchView.getInput();

    if (query) {
        // New search object and add it to state
        state.search = new Search(query);

        // Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchResults);

        // Search for recipes
        await state.search.getResults(query);

        // Render results on UI
        clearLoader();
        searchView.renderResults(state.search.result);
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});