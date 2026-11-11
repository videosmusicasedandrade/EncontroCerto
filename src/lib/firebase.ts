import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  GoogleAuthProvider, 
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.setCustomParameters({
  prompt: 'select_account'
});

export const googleSignIn = async (): Promise<{ user: User; accessToken: string | undefined } | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    return { 
      user: result.user, 
      accessToken: credential?.accessToken 
    };
  } catch (error: any) {
    console.error('Erro no signInWithPopup:', error?.code, error?.message, error);
    throw error;
  }
};

export const googleSignInRedirect = async (): Promise<void> => {
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error('Erro no signInWithRedirect:', error);
    throw error;
  }
};

export const checkRedirectResult = async (): Promise<{ user: User; accessToken: string | undefined } | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      return { 
        user: result.user, 
        accessToken: credential?.accessToken 
      };
    }
    return null;
  } catch (error) {
    console.warn('Redirect result check:', error);
    return null;
  }
};

export const logout = async () => {
  try {
    await auth.signOut();
  } catch (err) {
    console.warn('Erro no logout do Firebase:', err);
  }
};
