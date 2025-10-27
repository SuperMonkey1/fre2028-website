import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

class AdminService {
  private collectionName = 'config';
  private docName = 'admin';

  async validatePassword(password: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, this.docName);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const storedPassword = docSnap.data().password;
        return password === storedPassword;
      }
      
      // If no password is set, check against default
      return password === 'fre2028';
    } catch (error) {
      console.error('Error validating password:', error);
      throw new Error('Failed to validate password');
    }
  }
}

export const adminService = new AdminService();
