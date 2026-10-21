/**
 * O react-pdf só quebra linha entre palavras: uma sequência longa sem espaço
 * ("AAAA...", um código colado) atravessaria a página. Palavras longas viram
 * letras soltas, que podem quebrar em qualquer ponto; as curtas ficam inteiras.
 */
export function breakLongWords(word: string) {
  return word.length > 20 ? Array.from(word) : [word]
}
