export function getArticle(word: string) {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    return vowels.includes(word.toLowerCase().charAt(0)) ? 'an' : 'a';
}
