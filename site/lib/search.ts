/**
 * What the search boxes look through. Pure, with no Node imports, so the islands (browser) and the
 * page code that builds each row's text (build time) read a name the same way.
 *
 * The data spells names with hyphens, ampersands and typographic apostrophes ("Play-Action Deep Over",
 * "Wide-9 & Match", "Kevin O’Connell"). People type "play action", "wide 9 and match" and "oconnell".
 * Both sides go through `searchKey`, so those meet in the middle.
 */
export function searchKey(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents
    .toLowerCase()
    .replace(/['’‘`]/g, '') // O'Connell and Bowles’s read as one word
    .replace(/&/g, ' and ')
    .replace(/(?<!\d)\.|\.(?!\d)/g, ' ') // a full stop ends a word, a decimal point (1.2) does not
    .replace(/[^a-z0-9.]+/g, ' ') // hyphens, slashes, brackets and the like
    .trim();
}
