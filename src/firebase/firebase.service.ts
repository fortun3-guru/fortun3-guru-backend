import { Inject, Injectable } from '@nestjs/common';
import { app, firestore } from 'firebase-admin';
import { Auth } from 'firebase-admin/lib/auth/auth';

@Injectable()
export class FirebaseService {
  auth: Auth;
  firestore: firestore.Firestore;

  constructor(@Inject('FIREBASE_APP') private firebaseApp: app.App) {
    this.auth = firebaseApp.auth();
    this.firestore = firebaseApp.firestore();
    this.firestore.settings({
      ignoreUndefinedProperties: true,
    });
  }
}
