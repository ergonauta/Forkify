import axios from 'axios';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);

            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.image = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        } catch (error) {
            console.log(error);
            alert('Recipe not found');
        }
    }

    calculateTime() {
        // Assuming that we need 15 min for each 3 ingredients
        const ingredientsNumber = this.ingredients.length;
        const periods = Math.ceil(ingredientsNumber / 3);
        this.time = periods * 15;
    }

    calculateServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];

        const newIngredients = this.ingredients.map(element => {
            // 1. Uniform units
            let ingredient = element.toLowerCase();
            unitsLong.forEach((unit, index) => {
                ingredient = ingredient.replace(unit, unitsShort[index]);
            });

            // 2. Remove parentheses
            ingredient = ingredient.replace(/ *\([^]*\) */g, ' ')

            // 3. Parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(ing => unitsShort.includes(ing));

            let objectIngredient;
            if (unitIndex > -1) {
                // There is a unit
                // Ex. 4 1/2 cups, arrCount is is [4, 1/2] -> eval('4+1/2') -> 4.5
                // Ex, 4 cups, arrCount is [4]
                const arrCount = arrIng.slice(0, unitIndex);

                let count;
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objectIngredient = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }
            } else if (parseInt(arrIng[0], 10)) {
                // there is NO unit, but first element is number
                objectIngredient = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                };
            } else if (unitIndex === -1) {
                // There is NO unit and NO number in first position
                objectIngredient = {
                    count: 1,
                    unit: '',
                    ingredient
                };
            }

            return objectIngredient;
        });
        this.ingredients = newIngredients;
    }
}