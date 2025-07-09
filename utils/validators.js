/**
 * Validadores específicos para Angola
 */

/**
 * Valida NIP (Número de Identificação Pessoal) angolano
 * Formato: 14 dígitos (AAAAMMDDSSSSSC)
 * AAAA = Ano nascimento
 * MM = Mês nascimento  
 * DD = Dia nascimento
 * SSSSS = Número sequencial
 * C = Dígito de controle
 */
const validarNIP = (nip) => {
  // Remover espaços e caracteres especiais
  const nipLimpo = nip.toString().replace(/[^0-9]/g, '');
  
  // Verificar se tem 7 ou mais dígitos
  if (nipLimpo.length < 7) {
    return false;
  }

  // Garantir que são apenas dígitos
  if (!/^[0-9]+$/.test(nipLimpo)) {
    return false;
  }

  return true;
};

/**
 * Valida Bilhete de Identidade angolano
 * Formato pode variar, mas geralmente: 
 * - Formato antigo: 8-9 dígitos + letra
 * - Formato novo: Variações com letras e números
 */
const validarBI = (bi) => {
  // Remover espaços e converter para maiúscula
  const biLimpo = bi.toString().trim().toUpperCase();
  
  // Verificar se não está vazio
  if (!biLimpo || biLimpo.length < 6) {
    return false;
  }

  // Padrões aceitos para BI angolano
  const padroes = [
    /^[0-9]{8,9}[A-Z]{1,2}[0-9]{2}$/, // Formato: 123456789LA22 (8 ou 9 dígitos, 1 ou 2 letras, 2 dígitos)
    /^[0-9]{6,9}[A-Z]$/, // Formato antigo: 12345678A (6-9 dígitos, 1 letra)
    /^[A-Z]{2}[0-9]{6,8}[A-Z]$/, // Formato: LA1234567B (2 letras, 6-8 dígitos, 1 letra)
    /^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/, // Formato com pontos: 123.456.789-12
    /^[0-9]{9}[A-Z]{2}[0-9]{3}$/  // Novo formato: 009372792LA045 (9 dígitos, 2 letras, 3 dígitos)
  ];

  // Verificar se corresponde a algum padrão
  const valido = padroes.some(padrao => padrao.test(biLimpo));
  
  if (!valido) {
    return false;
  }

  // Verificações adicionais específicas
  
  // Não pode ser sequência repetitiva
  if (/^(.)\1+$/.test(biLimpo.replace(/[^0-9A-Z]/g, ''))) {
    return false;
  }

  // Deve ter pelo menos alguns números
  const temNumeros = /[0-9]/.test(biLimpo);
  if (!temNumeros) {
    return false;
  }

  return true;
};

/**
 * Valida número de telefone angolano
 * Formatos aceitos:
 * - +244 9XX XXX XXX
 * - 9XX XXX XXX
 * - 244 9XX XXX XXX
 */
const validarTelefoneAngolano = (telefone) => {
  const telefoneLimpo = telefone.toString().replace(/[^0-9]/g, '');
  
  // Padrões de telefone angolano
  const padroes = [
    /^244[9][0-9]{8}$/, // +244 9XX XXX XXX
    /^[9][0-9]{8}$/, // 9XX XXX XXX
    /^244[2][0-9]{7}$/, // Fixo Luanda
  ];

  return padroes.some(padrao => padrao.test(telefoneLimpo));
};

/**
 * Valida coordenadas GPS para Luanda
 * Luanda está aproximadamente entre:
 * Latitude: -9.5 a -8.5
 * Longitude: 12.8 a 13.8
 */
const validarCoordendasLuanda = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  
  // Verificar se são números válidos
  if (isNaN(latitude) || isNaN(longitude)) {
    return false;
  }

  // Verificar se estão dentro dos limites de Luanda (com margem)
  const latMin = -9.8;
  const latMax = -8.3;
  const lngMin = 12.5;
  const lngMax = 14.0;

  return latitude >= latMin && latitude <= latMax && 
         longitude >= lngMin && longitude <= lngMax;
};

/**
 * Formatar NIP para exibição
 * Entrada: 20001231123456
 * Saída: 2000-12-31-12345-6
 */
const formatarNIP = (nip) => {
  const nipLimpo = nip.toString().replace(/[^0-9]/g, '');
  if (nipLimpo.length !== 14) {
    return nip; // Retorna original se não for válido
  }
  
  return `${nipLimpo.substring(0, 4)}-${nipLimpo.substring(4, 6)}-${nipLimpo.substring(6, 8)}-${nipLimpo.substring(8, 13)}-${nipLimpo.substring(13, 14)}`;
};

/**
 * Formatar telefone angolano
 * Entrada: 244912345678
 * Saída: +244 912 345 678
 */
const formatarTelefone = (telefone) => {
  const telefoneLimpo = telefone.toString().replace(/[^0-9]/g, '');
  
  if (telefoneLimpo.startsWith('244') && telefoneLimpo.length === 12) {
    return `+244 ${telefoneLimpo.substring(3, 6)} ${telefoneLimpo.substring(6, 9)} ${telefoneLimpo.substring(9, 12)}`;
  } else if (telefoneLimpo.startsWith('9') && telefoneLimpo.length === 9) {
    return `+244 ${telefoneLimpo.substring(0, 3)} ${telefoneLimpo.substring(3, 6)} ${telefoneLimpo.substring(6, 9)}`;
  }
  
  return telefone; // Retorna original se não conseguir formatar
};

module.exports = {
  validarNIP,
  validarBI,
  validarTelefoneAngolano,
  validarCoordendasLuanda,
  formatarNIP,
  formatarTelefone
}; 