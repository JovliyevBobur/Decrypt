import CryptoJS from 'crypto-js';

// Caesar Cipher - shifts each letter by a specified amount
export function caesarEncrypt(text: string, shift: number): string {
  return text.split('').map(char => {
    if (char.match(/[a-z]/i)) {
      const code = char.charCodeAt(0);
      const isUpperCase = code >= 65 && code <= 90;
      const base = isUpperCase ? 65 : 97;
      // Normalize shift to positive value within 0-25
      const normalizedShift = ((shift % 26) + 26) % 26;
      return String.fromCharCode(((code - base + normalizedShift) % 26) + base);
    }
    return char;
  }).join('');
}

export function caesarDecrypt(text: string, shift: number): string {
  return caesarEncrypt(text, -shift);
}

// Vigenère Cipher - uses a keyword for polyalphabetic substitution
export function vigenereEncrypt(text: string, key: string): string {
  if (!key) return text;
  const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
  if (!normalizedKey) return text;
  
  let keyIndex = 0;
  return text.split('').map(char => {
    if (char.match(/[a-z]/i)) {
      const code = char.charCodeAt(0);
      const isUpperCase = code >= 65 && code <= 90;
      const base = isUpperCase ? 65 : 97;
      const shift = normalizedKey.charCodeAt(keyIndex % normalizedKey.length) - 97;
      keyIndex++;
      return String.fromCharCode(((code - base + shift) % 26) + base);
    }
    return char;
  }).join('');
}

export function vigenereDecrypt(text: string, key: string): string {
  if (!key) return text;
  const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
  if (!normalizedKey) return text;
  
  let keyIndex = 0;
  return text.split('').map(char => {
    if (char.match(/[a-z]/i)) {
      const code = char.charCodeAt(0);
      const isUpperCase = code >= 65 && code <= 90;
      const base = isUpperCase ? 65 : 97;
      const shift = normalizedKey.charCodeAt(keyIndex % normalizedKey.length) - 97;
      keyIndex++;
      return String.fromCharCode(((code - base - shift + 26) % 26) + base);
    }
    return char;
  }).join('');
}

// AES Encryption - password-based symmetric encryption
export function aesEncrypt(text: string, password: string): string {
  if (!password) throw new Error('Password is required for AES encryption');
  return CryptoJS.AES.encrypt(text, password).toString();
}

export function aesDecrypt(ciphertext: string, password: string): string {
  if (!password) throw new Error('Password is required for AES decryption');
  const bytes = CryptoJS.AES.decrypt(ciphertext, password);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  if (!decrypted && ciphertext) throw new Error('Invalid password or corrupted data');
  return decrypted;
}

// Base64 encoding/decoding
export function base64Encode(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}

export function base64Decode(text: string): string {
  try {
    return decodeURIComponent(escape(atob(text)));
  } catch {
    throw new Error('Invalid Base64 string');
  }
}

// Morse Code mapping
const morseCodeMap: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', ' ': '/', '.': '.-.-.-', ',': '--..--',
  '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.',
  ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
  '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-',
  '@': '.--.-.'
};

const reverseMorseMap = Object.fromEntries(
  Object.entries(morseCodeMap).map(([k, v]) => [v, k])
);

export function textToMorse(text: string): string {
  return text.toUpperCase().split('').map(char => {
    return morseCodeMap[char] || char;
  }).join(' ');
}

export function morseToText(morse: string): string {
  return morse.split(' ').map(code => {
    if (code === '/') return ' ';
    return reverseMorseMap[code] || code;
  }).join('');
}

// Encryption method types
export type EncryptionMethod = 'caesar' | 'vigenere' | 'aes' | 'base64' | 'morse';

export interface EncryptionConfig {
  name: string;
  description: string;
  requiresKey: boolean;
  keyLabel: string;
  keyPlaceholder: string;
  keyType?: 'text' | 'number';
}

export const encryptionMethods: Record<EncryptionMethod, EncryptionConfig> = {
  caesar: {
    name: 'Caesar Cipher',
    description: 'Shifts each letter by a fixed number of positions',
    requiresKey: true,
    keyLabel: 'Shift Amount',
    keyPlaceholder: 'Enter shift (1-25)',
    keyType: 'number'
  },
  vigenere: {
    name: 'Vigenère Cipher',
    description: 'Uses a keyword for polyalphabetic substitution',
    requiresKey: true,
    keyLabel: 'Keyword',
    keyPlaceholder: 'Enter keyword',
    keyType: 'text'
  },
  aes: {
    name: 'AES Encryption',
    description: 'Strong symmetric encryption using a password',
    requiresKey: true,
    keyLabel: 'Password',
    keyPlaceholder: 'Enter password',
    keyType: 'text'
  },
  base64: {
    name: 'Base64',
    description: 'Encodes binary data as ASCII text',
    requiresKey: false,
    keyLabel: '',
    keyPlaceholder: ''
  },
  morse: {
    name: 'Morse Code',
    description: 'Converts text to dots and dashes',
    requiresKey: false,
    keyLabel: '',
    keyPlaceholder: ''
  }
};
