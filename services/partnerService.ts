import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, orderBy } from 'firebase/firestore';
import { Partner } from '../types/partner';

class PartnerService {
  private collectionName = 'partners';

  async getAllPartners(): Promise<Partner[]> {
    try {
      const partnersRef = collection(db, this.collectionName);
      const q = query(partnersRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as Partner));
    } catch (error) {
      console.error('Error fetching partners:', error);
      throw new Error('Failed to fetch partners');
    }
  }

  async getPartnerById(id: string): Promise<Partner | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate(),
        } as Partner;
      }
      return null;
    } catch (error) {
      console.error('Error fetching partner:', error);
      throw new Error('Failed to fetch partner');
    }
  }

  async createPartner(partner: Omit<Partner, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...partner,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating partner:', error);
      throw new Error('Failed to create partner');
    }
  }

  async updatePartner(id: string, partner: Partial<Partner>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...partner,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating partner:', error);
      throw new Error('Failed to update partner');
    }
  }

  async deletePartner(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting partner:', error);
      throw new Error('Failed to delete partner');
    }
  }
}

export const partnerService = new PartnerService();
