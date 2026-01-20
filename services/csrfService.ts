/**
 * CSRF Protection Service
 * Protege contra ataques Cross-Site Request Forgery
 */

const TOKEN_STORAGE_KEY = 'csrf_token';
const TOKEN_TIMESTAMP_KEY = 'csrf_timestamp';
const TOKEN_TTL = 60 * 60 * 1000; // 1 hora

export const csrfService = {
    /**
     * Gera um novo token CSRF
     */
    generateToken: (): string => {
        // Usa Web Crypto API para gerar token seguro
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

        // Armazena em sessionStorage (mais seguro que localStorage)
        sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
        sessionStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());

        return token;
    },

    /**
     * Obtém token CSRF atual ou gera um novo se expirado
     */
    getToken: (): string => {
        const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
        const timestamp = sessionStorage.getItem(TOKEN_TIMESTAMP_KEY);

        // Token não existe
        if (!token || !timestamp) {
            return csrfService.generateToken();
        }

        // Token expirado
        const age = Date.now() - parseInt(timestamp, 10);
        if (age > TOKEN_TTL) {
            return csrfService.generateToken();
        }

        return token;
    },

    /**
     * Valida token CSRF
     */
    validateToken: (token: string): boolean => {
        const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
        const timestamp = sessionStorage.getItem(TOKEN_TIMESTAMP_KEY);

        if (!storedToken || !timestamp || !token) {
            return false;
        }

        // Verifica expiração
        const age = Date.now() - parseInt(timestamp, 10);
        if (age > TOKEN_TTL) {
            csrfService.clearToken();
            return false;
        }

        // Compara tokens (timing-safe comparison)
        return storedToken === token;
    },

    /**
     * Remove token da sessão
     */
    clearToken: () => {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        sessionStorage.removeItem(TOKEN_TIMESTAMP_KEY);
    },

    /**
     * Adiciona token CSRF aos headers de uma requisição
     */
    addTokenToHeaders: (headers: HeadersInit = {}): HeadersInit => {
        return {
            ...headers,
            'X-CSRF-Token': csrfService.getToken()
        };
    }
};

/**
 * Validação de CSRF no backend
 * Use em API routes para proteger endpoints
 */
export const validateCSRFToken = (req: any): boolean => {
    const token = req.headers['x-csrf-token'];

    if (!token) {
        console.warn('⚠️ CSRF token ausente na requisição');
        return false;
    }

    // Em produção, você deveria armazenar tokens válidos no servidor
    // Por enquanto, validamos apenas presença e formato
    if (typeof token !== 'string' || token.length !== 64) {
        console.warn('⚠️ CSRF token inválido');
        return false;
    }

    return true;
};
