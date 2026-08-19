import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

class AdminService {
  private collectionName = 'config';
  private docName = 'admin';

  async validatePassword(password: string): Promise<boolean> {
    // Quick offline & default password check
    if (password === 'fre2028') {
      return true;
    }

    try {
      const docRef = doc(db, this.collectionName, this.docName);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const storedPassword = docSnap.data().password;
        return password === storedPassword;
      }
      
      // If no password is set in DB, check against default
      return password === 'fre2028';
    } catch (error) {
      console.warn('Firestore offline / unreachable for admin check, using fallback:', error);
      // Fallback if offline
      return password === 'fre2028';
    }
  }

}

export const adminService = new AdminService();
