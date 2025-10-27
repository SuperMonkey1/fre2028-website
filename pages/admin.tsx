import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Mountain, Plus, Edit, Trash2, X, Upload, ExternalLink } from 'lucide-react';
import { Partner } from '../types/partner';
import { partnerService } from '../services/partnerService';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState<Partial<Partner>>({
    name: '',
    category: 'Financiële Partner',
    description: '',
    imageUrl: '',
    website: '',
    socials: {
      instagram: '',
      linkedin: '',
      facebook: '',
      twitter: '',
      youtube: '',
    },
    order: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_authenticated');
    if (auth !== 'true') {
      router.push('/');
    } else {
      setIsAuthenticated(true);
      loadPartners();
    }
  }, [router]);

  const loadPartners = async () => {
    try {
      setIsLoading(true);
      const data = await partnerService.getAllPartners();
      setPartners(data);
    } catch (err) {
      setError('Failed to load partners');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const filename = `partners/${timestamp}_${file.name}`;
    const storageRef = ref(storage, filename);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let imageUrl = formData.imageUrl || '';

      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const partnerData: Partial<Partner> = {
        ...formData,
        imageUrl,
      };

      if (editingPartner?.id) {
        await partnerService.updatePartner(editingPartner.id, partnerData);
        setSuccess('Partner updated successfully');
      } else {
        await partnerService.createPartner(partnerData as Omit<Partner, 'id'>);
        setSuccess('Partner created successfully');
      }

      await loadPartners();
      closeModal();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save partner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      category: partner.category,
      description: partner.description,
      imageUrl: partner.imageUrl,
      website: partner.website || '',
      socials: partner.socials || {
        instagram: '',
        linkedin: '',
        facebook: '',
        twitter: '',
        youtube: '',
      },
      order: partner.order || 0,
    });
    setImagePreview(partner.imageUrl);
    setIsModalOpen(true);
  };

  const handleDelete = async (partner: Partner) => {
    if (!confirm(`Are you sure you want to delete ${partner.name}?`)) {
      return;
    }

    try {
      await partnerService.deletePartner(partner.id!);
      setSuccess('Partner deleted successfully');
      await loadPartners();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete partner');
    }
  };

  const openModal = () => {
    setEditingPartner(null);
    setFormData({
      name: '',
      category: 'Financiële Partner',
      description: '',
      imageUrl: '',
      website: '',
      socials: {
        instagram: '',
        linkedin: '',
        facebook: '',
        twitter: '',
        youtube: '',
      },
      order: 0,
    });
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPartner(null);
    setImageFile(null);
    setImagePreview('');
    setError('');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    router.push('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Head>
        <title>Admin Panel - Partner Management</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mountain className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="text-sm font-medium text-zinc-600 hover:text-black transition-colors"
            >
              View Site
            </button>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-zinc-600 hover:text-black transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Partners</h2>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold hover:bg-zinc-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Partner
          </button>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800">
            {success}
          </div>
        )}
        {error && !isModalOpen && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800">
            {error}
          </div>
        )}

        {/* Partners List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-zinc-300 border-t-black rounded-full animate-spin"></div>
            <p className="mt-4 text-zinc-600">Loading partners...</p>
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center py-12 bg-white border border-zinc-200">
            <p className="text-zinc-600 mb-4">No partners yet</p>
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold hover:bg-zinc-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Partner
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white border border-zinc-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-zinc-100 flex-shrink-0 overflow-hidden">
                    {partner.imageUrl ? (
                      <img
                        src={partner.imageUrl}
                        alt={partner.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="inline-block px-2 py-1 text-xs font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 mb-2">
                          {partner.category}
                        </span>
                        <h3 className="text-2xl font-bold">{partner.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(partner)}
                          className="p-2 hover:bg-zinc-100 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(partner)}
                          className="p-2 hover:bg-red-50 text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-zinc-600 mb-4 line-clamp-2">{partner.description}</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-zinc-600 hover:text-black"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Website
                        </a>
                      )}
                      {partner.socials?.instagram && (
                        <span className="text-zinc-400">Instagram</span>
                      )}
                      {partner.socials?.linkedin && (
                        <span className="text-zinc-400">LinkedIn</span>
                      )}
                      {partner.socials?.facebook && (
                        <span className="text-zinc-400">Facebook</span>
                      )}
                      {partner.socials?.twitter && (
                        <span className="text-zinc-400">Twitter</span>
                      )}
                      {partner.socials?.youtube && (
                        <span className="text-zinc-400">YouTube</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full max-w-4xl p-8 my-8 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-3xl font-bold tracking-tight mb-8">
              {editingPartner ? 'Edit Partner' : 'Add New Partner'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-zinc-600 mb-3">
                  Partner Image
                </label>
                <div className="flex gap-4 items-start">
                  <div className="w-40 h-40 bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-8 h-8 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-sm"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-zinc-500 mt-2">
                      Upload a logo or image for this partner. Recommended size: 800x800px
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-zinc-600 mb-2">
                  Partner Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-zinc-300 focus:border-black focus:outline-none transition-colors"
                  placeholder="Partner Name"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-zinc-600 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-zinc-300 focus:border-black focus:outline-none transition-colors"
                >
                  <option value="Financiële Partner">Financiële Partner</option>
                  <option value="Strategische Partner">Strategische Partner</option>
                  <option value="Performance Team">Performance Team</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-zinc-600 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  disabled={isSubmitting}
                  rows={5}
                  className="w-full px-4 py-3 border border-zinc-300 focus:border-black focus:outline-none transition-colors resize-none"
                  placeholder="Describe the partner and their contribution..."
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-zinc-600 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-zinc-300 focus:border-black focus:outline-none transition-colors"
                  placeholder="https://example.com"
                />
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-zinc-600 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-zinc-300 focus:border-black focus:outline-none transition-colors"
                  placeholder="0"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Lower numbers appear first
                </p>
              </div>

              {/* Social Media */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-zinc-600 mb-3">
                  Social Media Links (Optional)
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Instagram</label>
                    <input
                      type="url"
                      value={formData.socials?.instagram || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socials: { ...formData.socials, instagram: e.target.value },
                        })
                      }
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 border border-zinc-300 focus:border-black focus:outline-none transition-colors text-sm"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">LinkedIn</label>
                    <input
                      type="url"
                      value={formData.socials?.linkedin || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socials: { ...formData.socials, linkedin: e.target.value },
                        })
                      }
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 border border-zinc-300 focus:border-black focus:outline-none transition-colors text-sm"
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Facebook</label>
                    <input
                      type="url"
                      value={formData.socials?.facebook || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socials: { ...formData.socials, facebook: e.target.value },
                        })
                      }
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 border border-zinc-300 focus:border-black focus:outline-none transition-colors text-sm"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Twitter</label>
                    <input
                      type="url"
                      value={formData.socials?.twitter || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socials: { ...formData.socials, twitter: e.target.value },
                        })
                      }
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 border border-zinc-300 focus:border-black focus:outline-none transition-colors text-sm"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">YouTube</label>
                    <input
                      type="url"
                      value={formData.socials?.youtube || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socials: { ...formData.socials, youtube: e.target.value },
                        })
                      }
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 border border-zinc-300 focus:border-black focus:outline-none transition-colors text-sm"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-black text-white font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingPartner ? 'Update Partner' : 'Create Partner'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-zinc-300 font-semibold hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
