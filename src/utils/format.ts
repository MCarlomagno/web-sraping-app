import { Category } from "../enum/category.enum";



export const getBrandName = (brand: string) => {
    const brands: Record<string, string> = {
        'hudabeauty': 'Huda Beauty',
        'chiaraferragni': 'Chiara Ferragni',
        'farfetch': 'Farfetch',
        'riverIsland': 'River Island',
        'maxmara': 'Max Mara',
        'steveMadden': 'Steve Madden',
        'bershka': 'Bershka',
        'fendi': 'Fendi'
    }
    const name = brands[brand];
    return name;
}

export const getCategoryName = (category: Category) => {
    const categories: Record<Category, string> = {
        'skirts': 'Skirts',
        'tops': 'Tops',
        'pants': 'Pants',
        'dresses': 'Dresses',
        'blazers': 'Blazers',
        'accessories': 'Accessories',
        'outwear': 'Outwear',
        'knitwear': 'Knitwear',
        'shoes': 'Shoes',
        'jeans': 'Jeans',
        'beauty': 'Other Details'
    }
    const name = categories[category];
    return name;
}
