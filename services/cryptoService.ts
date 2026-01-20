/**
 * Crypto Service
 * Criptografia AES-GCM para proteção de dados no localStorage
 * Usa Web Crypto API (padrão moderno do navegador)
 */

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-dev-key-change-in-production';
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

/**
 * Deriva chave criptográfica a partir de senha
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt as BufferSource,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: ALGORITHM, length: KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
    );
}

export const cryptoService = {
    /**
     * Criptografa dados usando AES-GCM
     * @param data - Dados a serem criptografados
     * @returns String Base64 contendo salt + iv + dados criptografados
     */
    encrypt: async (data: string): Promise<string> => {
        try {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);

            // Gera salt e IV aleatórios
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));

            // Deriva chave a partir da senha
            const key = await deriveKey(ENCRYPTION_KEY, salt);

            // Criptografa
            const encryptedBuffer = await crypto.subtle.encrypt(
                { name: ALGORITHM, iv },
                key,
                dataBuffer
            );

            // Combina salt + iv + dados criptografados
            const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
            combined.set(salt, 0);
            combined.set(iv, salt.length);
            combined.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);

            // Converte para Base64
            return btoa(String.fromCharCode(...combined));
        } catch (error) {
            console.error('Erro ao criptografar:', error);
            throw new Error('Falha na criptografia');
        }
    },

    /**
     * Descriptografa dados
     * @param encryptedData - String Base64 com dados criptografados
     * @returns Dados originais descriptografados
     */
    decrypt: async (encryptedData: string): Promise<string> => {
        try {
            // Decodifica Base64
            const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

            // Extrai salt, IV e dados criptografados
            const salt = combined.slice(0, 16);
            const iv = combined.slice(16, 28);
            const data = combined.slice(28);

            // Deriva chave
            const key = await deriveKey(ENCRYPTION_KEY, salt);

            // Descriptografa
            const decryptedBuffer = await crypto.subtle.decrypt(
                { name: ALGORITHM, iv },
                key,
                data
            );

            // Converte para string
            const decoder = new TextDecoder();
            return decoder.decode(decryptedBuffer);
        } catch (error) {
            console.error('Erro ao descriptografar:', error);
            throw new Error('Falha na descriptografia');
        }
    },

    /**
     * Criptografa objeto JSON
     */
    encryptJSON: async <T>(obj: T): Promise<string> => {
        const json = JSON.stringify(obj);
        return cryptoService.encrypt(json);
    },

    /**
     * Descriptografa objeto JSON
     */
    decryptJSON: async <T>(encryptedData: string): Promise<T> => {
        const json = await cryptoService.decrypt(encryptedData);
        return JSON.parse(json);
    },

    /**
     * Armazena dados criptografados no localStorage
     */
    setSecureItem: async (key: string, value: any): Promise<void> => {
        const encrypted = await cryptoService.encryptJSON(value);
        localStorage.setItem(key, encrypted);
    },

    /**
     * Recupera dados criptografados do localStorage
     */
    getSecureItem: async <T>(key: string): Promise<T | null> => {
        const encrypted = localStorage.getItem(key);
        if (!encrypted) return null;

        try {
            return await cryptoService.decryptJSON<T>(encrypted);
        } catch (error) {
            console.error('Erro ao ler item seguro:', error);
            // Remove item corrompido
            localStorage.removeItem(key);
            return null;
        }
    }
};
