import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AdminPasswordModal, useAdminShortcut } from '../components/AdminPasswordModal'
import { useEffect } from 'react'
import { analytics } from '@/lib/firebase'

export default function App({ Component, pageProps }: AppProps) {
  const { isModalOpen, setIsModalOpen } = useAdminShortcut();

  // Initialize Google Analytics
  useEffect(() => {
    if (analytics) {
      console.log('Google Analytics initialized');
    }
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <AdminPasswordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
