import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AdminPasswordModal, useAdminShortcut } from '../components/AdminPasswordModal'

export default function App({ Component, pageProps }: AppProps) {
  const { isModalOpen, setIsModalOpen } = useAdminShortcut();

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
