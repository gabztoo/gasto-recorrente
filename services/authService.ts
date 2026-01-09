import { User } from '../types';
import { 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider, isFirebaseConfigured } from './firebaseConfig';

const USER_STORAGE_KEY = 'subdetector_user_session';

// Mapeia usuário Firebase para nosso tipo User
const mapFirebaseUser = (firebaseUser: FirebaseUser, provider: 'google' | 'facebook'): User => {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || 'Usuário',
    email: firebaseUser.email || '',
    avatar: firebaseUser.photoURL || 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
    provider
  };
};

// Fallback para modo de desenvolvimento (quando Firebase não está configurado)
const createDemoUser = (provider: 'google' | 'facebook'): User => {
  return {
    id: crypto.randomUUID(),
    name: 'Usuário Demo',
    email: 'demo@gastorecorrente.com',
    avatar: provider === 'google' 
      ? 'https://cdn-icons-png.flaticon.com/512/300/300221.png'
      : 'https://cdn-icons-png.flaticon.com/512/124/124010.png',
    provider
  };
};

export const authService = {
  /**
   * Login com Google via Firebase Auth
   */
  loginWithGoogle: async (): Promise<User> => {
    // Se Firebase não está configurado, usa modo demo
    if (!isFirebaseConfigured() || !auth) {
      console.log('Firebase não configurado. Usando modo demo.');
      const user = createDemoUser('google');
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return user;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = mapFirebaseUser(result.user, 'google');
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return user;
    } catch (error: any) {
      console.error('Erro no login Google:', error);
      
      // Se o popup foi bloqueado ou houve erro, tenta modo demo
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        throw new Error('Popup bloqueado. Permita popups para este site.');
      }
      
      // Fallback para modo demo em caso de erro
      const user = createDemoUser('google');
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return user;
    }
  },

  /**
   * Login com Facebook via Firebase Auth
   */
  loginWithFacebook: async (): Promise<User> => {
    // Se Firebase não está configurado, usa modo demo
    if (!isFirebaseConfigured() || !auth) {
      console.log('Firebase não configurado. Usando modo demo.');
      const user = createDemoUser('facebook');
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return user;
    }

    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = mapFirebaseUser(result.user, 'facebook');
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return user;
    } catch (error: any) {
      console.error('Erro no login Facebook:', error);
      
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        throw new Error('Popup bloqueado. Permita popups para este site.');
      }
      
      // Fallback para modo demo
      const user = createDemoUser('facebook');
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return user;
    }
  },

  /**
   * Logout do usuário
   */
  logout: async () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    
    if (isFirebaseConfigured() && auth) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Erro no logout Firebase:', error);
      }
    }
  },

  /**
   * Retorna o usuário atual da sessão local
   */
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  /**
   * Verifica se autenticação real está disponível
   */
  isRealAuthAvailable: (): boolean => {
    return isFirebaseConfigured();
  },

  /**
   * Observa mudanças no estado de autenticação
   */
  onAuthStateChange: (callback: (user: User | null) => void) => {
    if (isFirebaseConfigured() && auth) {
      return onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const provider = firebaseUser.providerData[0]?.providerId === 'facebook.com' 
            ? 'facebook' as const 
            : 'google' as const;
          const user = mapFirebaseUser(firebaseUser, provider);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
          callback(user);
        } else {
          callback(null);
        }
      });
    }
    return () => {}; // Unsubscribe vazio se Firebase não disponível
  }
};