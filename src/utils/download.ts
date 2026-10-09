/**
 * Salva um Blob como arquivo no computador do usuário. Necessário para rotas
 * autenticadas: um <a href> direto não levaria o Bearer token.
 */
export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Revoga depois do clique: alguns navegadores ainda leem a URL nesse tick.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
