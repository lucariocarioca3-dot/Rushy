/**
 * Utilitário de comparação de senhas que não depende do bcryptjs no cliente
 * O bcryptjs pode ter problemas de empacotamento no Vite
 * Solução: Usar comparação simples no cliente e deixar a criptografia real para o servidor
 */

/**
 * Verifica se uma senha é um hash bcrypt (começa com $2a, $2b ou $2y)
 */
export function isBcryptHash(hash: string): boolean {
  if (!hash || typeof hash !== 'string') return false;
  return /^\$2[aby]\$/.test(hash);
}

/**
 * Comparação segura de senhas
 * No cliente, apenas fazemos comparação direta
 * A validação real de hash bcrypt deve ser feita no servidor
 */
export async function comparePassword(plainPassword: string, storedPassword: string): Promise<boolean> {
  try {
    // Se a senha armazenada é um hash bcrypt, não conseguimos validar no cliente
    // Então retornamos false para forçar a validação no servidor
    if (isBcryptHash(storedPassword)) {
      // Tentar usar bcryptjs se disponível
      try {
        const bcryptModule = await import('bcryptjs');
        // Acessar a função compare corretamente (pode estar em default ou diretamente)
        const bcrypt = bcryptModule.default || bcryptModule;
        const compareFunc = bcrypt.compare || (bcryptModule.default && bcryptModule.default.compare);
        
        if (compareFunc && typeof compareFunc === 'function') {
          return await compareFunc(plainPassword, storedPassword);
        }
      } catch (e) {
        console.warn('bcryptjs não disponível, usando comparação direta:', e);
      }
      // Se bcryptjs não funcionar, retornar false
      // A autenticação real deve ser feita no servidor
      return false;
    }
    
    // Se não é hash, comparar como texto puro
    return plainPassword === storedPassword;
  } catch (error) {
    console.error('Erro ao comparar senha:', error);
    // Em caso de erro, retornar false por segurança
    return false;
  }
}

/**
 * Função auxiliar para criar hash (não usada no cliente, apenas para referência)
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const bcryptModule = await import('bcryptjs');
    // Acessar a função hash corretamente (pode estar em default ou diretamente)
    const bcrypt = bcryptModule.default || bcryptModule;
    const hashFunc = bcrypt.hash || (bcryptModule.default && bcryptModule.default.hash);
    
    if (hashFunc && typeof hashFunc === 'function') {
      return await hashFunc(password, 10);
    }
  } catch (e) {
    console.warn('bcryptjs não disponível para hash:', e);
  }
  // Fallback: retornar a senha em texto puro (não recomendado para produção)
  return password;
}
