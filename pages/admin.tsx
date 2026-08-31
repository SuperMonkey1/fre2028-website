import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Mountain, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Upload, 
  ExternalLink, 
  TrendingUp,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck
} from 'lucide-react';
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

  // Stripe Test State
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState('');
  const [showStripeConfig, setShowStripeConfig] = useState(false);
  const [testCompany, setTestCompany] = useState('Fre2028 Test Partner');
  const [testEmail, setTestEmail] = useState('admin@fre2028.la');
  const [testVat, setTestVat] = useState('BE 0123.456.789');

  const [formData, setFormData] = useState<Partial<Partner>>({
    name: '',
    category: 'Financiële Partner',
    description: '',
    logoUrl: '',
    funImageUrl: '',
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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [funImageFile, setFunImageFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [funImagePreview, setFunImagePreview] = useState<string>('');
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

  useEffect(() => {
    if (router.query.stripe_status === 'success') {
      const sessionId = router.query.session_id ? ` (Sessie ID: ${router.query.session_id})` : '';
      setSuccess(`Stripe testbetaling van €1,00 per maand is succesvol geautoriseerd!${sessionId}`);
    } else if (router.query.stripe_status === 'cancelled') {
      setError('Stripe betaalsessie is geannuleerd.');
    }
  }, [router.query]);

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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFunImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFunImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFunImagePreview(reader.result as string);
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
      let logoUrl = formData.logoUrl || '';
      let funImageUrl = formData.funImageUrl || '';

      // Upload new logo if selected
      if (logoFile) {
        logoUrl = await uploadImage(logoFile);
      }

      // Upload new fun image if selected
      if (funImageFile) {
        funImageUrl = await uploadImage(funImageFile);
      }

      const partnerData: Partial<Partner> = {
        ...formData,
        logoUrl,
        funImageUrl,
        // For backwards compatibility, set imageUrl to logoUrl
        imageUrl: logoUrl,
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
      logoUrl: partner.logoUrl || partner.imageUrl || '',
      funImageUrl: partner.funImageUrl || '',
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
    setLogoPreview(partner.logoUrl || partner.imageUrl || '');
    setFunImagePreview(partner.funImageUrl || '');
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
      logoUrl: '',
      funImageUrl: '',
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
    setLogoFile(null);
    setFunImageFile(null);
    setLogoPreview('');
    setFunImagePreview('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPartner(null);
    setLogoFile(null);
    setFunImageFile(null);
    setLogoPreview('');
    setFunImagePreview('');
    setError('');
  };

  const handleStripeTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsStripeLoading(true);
    setStripeError('');
    try {
      const payload = {
        plan: 'test_1euro',
        companyName: testCompany || 'Fre2028 Test Partner',
        contactName: 'Admin Tester',
        email: testEmail || 'admin@fre2028.la',
        vatNumber: testVat || '',
        address: 'Leuven, België',
        notes: 'Stripe 1 euro/maand integratietest via Admin Dashboard',
        originUrl: window.location.origin,
        returnUrl: `${window.location.origin}/admin`,
      };

      let response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok && response.status === 404) {
        response = await fetch('https://us-central1-fre-2028-website.cloudfunctions.net/payments/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Er is een fout opgetreden bij het aanmaken van de Stripe checkout sessie.');
      }

      // Redirect directly to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Stripe test error:', err);
      setStripeError(err.message || 'Kon betaalsessie niet starten.');
      setIsStripeLoading(false);
    }
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
        <title>Admin Panel - Partner Management & Stripe Test</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Mountain className="w-6 h-6" />
              <h1 className="text-lg font-bold tracking-tight">Admin Panel</h1>
            </div>
            <div className="h-4 w-[1px] bg-zinc-200 hidden sm:block" />
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link 
                href="/admin/outreach"
                className="px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-black hover:bg-zinc-100 transition-colors flex items-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
                Sponsor Outreach & CRM
              </Link>
              <Link 
                href="/admin"
                className="px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider bg-black text-white"
              >
                Website Partners
              </Link>
            </nav>
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
        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-zinc-100 border border-zinc-200 text-zinc-800 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-zinc-700 flex-shrink-0" />
              <span className="font-medium text-sm">{success}</span>
            </div>
            <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {error && !isModalOpen && (
          <div className="mb-6 p-4 bg-zinc-100 border border-zinc-200 text-zinc-800 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-zinc-700 flex-shrink-0" />
              <span className="font-medium text-sm">{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ==================== STRIPE TEST PAYMENT WIDGET ==================== */}
        <div className="mb-10 bg-white border border-zinc-200 rounded-xl shadow-sm p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-zinc-100 text-zinc-800 rounded-full border border-zinc-200">
                  <CreditCard className="w-3.5 h-3.5 text-zinc-700" />
                  Stripe Test Checkout
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-800 bg-zinc-100 px-2.5 py-0.5 rounded-full border border-zinc-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
                  € 1,00 / maand abonnement
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                Stripe Betaling Testen (€ 1,00 / maand)
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Test de volledige Stripe recurring subscription checkout flow met een maandelijks bedrag van <strong>€ 1,00 / maand</strong>. Hiermee verifieer je of creditcards, SEPA domiciliëring, checkout links en webhook bevestigingen live functioneren.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => setShowStripeConfig(!showStripeConfig)}
                className="px-4 py-3 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>Opties</span>
                {showStripeConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => handleStripeTest()}
                disabled={isStripeLoading}
                className="px-6 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm tracking-wide rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
              >
                {isStripeLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Checkout laden...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Start € 1,00 / maand Checkout</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {stripeError && (
            <div className="mt-4 p-3 bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-800 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-zinc-700 flex-shrink-0" />
              <span>{stripeError}</span>
            </div>
          )}

          {/* Collapsible custom metadata parameters */}
          {showStripeConfig && (
            <div className="mt-6 pt-6 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-50/70 p-4 rounded-lg">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  Test Bedrijfsnaam
                </label>
                <input
                  type="text"
                  value={testCompany}
                  onChange={(e) => setTestCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded text-sm focus:outline-none focus:border-violet-600"
                  placeholder="Bedrijfsnaam"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  Test E-mailadres
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded text-sm focus:outline-none focus:border-violet-600"
                  placeholder="naam@bedrijf.be"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  BTW-nummer (optioneel)
                </label>
                <input
                  type="text"
                  value={testVat}
                  onChange={(e) => setTestVat(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded text-sm focus:outline-none focus:border-violet-600"
                  placeholder="BE 0123.456.789"
                />
              </div>
            </div>
          )}
        </div>

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
                    {(partner.logoUrl || partner.imageUrl) ? (
                      <img
                        src={partner.logoUrl || partner.imageUrl || ''}
                        alt={partner.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">
                        No Logo
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
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-zinc-600 mb-3">
                  Partner Logo
                </label>
                <div className="flex gap-4 items-start">
                  <div className="w-40 h-40 bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-8 h-8 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="w-full text-sm"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-zinc-500 mt-2">
                      Upload the partner's logo. This will be displayed on the home page. Recommended size: 800x800px
                    </p>
                  </div>
                </div>
              </div>

              {/* Fun Image Upload */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-zinc-600 mb-3">
                  Partner Fun Image
                </label>
                <div className="flex gap-4 items-start">
                  <div className="w-40 h-40 bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center overflow-hidden">
                    {funImagePreview ? (
                      <img src={funImagePreview} alt="Fun Image Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-8 h-8 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFunImageChange}
                      className="w-full text-sm"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-zinc-500 mt-2">
                      Upload a fun/action image for this partner. This will be displayed on the partners page. Recommended size: 1200x800px
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
