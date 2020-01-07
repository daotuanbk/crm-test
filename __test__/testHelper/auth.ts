import firebase from 'firebase/app';
import 'firebase/auth';
import { config } from '@app/config';

export class Auth {
  static idToken = '';
  static email = 'admin@techkids.edu';
  static password = 'techkidsadmin';
}

interface Account {
  email: string;
  password: string;
}

export async function getIdTokenWith(account: Account) {
  Auth.email = account.email;
  Auth.password = account.password;
  await getIdToken();
}

export async function getIdToken() {
  if (!firebase.apps.length) {
    firebase.initializeApp(config.firebase.client);
  }
  await firebase.auth().signInWithEmailAndPassword(Auth.email, Auth.password);
  Auth.idToken = await firebase.auth().currentUser!.getIdToken();
}
