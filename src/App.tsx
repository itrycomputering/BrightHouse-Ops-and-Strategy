import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  Package as PackageIcon, 
  TrendingUp, 
  Settings, 
  Plus, 
  LogOut, 
  ChevronRight, 
  DollarSign, 
  Briefcase, 
  PieChart, 
  Target, 
  Shield, 
  Activity,
  Trash2,
  Edit2,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where,
  getDocFromServer
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { 
  Profile, 
  Package, 
  Upsell, 
  Contractor, 
  DashboardStats,
  ModelingMode,
  BillingCycle,
  Formation,
  ContractorModel
} from './types';
import { StatCard } from './components/StatCard';

// --- Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [upsells, setUpsells] = useState<Upsell[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'packages' | 'upsells' | 'contractors' | 'settings'>('dashboard');
  const [showModal, setShowModal] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // --- Auth & Initial Sync ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        testConnection();
      }
    });
    return () => unsubscribe();
  }, []);

  async function testConnection() {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
      }
    }
  }

  useEffect(() => {
    if (!user) return;

    // Sync Profile
    const profilePath = `profiles/${user.uid}`;
    const unsubProfile = onSnapshot(doc(db, 'profiles', user.uid), (snap) => {
      if (snap.exists()) {
        setProfile({ id: snap.id, ...snap.data() } as Profile);
      } else {
        // Create default profile if not exists
        const defaultProfile: Profile = {
          companyName: 'My Media Company',
          brandColor: '#ec4899',
          modelingMode: 'granular',
          billingCycle: 'monthly',
          formation: 'LLC',
          themeMode: 'dark',
          weeksPerYear: 52,
          daysPerWeek: 5,
          imagesPerShoot: 25,
          photoVendor: 'Standard',
          videoVendor: 'Standard',
          manualPhotoCost: 50,
          targetMarginFloor: 40,
          ownerUid: user.uid
        };
        setDoc(doc(db, 'profiles', user.uid), defaultProfile).catch(e => handleFirestoreError(e, OperationType.WRITE, profilePath));
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, profilePath));

    // Sync Packages
    const packagesPath = `profiles/${user.uid}/packages`;
    const unsubPackages = onSnapshot(collection(db, 'profiles', user.uid, 'packages'), (snap) => {
      setPackages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Package)));
    }, (e) => handleFirestoreError(e, OperationType.GET, packagesPath));

    // Sync Upsells
    const upsellsPath = `profiles/${user.uid}/upsells`;
    const unsubUpsells = onSnapshot(collection(db, 'profiles', user.uid, 'upsells'), (snap) => {
      setUpsells(snap.docs.map(d => ({ id: d.id, ...d.data() } as Upsell)));
    }, (e) => handleFirestoreError(e, OperationType.GET, upsellsPath));

    // Sync Contractors
    const contractorsPath = `profiles/${user.uid}/contractors`;
    const unsubContractors = onSnapshot(collection(db, 'profiles', user.uid, 'contractors'), (snap) => {
      setContractors(snap.docs.map(d => ({ id: d.id, ...d.data() } as Contractor)));
    }, (e) => handleFirestoreError(e, OperationType.GET, contractorsPath));

    return () => {
      unsubProfile();
      unsubPackages();
      unsubUpsells();
      unsubContractors();
    };
  }, [user]);

  // --- Calculations ---
  const stats = useMemo<DashboardStats>(() => {
    let totalRevenue = 0;
    let totalContractorCost = 0;

    packages.forEach(pkg => {
      totalRevenue += pkg.price * pkg.orders;
    });

    upsells.forEach(upsell => {
      totalRevenue += upsell.price * upsell.count;
    });

    // Simple cost model for demo purposes
    contractors.forEach(c => {
      if (c.model === 'Flat Rate') {
        totalContractorCost += c.flatRate;
      } else if (c.model === 'Revenue Share') {
        totalContractorCost += (totalRevenue * c.percentRate) / 100;
      } else if (c.model === 'Hybrid') {
        totalContractorCost += c.hybridBase + (totalRevenue * c.percentRate) / 100;
      }
    });

    const grossMargin = totalRevenue - totalContractorCost;
    const marginPercentage = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;

    return { totalRevenue, totalContractorCost, grossMargin, marginPercentage };
  }, [packages, upsells, contractors]);

  // --- Handlers ---
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      console.error('Login failed', e);
    }
  };

  const handleLogout = () => signOut(auth);

  const saveItem = async (type: string, data: any) => {
    if (!user) return;
    const path = `profiles/${user.uid}/${type}`;
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'profiles', user.uid, type, editingItem.id), data);
      } else {
        await addDoc(collection(db, 'profiles', user.uid, type), { ...data, profileId: user.uid });
      }
      setShowModal(null);
      setEditingItem(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  };

  const deleteItem = async (type: string, id: string) => {
    if (!user) return;
    const path = `profiles/${user.uid}/${type}/${id}`;
    try {
      await deleteDoc(doc(db, 'profiles', user.uid, type, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full"
      />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 rounded-3xl max-w-md w-full text-center"
      >
        <div className="w-16 h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-8 h-8 text-pink-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-50 mb-2">BrightHouse</h1>
        <p className="text-slate-400 mb-8">Operations & Strategy Dashboard</p>
        <button 
          onClick={handleLogin}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5 brightness-0 invert" alt="Google" />
          Sign in with Google
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 glass border-r border-white/5 flex flex-col p-6 hidden lg:flex">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">BrightHouse</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {[
            { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
            { id: 'packages', icon: PackageIcon, label: 'Packages' },
            { id: 'upsells', icon: Plus, label: 'Upsells' },
            { id: 'contractors', icon: Users, label: 'Contractors' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-50'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold capitalize">{activeTab}</h2>
            <div className="h-4 w-px bg-white/10" />
            <p className="text-slate-400 text-sm">{profile?.companyName}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user.displayName}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <img src={user.photoURL || ''} className="w-10 h-10 rounded-xl border border-white/10" alt="Avatar" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="bg-pink-500" trend="+12.5%" trendUp />
                  <StatCard title="Contractor Cost" value={`$${stats.totalContractorCost.toLocaleString()}`} icon={Users} color="bg-indigo-500" trend="-2.4%" trendUp={false} />
                  <StatCard title="Gross Margin" value={`$${stats.grossMargin.toLocaleString()}`} icon={PieChart} color="bg-emerald-500" trend="+8.1%" trendUp />
                  <StatCard title="Margin %" value={`${stats.marginPercentage.toFixed(1)}%`} icon={TrendingUp} color="bg-amber-500" trend="+1.2%" trendUp />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="glass p-8 rounded-3xl">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold">Recent Packages</h3>
                      <button onClick={() => setActiveTab('packages')} className="text-pink-500 text-sm font-medium hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                      {packages.slice(0, 5).map(pkg => (
                        <div key={pkg.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-pink-500/20">
                              <PackageIcon className="w-5 h-5 text-pink-500" />
                            </div>
                            <div>
                              <p className="font-medium">{pkg.name}</p>
                              <p className="text-xs text-slate-400">{pkg.orders} Orders</p>
                            </div>
                          </div>
                          <p className="font-bold">${pkg.price.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass p-8 rounded-3xl">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold">Active Contractors</h3>
                      <button onClick={() => setActiveTab('contractors')} className="text-pink-500 text-sm font-medium hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                      {contractors.slice(0, 5).map(c => (
                        <div key={c.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-indigo-500/20">
                              <Users className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                              <p className="font-medium">{c.name}</p>
                              <p className="text-xs text-slate-400">{c.model}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-400">{c.share}% Share</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'packages' && (
              <motion.div 
                key="packages"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Service Packages</h3>
                  <button 
                    onClick={() => { setEditingItem(null); setShowModal('package'); }}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Add Package
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {packages.map(pkg => (
                    <div key={pkg.id} className="glass p-6 rounded-2xl group relative overflow-hidden">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-pink-500/20">
                          <PackageIcon className="w-6 h-6 text-pink-500" />
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setEditingItem(pkg); setShowModal('package'); }} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-50"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => deleteItem('packages', pkg.id!)} className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <h4 className="text-lg font-bold mb-1">{pkg.name}</h4>
                      <p className="text-slate-400 text-sm mb-4">{pkg.orders} Orders this period</p>
                      <p className="text-2xl font-black text-pink-500">${pkg.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'contractors' && (
              <motion.div 
                key="contractors"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Contractor Management</h3>
                  <button 
                    onClick={() => { setEditingItem(null); setShowModal('contractor'); }}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Add Contractor
                  </button>
                </div>
                <div className="glass rounded-3xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="p-6 font-bold text-slate-400 uppercase text-xs tracking-wider">Name</th>
                        <th className="p-6 font-bold text-slate-400 uppercase text-xs tracking-wider">Model</th>
                        <th className="p-6 font-bold text-slate-400 uppercase text-xs tracking-wider">Share</th>
                        <th className="p-6 font-bold text-slate-400 uppercase text-xs tracking-wider">Base Rate</th>
                        <th className="p-6 font-bold text-slate-400 uppercase text-xs tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {contractors.map(c => (
                        <tr key={c.id} className="hover:bg-white/5 transition-all">
                          <td className="p-6 font-bold">{c.name}</td>
                          <td className="p-6">
                            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold uppercase">{c.model}</span>
                          </td>
                          <td className="p-6 text-emerald-400 font-bold">{c.share}%</td>
                          <td className="p-6 font-medium">${c.flatRate.toLocaleString()}</td>
                          <td className="p-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => { setEditingItem(c); setShowModal('contractor'); }} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-50"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => deleteItem('contractors', c.id!)} className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && profile && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl space-y-8"
              >
                <div className="glass p-8 rounded-3xl space-y-6">
                  <h3 className="text-2xl font-bold">Company Profile</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Company Name</label>
                      <input 
                        type="text" 
                        value={profile.companyName}
                        onChange={(e) => updateDoc(doc(db, 'profiles', user.uid), { companyName: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Modeling Mode</label>
                        <select 
                          value={profile.modelingMode}
                          onChange={(e) => updateDoc(doc(db, 'profiles', user.uid), { modelingMode: e.target.value })}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 transition-all"
                        >
                          <option value="granular">Granular</option>
                          <option value="executive">Executive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Billing Cycle</label>
                        <select 
                          value={profile.billingCycle}
                          onChange={(e) => updateDoc(doc(db, 'profiles', user.uid), { billingCycle: e.target.value })}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 transition-all"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Brand Color</label>
                      <div className="flex gap-4 items-center">
                        <input 
                          type="color" 
                          value={profile.brandColor}
                          onChange={(e) => updateDoc(doc(db, 'profiles', user.uid), { brandColor: e.target.value })}
                          className="w-12 h-12 bg-transparent border-none cursor-pointer"
                        />
                        <span className="font-mono text-sm">{profile.brandColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass p-8 rounded-3xl space-y-6">
                  <h3 className="text-2xl font-bold">Operational Benchmarks</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Weeks per Year</label>
                      <input 
                        type="number" 
                        value={profile.weeksPerYear}
                        onChange={(e) => updateDoc(doc(db, 'profiles', user.uid), { weeksPerYear: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Target Margin Floor (%)</label>
                      <input 
                        type="number" 
                        value={profile.targetMarginFloor}
                        onChange={(e) => updateDoc(doc(db, 'profiles', user.uid), { targetMarginFloor: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showModal === 'package' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass p-8 rounded-3xl max-w-md w-full relative z-10"
            >
              <h3 className="text-2xl font-bold mb-6">{editingItem ? 'Edit Package' : 'New Package'}</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                saveItem('packages', {
                  name: formData.get('name'),
                  price: Number(formData.get('price')),
                  orders: Number(formData.get('orders')),
                });
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Package Name</label>
                  <input name="name" defaultValue={editingItem?.name} required className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Price ($)</label>
                    <input name="price" type="number" defaultValue={editingItem?.price} required className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Orders</label>
                    <input name="orders" type="number" defaultValue={editingItem?.orders} required className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(null)} className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-bold transition-all">Cancel</button>
                  <button type="submit" className="flex-1 px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 font-bold transition-all">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showModal === 'contractor' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass p-8 rounded-3xl max-w-md w-full relative z-10"
            >
              <h3 className="text-2xl font-bold mb-6">{editingItem ? 'Edit Contractor' : 'New Contractor'}</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                saveItem('contractors', {
                  name: formData.get('name'),
                  model: formData.get('model'),
                  share: Number(formData.get('share')),
                  flatRate: Number(formData.get('flatRate')),
                  percentRate: Number(formData.get('percentRate')),
                  hybridBase: Number(formData.get('hybridBase')),
                  hybridVideoBonus: Number(formData.get('hybridVideoBonus')),
                });
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                  <input name="name" defaultValue={editingItem?.name} required className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Payment Model</label>
                  <select name="model" defaultValue={editingItem?.model || 'Flat Rate'} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500">
                    <option value="Flat Rate">Flat Rate</option>
                    <option value="Revenue Share">Revenue Share</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Share (%)</label>
                    <input name="share" type="number" defaultValue={editingItem?.share || 0} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Flat Rate ($)</label>
                    <input name="flatRate" type="number" defaultValue={editingItem?.flatRate || 0} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(null)} className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-bold transition-all">Cancel</button>
                  <button type="submit" className="flex-1 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-bold transition-all">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
