import firebase from 'firebase/app';
import 'firebase/auth';
import { config } from '@app/config';

export const getIdToken = async () => {
  if (!firebase.apps.length) {
    firebase.initializeApp(config.firebase.client);
  }

  await firebase.auth().signInWithEmailAndPassword('admin@techkids.edu', 'techkidsadmin');
  const idToken = await firebase.auth().currentUser!.getIdToken();
  return idToken;
};
