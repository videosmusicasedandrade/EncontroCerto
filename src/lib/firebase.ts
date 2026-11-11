import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');

export const googleSignIn = async (): Promise<{ user: User; accessToken: string | undefined } | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    return { 
      user: result.user, 
      accessToken: credential?.accessToken 
    };
  } catch (error: any) {
    console.error('Erro no login Google:', error);
    throw error;
  }
};

export const logout = async () => {
  await auth.signOut();
};
