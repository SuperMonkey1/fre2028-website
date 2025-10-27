import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { adminService } from '../services/adminService';
import { useRouter } from 'next/router';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsValidating(true);

    try {
      const isValid = await adminService.validatePassword(password);
      
      if (isValid) {
        // Store in session storage
        sessionStorage.setItem('admin_authenticated', 'true');
        onClose();
        router.push('/admin');
      } else {
        setError('Incorrect password');
        setPassword('');
      }
    } catch (err) {
      setError('Error validating password. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white max-w-md w-full p-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-black transition-colors"
          disabled={isValidating}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-8">
          <h3 className="text-3xl font-bold tracking-tighter mb-3">
            Admin Access
          </h3>
          <p className="text-zinc-600">
            Enter password to access admin panel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3 px-4 bg-zinc-50 border border-zinc-200 focus:border-black focus:outline-none transition-colors text-lg"
              placeholder="Enter admin password"
              disabled={isValidating}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-sm font-medium p-3 border bg-red-50 text-red-800 border-red-200">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full inline-flex items-center justify-center text-sm font-semibold tracking-wide transition-all duration-200 h-12 px-8 bg-black text-white hover:bg-zinc-800 disabled:opacity-50"
            disabled={isValidating || !password}
          >
            {isValidating ? 'Validating...' : 'Enter Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const useAdminShortcut = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+A
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isModalOpen, setIsModalOpen };
};
