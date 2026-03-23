import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Branding, PackageTier, Upsell, Contractor, Financials, 
  BillingCycle, PhotoVendor, VideoVendor, LaborModel, EntityFormation
} from './types';
import { FIXED_OPEX_LIST, PHOTO_PRICING, VIDEO_PRICING } from './constants';
import { 
  LayoutGrid, TrendingUp, DollarSign, Users, Activity,
  ChevronRight, Plus, Trash2, Upload, Camera, Video,
  Zap, Save, BrainCircuit, BarChart3, Wallet, ShieldAlert,
  Info, Printer, Cpu, Building2, ListChecks,
  MonitorCheck, Sun, Moon, Laptop, Package, Link, Palmtree, Calendar, Target, Clock, Calculator, CalendarDays, Trophy, Lightbulb, CheckCircle2, ShieldCheck, Receipt, Globe, Shield, ChevronDown, MousePointer2, ArrowRight, Settings2, Scale, Monitor, CreditCard, PieChart,
  HardDrive, Bot, Shirt, ReceiptText, Key, Phone, MapPin, Mail, Image as ImageIcon,
  Rocket, ArrowUpRight, ListTodo, Medal, UserPlus, AlertCircle, ShoppingCart, SearchCode, User, 
  GraduationCap, 
  Sparkles,
  ZapOff,
  Milestone,
  Gem,
  Calculator as CalcIcon,
  Gavel,
  Briefcase,
  Layers,
  Box,
  Map as MapIcon
} from 'lucide-react';

// --- Theme Types ---
type ThemeMode = 'light' | 'dark' | 'system';
type ModelingMode = 'granular' | 'executive';

const Separator = () => (
  <div className="w-full h-px bg-slate-300 dark:bg-white/10 my-32 no-print"></div>
);

// --- Tax Logic Helpers ---
const calculateProgressiveFedTax = (monthlyTaxable: number) => {
  const brackets = [
    { threshold: 960, rate: 0.10 },
    { threshold: 3920, rate: 0.12 },
    { threshold: 8370, rate: 0.22 },
    { threshold: 16000, rate: 0.24 },
  ];
  let tax = 0;
  let prevThreshold = 0;
  for (const b of brackets) {
    if (monthlyTaxable > prevThreshold) {
      const taxableInBracket = Math.min(monthlyTaxable - prevThreshold, b.threshold - prevThreshold);
      tax += taxableInBracket * b.rate;
      prevThreshold = b.threshold;
    }
  }
  if (monthlyTaxable > prevThreshold) tax += (monthlyTaxable - prevThreshold) * 0.32;
  return tax;
};

const calculateProgressiveCATax = (monthlyTaxable: number) => {
  const brackets = [
    { threshold: 800, rate: 0.01 },
    { threshold: 2000, rate: 0.02 },
    { threshold: 3200, rate: 0.04 },
    { threshold: 4500, rate: 0.06 },
    { threshold: 5800, rate: 0.08 },
    { threshold: 8000, rate: 0.093 },
  ];
  let tax = 0;
  let prevThreshold = 0;
  for (const b of brackets) {
    if (monthlyTaxable > prevThreshold) {
      const taxableInBracket = Math.min(monthlyTaxable - prevThreshold, b.threshold - prevThreshold);
      tax += taxableInBracket * b.rate;
      prevThreshold = b.threshold;
    }
  }
  if (monthlyTaxable > prevThreshold) tax += (monthlyTaxable - prevThreshold) * 0.103;
  return tax;
};

// --- Cost Optimization Helper for VideoTour Credits ---
const getMinCreditCost = (needed: number): number => {
  if (needed <= 0) return 0;
  const packs = VIDEO_PRICING.videotour.creditPacks;
  let minCost = Infinity;

  // Option 1: Find single cheapest pack that covers the whole need
  for (const p of packs) {
    if (p.size >= needed) {
      minCost = Math.min(minCost, p.price);
    }
  }

  // Option 2: Multiples of the same pack
  for (const p of packs) {
    minCost = Math.min(minCost, Math.ceil(needed / p.size) * p.price);
  }

  // Option 3: Greedy decomposition
  let greedyCost = 0;
  let remaining = needed;
  const sortedPacks = [...packs].sort((a, b) => b.size - a.size);
  for (const p of sortedPacks) {
    while (remaining >= p.size) {
      greedyCost += p.price;
      remaining -= p.size;
    }
  }
  if (remaining > 0) {
    greedyCost += sortedPacks.filter(p => p.size >= remaining).sort((a, b) => a.price - b.price)[0]?.price || sortedPacks[0].price;
  }
  
  return Math.min(minCost, greedyCost);
};

// --- Onboarding ---
const Onboarding: React.FC<{ 
  branding: Branding, 
  setBranding: (b: Branding) => void,
  packages: PackageTier[],
  setPackages: (p: PackageTier[]) => void,
  upsells: Upsell[],
  setUpsells: (u: Upsell[]) => void,
  onComplete: () => void 
}> = ({ branding, setBranding, packages, setPackages, upsells, setUpsells, onComplete }) => {
  const [step, setStep] = useState(1);
  const updatePkg = (idx: number, updates: Partial<PackageTier>) => {
    const next = [...packages];
    next[idx] = { ...next[idx], ...updates };
    setPackages(next);
  };
  const updateUpsell = (idx: number, updates: Partial<Upsell>) => {
    const next = [...upsells];
    next[idx] = { ...next[idx], ...updates };
    setUpsells(next);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#020617] relative text-slate-950 dark:text-slate-100 overflow-hidden">
      <div className="glass w-full max-w-4xl rounded-[3rem] p-12 shadow-2xl relative z-10 border border-white/10">
        <div className="flex gap-2 mb-12 max-w-2xl mx-auto">
          {[1, 2].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'brand-bg shadow-[0_0_10px_rgba(236,72,153,0.4)]' : 'bg-slate-300 dark:bg-slate-800'}`}></div>
          ))}
        </div>
        {step === 1 ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            <div className="mb-10 text-center">
              <div className="w-20 h-20 brand-bg mx-auto rounded-3xl flex items-center justify-center shadow-2xl mb-6 shadow-pink-500/20"><Building2 className="text-white" size={40} /></div>
              <h1 className="text-4xl font-display font-black text-slate-950 dark:text-white italic tracking-tighter uppercase leading-none">Brand Identity</h1>
              <p className="text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 italic">PHASE 1: VISUAL FOUNDATION</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200 tracking-widest mb-2 block pl-4">Company Name</label>
                <input type="text" value={branding.companyName} onChange={e => setBranding({ ...branding, companyName: e.target.value })} className="w-full bg-white/50 dark:bg-slate-950/50 border border-slate-300 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all" />
              </div>
              <div className="flex gap-8 items-start">
                <div className="w-36 bg-white p-3 shadow-2xl rounded-sm border border-slate-200 flex flex-col gap-1 relative overflow-hidden shrink-0 group">
                   <div className="h-24 w-full rounded-sm mt-5 relative overflow-hidden" style={{ backgroundColor: branding.brandColor }}>
                     <input type="color" value={branding.brandColor} onChange={e => setBranding({ ...branding, brandColor: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150" />
                   </div>
                   <div className="mt-3 pt-2 border-t border-slate-100 text-[9px] font-black text-slate-950 uppercase tracking-tighter">{branding.brandColor}</div>
                </div>
                <div className="flex-1 space-y-5 pt-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Hex Signature</label>
                  <input type="text" value={branding.brandColor} onChange={e => setBranding({ ...branding, brandColor: e.target.value })} className="w-full bg-white/50 dark:bg-slate-950/50 border border-slate-300 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all uppercase" />
                </div>
              </div>
              <button onClick={() => setStep(2)} className="w-full brand-bg hover:opacity-90 text-white font-black uppercase tracking-widest py-5 rounded-[1.5rem] shadow-2xl shadow-pink-500/20 transition-all flex items-center justify-center gap-2 group mt-4">Configure Catalog <ChevronRight size={18} /></button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-10 text-center">
              <div className="w-20 h-20 brand-bg mx-auto rounded-3xl flex items-center justify-center shadow-2xl mb-6 shadow-pink-500/20"><ListChecks className="text-white" size={40} /></div>
              <h1 className="text-4xl font-display font-black text-slate-950 dark:text-white italic tracking-tighter uppercase leading-none">Revenue Catalog</h1>
              <p className="text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 italic">PHASE 2: SERVICE PRICING</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-h-[50vh] overflow-y-auto custom-scrollbar pr-4">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200 tracking-[0.2em] pl-4 border-l-2 border-pink-500">Core Packages</h3>
                {packages.map((pkg, i) => (
                  <div key={i} className="flex gap-4 items-center bg-white/30 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-300 dark:border-white/10">
                    <input type="text" value={pkg.name} onChange={e => updatePkg(i, { name: e.target.value })} className="bg-transparent text-xs font-bold text-slate-900 dark:text-white flex-1 focus:outline-none" />
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-200/50 dark:bg-slate-900/50"><span className="text-[9px] font-black">$</span><input type="number" value={pkg.price} onChange={e => updatePkg(i, { price: parseInt(e.target.value) || 0 })} className="bg-transparent w-12 text-right font-black text-xs focus:outline-none" /></div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200 tracking-[0.2em] pl-4 border-l-2 border-emerald-500">Standard Add-ons</h3>
                {upsells.map((up, i) => (
                  <div key={i} className="flex gap-4 items-center bg-white/30 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-300 dark:border-white/10">
                    <input type="text" value={up.name} onChange={e => updateUpsell(i, { name: e.target.value })} className="bg-transparent text-xs font-bold text-slate-900 dark:text-white flex-1 focus:outline-none" />
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-200/50 dark:bg-slate-900/50"><span className="text-[9px] font-black">$</span><input type="number" value={up.price} onChange={e => updateUpsell(i, { price: parseInt(e.target.value) || 0 })} className="bg-transparent w-12 text-right font-black text-xs focus:outline-none" /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-4 mt-8 w-full"><button onClick={() => setStep(1)} className="flex-1 glass text-slate-800 dark:text-slate-200 font-black uppercase tracking-widest py-5 rounded-[1.5rem]">Back</button><button onClick={onComplete} className="flex-[2] brand-bg text-white font-black uppercase tracking-widest py-5 rounded-[1.5rem] shadow-2xl">Launch Master Engine</button></div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [onboardState, setOnboardState] = useState<'onboarding' | 'dashboard'>('dashboard');
  const [branding, setBranding] = useState<Branding>({ companyName: 'BRIGHTHOUSE MEDIA', brandColor: '#ec4899', logoUrl: '' });
  
  const [modelingMode, setModelingMode] = useState<ModelingMode>('granular');
  const [executiveAOV, setExecutiveAOV] = useState(325);
  const [executiveVolume, setExecutiveVolume] = useState(30);
  const [targetMarginFloor, setTargetMarginFloor] = useState(40);
  const [formation, setFormation] = useState<EntityFormation>('llc');
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  const [packages, setPackages] = useState<PackageTier[]>([
    { name: 'Base Bundle', price: 195, orders: 12 },
    { name: 'Pro Bundle', price: 325, orders: 18 },
    { name: 'Lux Bundle', price: 595, orders: 6 }
  ]);
  const [upsells, setUpsells] = useState<Upsell[]>([
    { name: 'Videos', price: 75, count: 15 },
    { name: 'Virtual Staging', price: 35, count: 25 },
    { name: 'Twilight', price: 15, count: 10 },
    { name: 'On-Site Twilight Photography', price: 175, count: 5 },
    { name: '3D Architectural Layout Render', price: 195, count: 3 },
    { name: 'Same Day Floor Plan + GLA Report', price: 50, count: 12 }
  ]);
  const [weeks, setWeeks] = useState(45);
  const [days, setDays] = useState(4);
  const [imagesPerShoot, setImagesPerShoot] = useState(35);
  const [photoVendor, setPhotoVendor] = useState<PhotoVendor>('fotello');
  const [videoVendor, setVideoVendor] = useState<VideoVendor>('videotour');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [manualPhotoCost, setManualPhotoCost] = useState(1.25);
  const [contractors, setContractors] = useState<Contractor[]>([]);

  useEffect(() => {
    document.documentElement.style.setProperty('--brand-color', branding.brandColor);
    const root = window.document.documentElement;
    if (themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [branding.brandColor, themeMode]);

  const totalVolume = useMemo(() => modelingMode === 'executive' ? executiveVolume : packages.reduce((s, p) => s + p.orders, 0), [modelingMode, executiveVolume, packages]);
  const luxOrders = useMemo(() => modelingMode === 'executive' ? Math.floor(executiveVolume * 0.15) : packages.find(p => p.name.toLowerCase().includes('lux'))?.orders || 0, [modelingMode, executiveVolume, packages]);
  const grossRevenue = useMemo(() => modelingMode === 'executive' ? executiveAOV * executiveVolume : packages.reduce((s, p) => s + (p.price * p.orders), 0) + upsells.reduce((s, u) => s + (u.price * u.count), 0), [modelingMode, executiveAOV, executiveVolume, packages, upsells]);

  const totalVideosNeeded = useMemo(() => modelingMode === 'executive' ? Math.floor(executiveVolume * 0.35) : luxOrders + (upsells.find(u => u.name.toLowerCase().includes('video'))?.count || 0), [modelingMode, executiveVolume, luxOrders, upsells]);
  const totalTwilightsNeeded = useMemo(() => modelingMode === 'executive' ? Math.floor(executiveVolume * 0.15) : (luxOrders * 2) + (upsells.find(u => u.name.toLowerCase().includes('twilight'))?.count || 0), [modelingMode, executiveVolume, luxOrders, upsells]);
  const totalStagingNeeded = useMemo(() => modelingMode === 'executive' ? Math.floor(executiveVolume * 0.20) : luxOrders + (upsells.find(u => u.name.toLowerCase().includes('staging'))?.count || 0), [modelingMode, executiveVolume, luxOrders, upsells]);
  const totalImages = useMemo(() => totalVolume * imagesPerShoot, [totalVolume, imagesPerShoot]);

  // Format Helpers
  const formatUSD = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  const formatCompact = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  // Price Comparisons
  const photoStackComparison = useMemo(() => {
    const pricePerOrder = billingCycle === 'monthly' ? PHOTO_PRICING.fotello.monthly : PHOTO_PRICING.fotello.yearly;
    let fotelloCost = totalVolume * pricePerOrder;
    const fotelloOverage = (Math.max(0, totalTwilightsNeeded - (totalVolume * 2)) + Math.max(0, totalStagingNeeded - (totalVolume * 2))) * PHOTO_PRICING.fotello.overage;
    fotelloCost += fotelloOverage;

    const tier = PHOTO_PRICING.autohdr.tiers.find(t => t.limit >= totalImages) || PHOTO_PRICING.autohdr.tiers[2];
    let autohdrCost = tier.price + (Math.max(0, totalImages - tier.limit) * tier.topup) + (totalTwilightsNeeded * PHOTO_PRICING.autohdr.twilight) + (totalStagingNeeded * PHOTO_PRICING.autohdr.staging);
    if (billingCycle === 'yearly') autohdrCost *= 0.8;
    const autohdrTCO = autohdrCost + (totalVolume * 5.0);
    const manualTCO = (totalImages * manualPhotoCost) + (totalVolume * 5.0);

    const costs = [
      { key: 'fotello', cost: fotelloCost, sub: fotelloCost - fotelloOverage, extras: fotelloOverage, label: 'Fotello', formula: `${totalVolume} listings @ $${pricePerOrder}` },
      { key: 'autohdr', cost: autohdrTCO, sub: tier.price, extras: autohdrTCO - tier.price, label: 'AutoHDR', formula: `Tier + Spiro + Extras` },
      { key: 'manual', cost: manualTCO, sub: 0, extras: manualTCO, label: 'Manual', formula: `${totalImages} pics @ $${manualPhotoCost.toFixed(2)} + Spiro` },
      { key: 'legacy', cost: totalImages * 1.50 + totalVolume * 10, sub: 0, extras: totalImages * 1.50 + totalVolume * 10, label: 'Agency Legacy', formula: `${totalImages} pics @ $1.50 + $10 fee` }
    ];
    costs.sort((a, b) => a.cost - b.cost);
    return { recommended: costs[0].key as PhotoVendor, costs };
  }, [totalVolume, totalImages, totalTwilightsNeeded, totalStagingNeeded, billingCycle, manualPhotoCost]);

  const videoStackComparison = useMemo(() => {
    const vCount = totalVideosNeeded;
    
    // VideoTour Precision Calc
    const vtTiers = billingCycle === 'monthly' ? VIDEO_PRICING.videotour.monthly : VIDEO_PRICING.videotour.yearly;
    const vtSub = vtTiers.find(t => t.limit >= vCount) || vtTiers[2];
    const creditsNeeded = vCount * VIDEO_PRICING.videotour.imagesPerVideo * VIDEO_PRICING.videotour.creditsPerImage;
    const vtCreditsCost = getMinCreditCost(creditsNeeded);
    const vtTotal = vtSub.price + vtCreditsCost;

    // AutoReel Precision Calc
    const arTiersObj = billingCycle === 'monthly' ? VIDEO_PRICING.autoreel.monthly : VIDEO_PRICING.autoreel.yearly;
    const arBest = Object.values(arTiersObj).map(t => ({ 
      ...t, 
      total: t.price + (Math.max(0, vCount - t.included) * t.overage) 
    })).sort((a, b) => a.total - b.total)[0];

    // Amplifiles
    const ampTotal = vCount * VIDEO_PRICING.amplifiles.costPerVideo;

    const costs = [
      { key: 'videotour', cost: vtTotal, sub: vtSub.price, extras: vtCreditsCost, label: 'VideoTour', formula: `$${vtSub.price} (${vtSub.name}) + $${vtCreditsCost} (Credits)` },
      { key: 'autoreel', cost: arBest.total, sub: arBest.price, extras: arBest.total - arBest.price, label: 'AutoReel', formula: `$${arBest.price} (${arBest.name}) + $${(arBest.total - arBest.price).toFixed(0)} (Overage)` },
      { key: 'amplifiles', cost: ampTotal, sub: 0, extras: ampTotal, label: 'AmpliFiles', formula: `${vCount} vids @ $30/ea ($1.5/img)` }
    ];
    costs.sort((a, b) => a.cost - b.cost);
    return { recommended: costs[0].key as VideoVendor, costs };
  }, [totalVideosNeeded, billingCycle]);

  const financials = useMemo((): Financials => {
    const totalOrders = totalVolume;
    const currentRevenue = grossRevenue;

    let cogsPhoto = 0; let cogsPlatform = 0;
    if (photoVendor === 'autohdr') {
      const tier = PHOTO_PRICING.autohdr.tiers.find(t => t.limit >= totalImages) || PHOTO_PRICING.autohdr.tiers[2];
      cogsPhoto = tier.price + (Math.max(0, totalImages - tier.limit) * tier.topup) + (totalTwilightsNeeded * PHOTO_PRICING.autohdr.twilight) + (totalStagingNeeded * PHOTO_PRICING.autohdr.staging);
      if (billingCycle === 'yearly') cogsPhoto *= 0.8;
      cogsPlatform = totalOrders * 5.0;
    } else if (photoVendor === 'fotello') {
      cogsPhoto = totalOrders * (billingCycle === 'monthly' ? 22 : 18) + (Math.max(0, totalTwilightsNeeded - totalOrders * 2) + Math.max(0, totalStagingNeeded - totalOrders * 2)) * 1;
    } else {
      cogsPhoto = totalImages * manualPhotoCost;
      cogsPlatform = totalOrders * 5.0;
    }

    let cogsVideo = 0;
    if (videoVendor === 'videotour') cogsVideo = videoStackComparison.costs.find(c => c.key === 'videotour')?.cost || 0;
    else if (videoVendor === 'autoreel') cogsVideo = videoStackComparison.costs.find(c => c.key === 'autoreel')?.cost || 0;
    else if (videoVendor === 'amplifiles') cogsVideo = videoStackComparison.costs.find(c => c.key === 'amplifiles')?.cost || 0;

    let cogsLabor = 0;
    contractors.forEach(c => {
      const cOrders = totalOrders * (c.share / 100);
      if (c.model === 'flat') cogsLabor += cOrders * c.flatRate;
      else if (c.model === 'percent') cogsLabor += currentRevenue * (c.share / 100) * (c.percentRate / 100);
      else cogsLabor += cOrders * (c.hybridBase + (c.hybridVideoBonus * (totalVideosNeeded / Math.max(1, totalOrders))));
    });

    const totalCOGS = cogsPhoto + cogsVideo + cogsPlatform + cogsLabor;
    const opex = FIXED_OPEX_LIST.reduce((a, b) => a + b.cost, 0) + (contractors.length > 0 ? 35 + contractors.length * 6 : 0) + (formation === 'scorp' ? 140 : 0);
    const ebitda = Math.max(0, currentRevenue - totalCOGS - opex);
    const tax = formation === 'llc' ? calculateProgressiveFedTax(ebitda) + calculateProgressiveCATax(ebitda) : calculateProgressiveFedTax(ebitda * 0.6) + calculateProgressiveCATax(ebitda * 0.6);
    const netIncome = ebitda - tax;
    const margin = (netIncome / Math.max(1, currentRevenue)) * 100;
    const founderShare = Math.max(0, 100 - contractors.reduce((a, b) => a + b.share, 0));
    const founderLoad = (totalOrders * (founderShare / 100)) / Math.max(1, (weeks * days) / 12);
    const healthScore = Math.min(100, Math.max(0, 100 - Math.max(0, targetMarginFloor - margin) * 3 - (founderLoad > 3 ? 15 : 0)));

    return { grossRevenue: currentRevenue, cogsPhoto, cogsVideo, cogsPlatform, cogsLabor, totalCOGS, grossProfit: currentRevenue - totalCOGS, opex, ebitda, tax, netIncome, margin, founderLoad, healthScore };
  }, [totalVolume, grossRevenue, totalImages, totalTwilightsNeeded, totalStagingNeeded, photoVendor, videoVendor, billingCycle, manualPhotoCost, contractors, formation, targetMarginFloor, weeks, days, videoStackComparison, totalVideosNeeded]);

  const entityAdvice = useMemo(() => {
    const annualEbitda = financials.ebitda * 12;
    if (formation === 'scorp') {
      if (annualEbitda < 60000) return { recommendation: "Revert to LLC Advised", logic: `At $${annualEbitda.toLocaleString()} EBITDA, admin costs eat your tax alpha.`, urgency: "Medium" };
      return { recommendation: "Structure Optimized", logic: `You are capturing tax alpha via S-Corp election.`, urgency: "Low" };
    }
    if (annualEbitda > 75000) return { recommendation: "S-Corp Conversion Advised", logic: `At $${annualEbitda.toLocaleString()} EBITDA, you're overpaying SE tax.`, urgency: "High" };
    return { recommendation: "Maintain Standard LLC", logic: "Current structure is lean and appropriate for volume.", urgency: "Low" };
  }, [financials.ebitda, formation]);

  const containerStyle = "glass p-8 md:p-12 rounded-[3.5rem] border border-slate-300 dark:border-white/5 shadow-2xl";

  const addContractor = () => {
    setContractors([...contractors, { id: Math.random().toString(), name: `Sub ${contractors.length + 1}`, share: 0, model: 'percent', flatRate: 50, percentRate: 30, hybridBase: 45, hybridVideoBonus: 15 }]);
  };

  if (onboardState === 'onboarding') return <Onboarding branding={branding} setBranding={setBranding} packages={packages} setPackages={setPackages} upsells={upsells} setUpsells={setUpsells} onComplete={() => setOnboardState('dashboard')} />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-950 dark:text-slate-100 flex flex-col font-sans">
      <header className="sticky top-0 z-50 glass border-b border-slate-300 dark:border-white/10 px-8 h-24 flex items-center justify-between no-print">
        {/* Logo & Brand */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 brand-bg rounded-xl flex items-center justify-center text-white shadow-lg"><Cpu size={24} /></div>
          <div>
            <h1 className="text-lg font-display font-black italic tracking-tighter uppercase leading-none">{branding.companyName}</h1>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 block italic">BRIGHTHOUSE OPS & STRATEGY</span>
          </div>
        </div>

        {/* Entity Switcher */}
        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 ml-8">
           {(['llc', 'scorp'] as EntityFormation[]).map(f => (
             <button key={f} onClick={() => setFormation(f)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${formation === f ? 'brand-bg text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{f === 'llc' ? <Gavel size={14}/> : <Briefcase size={14}/>}{f === 'llc' ? 'Standard LLC' : 'S-Corp Election'}</button>
           ))}
        </div>

        {/* Proportional Stats Grid */}
        <div className="flex items-center gap-12 ml-auto mr-12">
          <div className="flex items-center gap-10">
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">GROSS/MO</p>
              <p className="text-2xl font-black tabular-nums">{formatCompact(financials.grossRevenue)}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">NET/MO</p>
              <p className="text-2xl font-black text-emerald-600 tabular-nums">{formatCompact(financials.netIncome)}</p>
            </div>
          </div>
          
          <div className="w-px h-10 bg-slate-300 dark:bg-white/10"></div>
          
          <div className="flex items-center gap-10">
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">GROSS/YR</p>
              <p className="text-2xl font-black tabular-nums">{formatCompact(financials.grossRevenue * 12)}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">NET/YR</p>
              <p className="text-2xl font-black text-pink-500 tabular-nums">{formatCompact(financials.netIncome * 12)}</p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-3">
          <button className="px-5 py-3 glass rounded-xl border border-slate-300 dark:border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-all"><Upload size={16}/> UPLOAD</button>
          <button onClick={() => window.print()} className="px-5 py-3 glass rounded-xl border border-slate-300 dark:border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-all"><Printer size={16}/> PRINT</button>
          <button className="px-7 py-3 brand-bg text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-pink-500/20 hover:opacity-90 transition-all"><Save size={16}/> SAVE SESSION</button>
        </div>
      </header>

      <main className="flex-1 p-8 lg:p-12 max-w-[1600px] mx-auto w-full space-y-12">
        <section className="space-y-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 brand-bg/10 rounded-2xl brand-text"><LayoutGrid size={24} /></div>
              <div><h2 className="text-4xl font-display font-black text-slate-950 dark:text-white italic tracking-tighter uppercase leading-none">Economics Matrix</h2><p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.4em] mt-1">Modeling Efficiency & Production Velocity</p></div>
            </div>
            <div className="flex bg-slate-200/50 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-300 dark:border-white/10">
              <button onClick={() => setModelingMode('granular')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${modelingMode === 'granular' ? 'brand-bg text-white' : 'text-slate-500'}`}><Layers size={14} /> Portfolio Structuring</button>
              <button onClick={() => setModelingMode('executive')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${modelingMode === 'executive' ? 'brand-bg text-white' : 'text-slate-500'}`}><Rocket size={14} /> Strategic Forecast</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
            {modelingMode === 'granular' ? (
              <>
                <div className="space-y-6 flex flex-col h-full animate-in fade-in slide-in-from-left-4 duration-500">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Monthly Packages</h3>
                  <div className="flex-1 grid grid-cols-1 gap-6">
                    {packages.map((pkg, i) => (
                      <label key={i} className="glass p-8 rounded-[2.5rem] border-slate-300 dark:border-white/5 cursor-pointer block min-h-[160px] flex flex-col justify-center transition-all hover:bg-white dark:hover:bg-slate-900/60 shadow-sm">
                        <div className="flex justify-between items-start mb-2"><span className="text-base font-black text-slate-400 uppercase">{pkg.name}</span><span className="text-sm font-black text-slate-400">${pkg.price} ea</span></div>
                        <div className="flex items-end justify-between">
                          <input type="number" min="0" value={pkg.orders} onChange={e => { const n = [...packages]; n[i].orders = parseInt(e.target.value) || 0; setPackages(n); }} className="bg-transparent text-6xl font-black text-slate-800 dark:text-slate-100 w-full focus:outline-none tabular-nums" />
                          <div className="text-right shrink-0"><p className="text-sm font-black text-slate-400 uppercase mb-1">Subtotal</p><p className="text-2xl font-black text-emerald-500">{formatUSD(pkg.price * pkg.orders)}</p></div>
                        </div>
                        {pkg.name.toLowerCase().includes('lux') && (
                           <div className="mt-4 flex gap-2 overflow-hidden">
                             <span className="px-3 py-1 bg-pink-500/10 text-[9px] font-black text-pink-600 rounded-lg uppercase tracking-widest border border-pink-500/20 whitespace-nowrap">+1 Video Included</span>
                             <span className="px-3 py-1 bg-indigo-500/10 text-[9px] font-black text-indigo-600 rounded-lg uppercase tracking-widest border border-indigo-500/20 whitespace-nowrap">+2 Twilights Included</span>
                           </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-6 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Fulfillment Load</h3>
                  <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {upsells.map((up, i) => {
                      let calcTotal = up.count;
                      let icon = <Plus size={14} className="text-slate-400" />;
                      if (up.name.toLowerCase().includes('video')) {
                        calcTotal = totalVideosNeeded;
                        icon = <Video size={14} className="text-pink-500" />;
                      }
                      if (up.name.toLowerCase().includes('virtual staging')) {
                        calcTotal = totalStagingNeeded;
                        icon = <Laptop size={14} className="text-emerald-500" />;
                      }
                      if (up.name === 'Twilight') {
                        calcTotal = totalTwilightsNeeded;
                        icon = <Moon size={14} className="text-indigo-500" />;
                      }
                      // New specific icons
                      if (up.name.includes('On-Site Twilight')) icon = <Camera size={14} className="text-orange-500" />;
                      if (up.name.includes('3D Architectural')) icon = <Layers size={14} className="text-blue-500" />;
                      if (up.name.includes('Same Day Floor Plan')) icon = <MapIcon size={14} className="text-purple-500" />;

                      return (
                        <label key={i} className="glass p-6 rounded-[2rem] border-slate-300 dark:border-white/5 cursor-pointer flex flex-col transition-all hover:bg-white dark:hover:bg-slate-900/60 shadow-sm min-h-[160px]">
                          <div className="mb-2">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-2">
                                {icon}
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight leading-tight">{up.name}</span>
                              </div>
                              <span className="text-[9px] font-black text-slate-400 shrink-0">${up.price}</span>
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <div className="flex items-end justify-between gap-2">
                              <input type="number" min="0" value={up.count} onChange={e => { const n = [...upsells]; n[i].count = parseInt(e.target.value) || 0; setUpsells(n); }} className="bg-transparent text-4xl font-black text-slate-800 dark:text-slate-100 w-full focus:outline-none tabular-nums" />
                              <div className="text-right shrink-0">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Subtotal</p>
                                <p className="text-base font-black text-emerald-500">{formatCompact(up.price * up.count)}</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/5 w-full">
                              <Activity size={10} className="text-emerald-500" />
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Total: <span className="text-slate-900 dark:text-white font-bold">{calcTotal}</span></span>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="md:col-span-2 space-y-6 flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Strategic Logic</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                  <label className="glass p-12 rounded-[3.5rem] border border-slate-300 dark:border-white/5 cursor-pointer flex flex-col justify-center transition-all hover:bg-white dark:hover:bg-slate-900/60 shadow-sm">
                    <span className="text-xl font-black text-slate-400 uppercase tracking-widest mb-6 block">Avg Order Value</span>
                    <div className="flex items-baseline gap-4"><span className="text-4xl font-black text-slate-400">$</span><input type="number" value={executiveAOV} onChange={e => setExecutiveAOV(parseInt(e.target.value) || 0)} className="bg-transparent text-8xl font-black text-slate-800 dark:text-slate-100 w-full focus:outline-none tabular-nums" /></div>
                  </label>
                  <label className="glass p-12 rounded-[3.5rem] border border-slate-300 dark:border-white/5 cursor-pointer flex flex-col justify-center transition-all hover:bg-white dark:hover:bg-slate-900/60 shadow-sm">
                    <span className="text-xl font-black text-slate-400 uppercase tracking-widest mb-6 block">Monthly Volume</span>
                    <div className="flex items-baseline gap-4"><input type="number" value={executiveVolume} onChange={e => setExecutiveVolume(parseInt(e.target.value) || 0)} className="bg-transparent text-8xl font-black text-slate-800 dark:text-slate-100 w-44 focus:outline-none tabular-nums" /><span className="text-2xl font-black text-slate-400 uppercase">Orders</span></div>
                  </label>
                </div>
                <div className="p-8 bg-slate-200/40 dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-300 dark:border-white/5 flex gap-6 items-center">
                   <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm"><CheckCircle2 size={24}/></div>
                   <p className="text-xs font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed uppercase tracking-wider">Strategy active. COGS are auto-modeled via proportional load (35% Video, 15% Twilight).</p>
                </div>
              </div>
            )}
            <div className="space-y-6 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Operations</h3>
              <div className="flex-1 grid grid-cols-1 gap-6">
                {[
                  { label: 'Weeks / Year', value: weeks, setter: setWeeks, sub: 'Weeks', icon: <Palmtree className="text-orange-600 opacity-40" size={28} /> },
                  { label: 'Days / Week', value: days, setter: setDays, sub: 'Days', icon: <Calendar className="text-indigo-600 opacity-40" size={28} /> },
                  { label: modelingMode === 'executive' ? 'Target Profit Floor' : 'Photos / Shoot', value: modelingMode === 'executive' ? targetMarginFloor : imagesPerShoot, setter: modelingMode === 'executive' ? setTargetMarginFloor : setImagesPerShoot, sub: modelingMode === 'executive' ? '% Net' : 'Photos', icon: modelingMode === 'executive' ? <ShieldCheck className="text-emerald-600 opacity-40" size={28} /> : <Camera className="text-pink-600 opacity-40" size={28} /> }
                ].map((tune, i) => (
                  <label key={i} className="glass p-8 rounded-[2.5rem] relative group border-slate-300 dark:border-white/5 cursor-pointer block min-h-[160px] flex flex-col justify-center transition-all hover:bg-white dark:hover:bg-slate-900/60 shadow-sm">
                    <div className="absolute top-6 right-6">{tune.icon}</div>
                    <span className="text-base font-black text-slate-400 uppercase tracking-widest mb-4 block">{tune.label}</span>
                    <div className="flex items-baseline gap-4"><input type="number" min="0" value={tune.value} onChange={e => tune.setter(parseInt(e.target.value) || 0)} className="bg-transparent text-6xl font-black text-slate-800 dark:text-slate-100 w-32 focus:outline-none tabular-nums" /><span className="text-sm font-black text-slate-400 uppercase">{tune.sub}</span></div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- SUMMARY GRID SECTION --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
          <div className="glass p-8 rounded-[2.5rem] border border-slate-300 dark:border-white/5 flex items-center gap-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center text-pink-600 dark:text-pink-400"><Calculator size={28}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">GROSS REVENUE</p>
              <p className="text-3xl font-black tabular-nums brand-text">{formatUSD(financials.grossRevenue)}</p>
            </div>
          </div>
          <div className="glass p-8 rounded-[2.5rem] border border-slate-300 dark:border-white/5 flex items-center gap-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400"><Target size={28}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">BLENDED AOV</p>
              <p className="text-3xl font-black tabular-nums text-emerald-700 dark:text-emerald-400">{formatUSD(financials.grossRevenue / Math.max(1, totalVolume))}</p>
            </div>
          </div>
          <div className="glass p-8 rounded-[2.5rem] border border-slate-300 dark:border-white/5 flex items-center gap-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400"><Calendar size={28}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">VOLUME</p>
              <p className="text-3xl font-black tabular-nums text-indigo-700 dark:text-indigo-400">{totalVolume} Units / Mo</p>
            </div>
          </div>
          <div className="glass p-8 rounded-[2.5rem] border border-slate-300 dark:border-white/5 flex items-center gap-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400"><Clock size={28}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">EFFICIENCY</p>
              <p className="text-3xl font-black tabular-nums text-amber-700 dark:text-amber-500">{financials.founderLoad.toFixed(1)} Shoots/Day</p>
            </div>
          </div>
        </section>

        <Separator />

        {/* --- SAAS PIPELINE --- */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-600 border border-indigo-500/20"><Settings2 size={32} /></div>
              <div><h2 className="text-5xl font-display font-black text-slate-950 dark:text-white italic tracking-tighter uppercase leading-none">SaaS Pipeline</h2><p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mt-2 italic">CONFIGURE FULFILLMENT INFRASTRUCTURE</p></div>
            </div>
            <div className="flex bg-slate-200/50 dark:bg-white/5 p-2 rounded-2xl border border-slate-300 dark:border-white/10 no-print">
              {(['monthly', 'yearly'] as BillingCycle[]).map(cycle => (
                <button key={cycle} onClick={() => setBillingCycle(cycle)} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${billingCycle === cycle ? 'brand-bg text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{cycle}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="glass p-12 rounded-[3.5rem] border border-slate-300 dark:border-white/5 space-y-10 shadow-sm flex flex-col min-h-[450px]">
              <div className="flex items-center gap-4 mb-2"><div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-600"><Camera size={28}/></div><div><h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Photo Pipeline</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IMAGE EDITING & QA</p></div></div>
              <div className="grid grid-cols-3 gap-3 no-print">
                {(['fotello', 'autohdr', 'manual'] as PhotoVendor[]).map(v => (
                  <button key={v} onClick={() => setPhotoVendor(v)} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${photoVendor === v ? 'brand-bg text-white shadow-xl' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-white/5 text-slate-500 hover:text-slate-700'}`}>{v}</button>
                ))}
              </div>
              <div className="space-y-4 flex-1">
                 <div className="flex justify-between items-center text-sm font-bold text-slate-500"><span className="uppercase tracking-widest">Active Vendor:</span><span className="text-slate-950 dark:text-white uppercase font-black">{photoVendor}</span></div>
                 {photoVendor === 'manual' && <div className="p-6 bg-slate-100 dark:bg-slate-950/40 rounded-2xl border border-slate-300 dark:border-white/5 mt-4"><label className="text-[9px] font-black uppercase text-slate-400 block mb-2 tracking-widest">COST PER IMAGE ($)</label><input type="number" step="0.01" min="0" value={manualPhotoCost} onChange={e => setManualPhotoCost(parseFloat(e.target.value) || 0)} className="bg-transparent text-3xl font-black text-slate-950 dark:text-white w-full focus:outline-none" /></div>}
              </div>
              <div className="pt-8 border-t border-slate-300 dark:border-white/5 mt-auto"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ESTIMATED MONTHLY COST</p><p className="text-4xl font-black text-pink-600 tabular-nums">{formatUSD(financials.cogsPhoto)}</p></div>
            </div>
            <div className="glass p-12 rounded-[3.5rem] border border-slate-300 dark:border-white/5 space-y-10 shadow-sm flex flex-col min-h-[450px]">
              <div className="flex items-center gap-4 mb-2"><div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600"><Video size={28}/></div><div><h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Video Rendering</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI GENERATION</p></div></div>
              <div className="grid grid-cols-3 gap-2 no-print">
                {(['autoreel', 'videotour', 'amplifiles'] as VideoVendor[]).map(v => (
                  <button key={v} onClick={() => setVideoVendor(v)} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${videoVendor === v ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-white/5 text-slate-500 hover:text-slate-700'}`}>{v}</button>
                ))}
              </div>
              <div className="space-y-4 flex-1">
                 <div className="flex justify-between items-center text-sm font-bold text-slate-500"><span className="uppercase tracking-widest">Render Mode:</span><span className="text-slate-950 dark:text-white uppercase font-black">{videoVendor}</span></div>
              </div>
              <div className="pt-8 border-t border-slate-300 dark:border-white/5 mt-auto"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ESTIMATED MONTHLY COST</p><p className="text-4xl font-black text-indigo-600 tabular-nums">{formatUSD(financials.cogsVideo)}</p></div>
            </div>
          </div>
        </section>

        <Separator />

        {/* --- FLEET SECTION --- */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 brand-bg rounded-2xl flex items-center justify-center text-white shadow-xl shadow-pink-500/20"><Users size={32} /></div>
              <div><h2 className="text-5xl font-display font-black text-slate-950 dark:text-white italic tracking-tighter uppercase leading-none">BrightHouse Fleet</h2><p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mt-2 italic">LABOR CAPACITY (CALIFORNIA STANDARD)</p></div>
            </div>
            <button onClick={addContractor} className="px-8 py-4 brand-bg text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-pink-500/30 hover:opacity-90 transition-all flex items-center gap-3 no-print"><UserPlus size={16} /> ADD CONTRACTOR</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 auto-rows-fr">
             <div className="glass p-12 rounded-[3.5rem] border border-slate-300 dark:border-white/5 space-y-12 shadow-sm flex flex-col min-h-[500px]">
                <div className="space-y-8 flex-1">
                  <div className="flex justify-between items-start"><div><h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight uppercase leading-none mb-1">Founder / Owner</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">PRIMARY CAPACITY</p></div><div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 border border-pink-500/20"><Shield size={24} /></div></div>
                  <div className="space-y-4"><div className="flex justify-between items-end mb-1 px-1"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WORKLOAD SHARE</p><p className="text-2xl font-black brand-text italic">{Math.max(0, 100 - contractors.reduce((a, b) => a + b.share, 0))}%</p></div><div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden"><div className="h-full brand-bg transition-all duration-700 ease-out" style={{ width: `${Math.max(0, 100 - contractors.reduce((a, b) => a + b.share, 0))}%` }}></div></div></div>
                </div>
                <div className="flex items-center gap-4 pt-8 border-t border-slate-300 dark:border-white/5 mt-auto"><div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"><Clock size={20} /></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ESTIMATED LOAD</p><p className="text-xl font-black text-slate-800 dark:text-white tabular-nums">{financials.founderLoad.toFixed(1)} Shoots / Day</p></div></div>
             </div>
             {contractors.map((c, idx) => {
               const cOrders = totalVolume * (c.share / 100);
               let cCost = 0;
               if (c.model === 'flat') cCost = cOrders * c.flatRate;
               else if (c.model === 'percent') cCost = grossRevenue * (c.share / 100) * (c.percentRate / 100);
               else cCost = cOrders * (c.hybridBase + (c.hybridVideoBonus * (totalVideosNeeded / Math.max(1, totalVolume))));
               
               const cLoad = (totalVolume * (c.share / 100)) / Math.max(1, (weeks * days) / 12);

               return (
                <div key={c.id} className="glass p-12 rounded-[3.5rem] border border-slate-300 dark:border-white/5 space-y-12 relative group shadow-sm flex flex-col min-h-[600px]">
                  <button onClick={() => setContractors(contractors.filter((_, i) => i !== idx))} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-colors no-print"><Trash2 size={22} /></button>
                  
                  <div className="space-y-8 flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <input type="text" value={c.name} onChange={e => { const n = [...contractors]; n[idx].name = e.target.value; setContractors(n); }} className="bg-transparent text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight focus:outline-none w-full border-b-2 border-slate-200 dark:border-slate-800 focus:border-pink-500/50 pb-2 mb-1 transition-colors" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">CALIFORNIA CONTRACTOR</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 ml-4"><GraduationCap size={24} /></div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end mb-1 px-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WORKLOAD SHARE</p>
                        <p className="text-2xl font-black brand-text italic">{c.share}%</p>
                      </div>
                      {/* Integrated High-Fidelity Slider Replacement */}
                      <input type="range" min="0" max="100" value={c.share} onChange={e => { const n = [...contractors]; n[idx].share = parseInt(e.target.value); setContractors(n); }} className="w-full h-2 mt-4 cursor-pointer" />
                    </div>

                    <div className="space-y-6 pt-4">
                      <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 no-print">
                        {(['flat', 'percent', 'hybrid'] as LaborModel[]).map(m => (
                          <button key={m} onClick={() => { const n = [...contractors]; n[idx].model = m; setContractors(n); }} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${c.model === m ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{m}</button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {c.model === 'flat' && (
                          <div className="col-span-2 p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-300 dark:border-white/5">
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 tracking-widest">FLAT RATE / SHOOT</label>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-black text-slate-400">$</span>
                              <input type="number" value={c.flatRate} onChange={e => { const n = [...contractors]; n[idx].flatRate = parseInt(e.target.value) || 0; setContractors(n); }} className="bg-transparent text-2xl font-black text-slate-800 dark:text-white focus:outline-none w-full" />
                            </div>
                          </div>
                        )}
                        {c.model === 'percent' && (
                          <div className="col-span-2 p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-300 dark:border-white/5">
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 tracking-widest">REVENUE SHARE %</label>
                            <div className="flex items-center gap-2">
                              <input type="number" value={c.percentRate} onChange={e => { const n = [...contractors]; n[idx].percentRate = parseInt(e.target.value) || 0; setContractors(n); }} className="bg-transparent text-2xl font-black text-slate-800 dark:text-white focus:outline-none w-full" />
                              <span className="text-xl font-black text-slate-400">%</span>
                            </div>
                          </div>
                        )}
                        {c.model === 'hybrid' && (
                          <>
                            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-300 dark:border-white/5">
                              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 tracking-widest">BASE / SHOOT</label>
                              <div className="flex items-center gap-1">
                                <span className="text-lg font-black text-slate-400">$</span>
                                <input type="number" value={c.hybridBase} onChange={e => { const n = [...contractors]; n[idx].hybridBase = parseInt(e.target.value) || 0; setContractors(n); }} className="bg-transparent text-xl font-black text-slate-800 dark:text-white focus:outline-none w-full" />
                              </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-300 dark:border-white/5">
                              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 tracking-widest">VIDEO BONUS</label>
                              <div className="flex items-center gap-1">
                                <span className="text-lg font-black text-slate-400">$</span>
                                <input type="number" value={c.hybridVideoBonus} onChange={e => { const n = [...contractors]; n[idx].hybridVideoBonus = parseInt(e.target.value) || 0; setContractors(n); }} className="bg-transparent text-xl font-black text-slate-800 dark:text-white focus:outline-none w-full" />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-300 dark:border-white/5 mt-auto">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"><Clock size={18} /></div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">EST. LOAD</p>
                        <p className="text-base font-black text-slate-800 dark:text-white tabular-nums">{cLoad.toFixed(1)}/Day</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right justify-end">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">MO. COST</p>
                        <p className="text-base font-black text-emerald-600 tabular-nums">{formatUSD(cCost)}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500"><DollarSign size={18} /></div>
                    </div>
                  </div>
                </div>
               );
             })}
          </div>
        </section>

        <Separator />

        {/* --- EXECUTIVE MASTERY CENTER --- */}
        <div className={containerStyle}>
          <section className="space-y-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-slate-900 border border-white/5 rounded-3xl flex items-center justify-center brand-text shadow-2xl"><BrainCircuit size={40} className="text-emerald-400" /></div>
                <div>
                  <h2 className="text-4xl font-display font-black text-slate-950 dark:text-white italic tracking-tighter uppercase leading-none">Executive Mastery Center</h2>
                  <p className="text-xs md:text-sm font-black text-slate-700 dark:text-slate-400 uppercase tracking-[0.4em] mt-2 flex items-center gap-2"><Target size={14}/> Strategic Portfolio Intelligence</p>
                </div>
              </div>
              <div className="w-full md:w-auto flex gap-12 bg-slate-200/50 dark:bg-white/5 px-10 py-6 rounded-[2.5rem] border border-slate-300 dark:border-white/5 shadow-inner">
                  <div className="text-center"><p className="text-[10px] md:text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-widest mb-1">Health Score</p><p className="text-4xl font-black text-slate-950 dark:text-white">{financials.healthScore}%</p></div>
                  <div className="w-px bg-slate-300 dark:bg-white/10 h-10"></div>
                  <div className="text-right"><p className="text-[10px] md:text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-widest mb-1">Annual EBITDA</p><p className="text-4xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">{formatUSD(financials.ebitda * 12)}</p></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#0f172a] p-10 rounded-[3.5rem] border border-white/10 space-y-8 relative overflow-hidden group shadow-2xl">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Milestone size={120} className="text-emerald-400" /></div>
                 <div className="relative z-10 flex items-center gap-4"><div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-400/20"><Shield size={28} /></div><h3 className="text-2xl font-black text-white uppercase tracking-wider">Entity Diagnostic</h3></div>
                 <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-center"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommended Status</p><span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${entityAdvice.urgency === 'High' ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-800 text-slate-300'}`}>{entityAdvice.recommendation}</span></div>
                    <p className="text-lg font-bold text-slate-300 leading-relaxed italic border-l-4 border-emerald-500/40 pl-6">"{entityAdvice.logic}"</p>
                    
                    {/* Reasonable Salary Informational Callout */}
                    {formation === 'scorp' && (
                      <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/20 mt-4 space-y-2 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                          <Receipt size={14} /> Reasonable Salary Requirement
                        </div>
                        <p className="text-sm font-bold text-slate-200">
                          To satisfy IRS compliance, you should declare a W-2 salary of approximately <span className="text-emerald-400">{formatUSD(financials.ebitda * 12 * 0.6)}/yr</span>.
                        </p>
                        <p className="text-[9px] font-bold text-slate-500 italic">
                          (Based on the 60/40 rule of current EBITDA modeling)
                        </p>
                      </div>
                    )}

                    <div className="pt-6 border-t border-white/5 space-y-4">
                       <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-500 tracking-widest"><span>Threshold check</span><span className="text-emerald-400">Projected: {formatUSD(financials.ebitda * 12)}</span></div>
                       <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.min(100, (financials.ebitda * 12 / 80000) * 100)}%` }}></div></div>
                    </div>
                 </div>
              </div>
              <div className="bg-[#0f172a] p-10 rounded-[3.5rem] border border-white/10 space-y-8 relative overflow-hidden group shadow-2xl">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform"><Gem size={120} className="text-pink-400" /></div>
                 <div className="relative z-10 flex items-center gap-4"><div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-400/20"><CalcIcon size={28} /></div><h3 className="text-2xl font-black text-white uppercase tracking-wider">Tax Alpha Audit</h3></div>
                 <div className="relative z-10 grid grid-cols-2 gap-6">
                    <div className="space-y-4"><p className="text-[10px] font-black text-pink-400 uppercase tracking-[0.3em]">STANDARD WRITE-OFFS</p><ul className="space-y-2 text-xs font-bold text-slate-400"><li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div> Camera & Gear</li><li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div> Mileage ($.67/mi)</li><li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div> All SaaS Fees</li><li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div> Home Office %</li></ul></div>
                    <div className="space-y-4"><p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">HIDDEN STRATEGY</p><ul className="space-y-2 text-xs font-bold text-slate-400"><li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Client Gift Credits</li><li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Media Research</li><li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Network Dining</li><li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Mentorship Costs</li></ul></div>
                 </div>
                 <div className="relative z-10 p-6 bg-slate-900 rounded-[2rem] border border-white/5"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PROJ. TAX SAVINGS / YR</p><p className="text-3xl font-black text-white tabular-nums tracking-tighter">~{formatUSD(financials.grossRevenue * 0.18 * 12)}*</p><p className="text-[8px] font-bold text-slate-600 mt-2 italic leading-tight">*Estimation based on average Real Estate Media expense profiles.</p></div>
              </div>
            </div>

            {/* Price War Comparison Grids */}
            <div className="bg-slate-100 dark:bg-slate-900/60 rounded-[3rem] p-10 border border-slate-300 dark:border-white/5 space-y-8 shadow-inner">
              <div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600"><Camera size={20} /></div><h3 className="text-xl font-black uppercase tracking-widest text-slate-950 dark:text-white">Photo Price War: {totalVolume} Listings ({totalImages} Pics) / Mo</h3></div><div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest"><ShieldCheck size={14} /> PIPELINE AUDIT VERIFIED</div></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {photoStackComparison.costs.map((c) => (
                  <div key={c.key} className={`p-8 rounded-[2.5rem] border transition-all flex flex-col h-full ${photoStackComparison.recommended === c.key ? 'brand-border bg-white dark:bg-slate-950 shadow-xl ring-4 ring-pink-500/10' : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-white/5 opacity-80'}`}><div className="flex justify-between items-start mb-6"><p className="text-[11px] font-black uppercase tracking-widest text-slate-500">{c.label}</p>{photoStackComparison.recommended === c.key && <CheckCircle2 size={20} className="text-pink-600" />}</div><div className="space-y-1 mb-8"><p className="text-4xl font-black text-slate-950 dark:text-white tabular-nums leading-none">${c.cost.toFixed(2)}</p><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Monthly TCO</p></div><div className="flex-1 space-y-3 pt-6 border-t border-slate-200 dark:border-white/5"><div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest"><span>Subscription</span><span>${c.sub.toFixed(0)}</span></div><div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest"><span>Extras</span><span>${c.extras.toFixed(2)}</span></div></div><div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5"><div className="flex items-center gap-2 mb-2"><SearchCode size={14} className="text-slate-400" /><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Math Verification</p></div><p className="text-[9px] font-bold text-slate-600 dark:text-slate-300 italic leading-tight bg-slate-200/50 dark:bg-white/5 p-3 rounded-xl border border-slate-300 dark:border-white/5 font-mono">{c.formula}</p></div></div>
                ))}
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-900/60 rounded-[3rem] p-10 border border-slate-300 dark:border-white/5 space-y-8 shadow-inner">
              <div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600"><Scale size={20} /></div><h3 className="text-xl font-black uppercase tracking-widest text-slate-950 dark:text-white">Video Price War: {totalVideosNeeded} Videos / Mo</h3></div><div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest"><AlertCircle size={14} /> TCO AUDIT VERIFIED</div></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {videoStackComparison.costs.map((c) => (
                  <div key={c.key} className={`p-8 rounded-[2.5rem] border transition-all flex flex-col h-full ${videoStackComparison.recommended === c.key ? 'border-indigo-600 bg-white dark:bg-slate-950 shadow-xl' : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-white/5 opacity-80'}`}><div className="flex justify-between items-start mb-6"><p className="text-[11px] font-black uppercase tracking-widest text-slate-500">{c.label}</p>{videoStackComparison.recommended === c.key && <CheckCircle2 size={20} className="text-indigo-600" />}</div><div className="space-y-1 mb-8"><p className="text-4xl font-black text-slate-950 dark:text-white tabular-nums leading-none">${c.cost.toFixed(2)}</p><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Monthly TCO</p></div><div className="flex-1 space-y-3 pt-6 border-t border-slate-200 dark:border-white/5"><div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest"><span>Subscription</span><span>${c.sub.toFixed(0)}</span></div><div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest"><span>Extras</span><span>${c.extras.toFixed(2)}</span></div></div><div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5"><div className="flex items-center gap-2 mb-2"><SearchCode size={14} className="text-slate-400" /><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Math Verification</p></div><p className="text-[9px] font-bold text-slate-600 dark:text-slate-300 italic leading-tight bg-slate-200/50 dark:bg-white/5 p-3 rounded-xl border border-slate-300 dark:border-white/5 font-mono">{c.formula}</p></div></div>
                ))}
              </div>
            </div>

            {/* Bottom Mastery Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
              <div className="grid grid-rows-3 gap-6 h-full">
                <div className="glass p-10 rounded-[3rem] border border-slate-300 dark:border-white/10 flex flex-col justify-center space-y-6">
                  <div className="flex justify-between items-center"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600"><TrendingUp size={20} /></div><div><h4 className="text-lg font-black uppercase tracking-tight">PROFITABILITY</h4><p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">LEAN DOMINANCE</p></div></div><div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">FOCUS METRIC</p><p className="text-2xl font-black">{((financials.totalCOGS / financials.grossRevenue) * 100).toFixed(2)}% COGS</p></div></div>
                  <div className="space-y-3"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-300 dark:border-white/5 pb-1">COACH'S DIRECTIVE</p><p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed italic">"Your production discipline is elite. Focus on maximizing automation utilization—every 1% reduction in fulfillment leakage compounds into significant bottom-line growth. In the current market, profitability isn't just about revenue; it's about the delta between your gross margin and your operational overhead. Avoid over-staffing during peak months; instead, lean into the elasticity of your current fulfillment pipeline. Reinvest surplus profit into high-yield marketing assets that lower your client acquisition cost (CAC) over time."</p></div>
                </div>
                <div className="glass p-10 rounded-[3rem] border border-slate-300 dark:border-white/10 flex flex-col justify-center space-y-6">
                  <div className="flex justify-between items-center"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600"><Activity size={20} /></div><div><h4 className="text-lg font-black uppercase tracking-tight">SCALABILITY</h4><p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">SUSTAINABLE CEO</p></div></div><div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">FOCUS METRIC</p><p className="text-2xl font-black">{financials.founderLoad.toFixed(1)}/Day</p></div></div>
                  <div className="space-y-3"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-300 dark:border-white/5 pb-1">COACH'S DIRECTIVE</p><p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed italic">"Sustainability is the hallmark of an Architect. Your current rhythm allows for 'Strategic Expansion' without founder burnout. Scaling is a test of process, not a test of effort. Use this headroom to document SOPs and harden your CRM automation so that a new team member can be onboarded in under 48 hours. Identify your 'Freedom Number'—the volume at which you can step back from the field entirely. Your goal is to move from being the 'Artist' to the 'System Designer' who manages the fleet from a dashboard."</p></div>
                </div>
                <div className="glass p-10 rounded-[3rem] border border-slate-300 dark:border-white/10 flex flex-col justify-center space-y-6">
                  <div className="flex justify-between items-center"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600"><Trophy size={20} /></div><div><h4 className="text-lg font-black uppercase tracking-tight">AUTHORITY</h4><p className="text-[9px] font-black text-purple-600 uppercase tracking-tight">MARKET DOMINANCE</p></div></div><div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AOV TARGET</p><p className="text-2xl font-black">${modelingMode === 'executive' ? executiveAOV : (financials.grossRevenue / Math.max(1, totalVolume)).toFixed(0)}</p></div></div>
                  <div className="space-y-3"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-300 dark:border-white/5 pb-1">COACH'S DIRECTIVE</p><p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed italic">"Brand authority is measured by price floor and the clients you refuse to work with. Protect your AOV by refusing to discount, even in high-volume negotiations. Luxury is defined by exclusivity and quality control; focus your marketing on high-value portfolios to attract premium listings that naturally carry higher margins. Develop a 'Premium Loop' where your best clients receive specialized perks that don't cost you labor, but increase their perceived LTV. Your brand should be the standard by which all others in your market are judged."</p></div>
                </div>
              </div>

              {/* HIGH-FIDELITY FINANCIAL STACK STRATEGY RESTORATION */}
              <div className="bg-[#f0faf7] dark:bg-emerald-950/10 p-12 rounded-[4rem] border border-emerald-100 dark:border-emerald-900/20 space-y-12 shadow-sm flex flex-col">
                <div className="flex items-center gap-4">
                  <Lightbulb size={32} className="text-emerald-600" />
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">FINANCIAL STACK STRATEGY</h3>
                </div>
                
                <div className="space-y-10 flex-1 flex flex-col justify-between">
                  {/* Photo Infrastructure Block */}
                  <div className="bg-white dark:bg-slate-900/60 p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/5 space-y-8">
                     <div className="flex justify-between items-center">
                       <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">PHOTO INFRASTRUCTURE</p>
                       <span className="text-[13px] font-black text-emerald-600 uppercase tracking-widest">OPTIMIZED</span>
                     </div>
                     <div className="relative">
                       {photoVendor.toLowerCase() !== photoStackComparison.recommended.toLowerCase() && (
                         <div className="absolute -inset-4 border-2 border-dashed border-blue-400 rounded-[3rem] pointer-events-none z-10 opacity-60"></div>
                       )}
                       <div className="grid grid-cols-2 gap-6 relative z-0">
                         <div className="bg-[#f8fafc] dark:bg-slate-800/40 p-8 rounded-3xl border border-slate-100 dark:border-white/5">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">CURRENT CHOICE</p>
                           <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 uppercase">{photoVendor}</p>
                         </div>
                         <div className="bg-[#f8fafc] dark:bg-slate-800/40 p-8 rounded-3xl border border-slate-100 dark:border-white/5">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">RECOMMENDATION</p>
                           <p className="text-2xl font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
                             {photoStackComparison.recommended.charAt(0).toUpperCase() + photoStackComparison.recommended.slice(1)} 
                             <CheckCircle2 size={20} className="text-emerald-500" />
                           </p>
                         </div>
                       </div>
                     </div>
                     <div className={`p-8 rounded-3xl border space-y-3 transition-all ${photoVendor.toLowerCase() !== photoStackComparison.recommended.toLowerCase() ? 'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800/30' : 'bg-white border-emerald-100 dark:bg-slate-900 dark:border-emerald-900/30'}`}>
                       <div className={`flex items-center gap-2 text-[10px] font-black uppercase ${photoVendor.toLowerCase() !== photoStackComparison.recommended.toLowerCase() ? 'text-blue-600' : 'text-emerald-600'}`}>
                         <Info size={18} /> STRATEGIC REASONING
                       </div>
                       <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                         {photoVendor === photoStackComparison.recommended 
                           ? `${photoVendor.charAt(0).toUpperCase() + photoVendor.slice(1)} is optimized. By including 2 twilights and 2 staging renders per listing, you are effectively neutralizing fulfillment leakage while benefiting from a zero-fee white-label portal.` 
                           : `Pivot to ${photoStackComparison.recommended.toUpperCase()} immediately to recover admin overhead and capture bulk tier efficiencies.`}
                       </p>
                     </div>
                  </div>

                  {/* Video Infrastructure Block */}
                  <div className="bg-white dark:bg-slate-900/60 p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/5 space-y-8">
                     <div className="flex justify-between items-center">
                       <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">VIDEO INFRASTRUCTURE</p>
                       <span className="text-[13px] font-black text-emerald-600 uppercase tracking-widest">OPTIMIZED</span>
                     </div>
                     <div className="relative">
                       {videoVendor.toLowerCase() !== videoStackComparison.recommended.toLowerCase() && (
                         <div className="absolute -inset-4 border-2 border-dashed border-blue-400 rounded-[3rem] pointer-events-none z-10 opacity-60"></div>
                       )}
                       <div className="grid grid-cols-2 gap-6 relative z-0">
                         <div className="bg-[#f8fafc] dark:bg-slate-800/40 p-8 rounded-3xl border border-slate-100 dark:border-white/5">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">CURRENT CHOICE</p>
                           <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 uppercase">{videoVendor}</p>
                         </div>
                         <div className="bg-[#f8fafc] dark:bg-slate-800/40 p-8 rounded-3xl border border-slate-100 dark:border-white/5">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">RECOMMENDATION</p>
                           <p className="text-2xl font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
                             {videoStackComparison.recommended.charAt(0).toUpperCase() + videoStackComparison.recommended.slice(1)} 
                             <CheckCircle2 size={20} className="text-emerald-500" />
                           </p>
                         </div>
                       </div>
                     </div>
                     <div className={`p-8 rounded-3xl border space-y-3 transition-all ${videoVendor.toLowerCase() !== videoStackComparison.recommended.toLowerCase() ? 'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800/30' : 'bg-white border-emerald-100 dark:bg-slate-900 dark:border-emerald-900/30'}`}>
                       <div className={`flex items-center gap-2 text-[10px] font-black uppercase ${videoVendor.toLowerCase() !== photoVendor.toLowerCase() ? 'text-blue-600' : 'text-emerald-600'}`}>
                         <Info size={18} /> STRATEGIC REASONING
                       </div>
                       <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                         {videoVendor === videoStackComparison.recommended 
                           ? `${videoVendor.charAt(0).toUpperCase() + videoVendor.slice(1)} is current TCO leader (${formatUSD(financials.cogsVideo)}). Efficiency Zone: verified math includes credit optimization for rendering. WARNING: Efficiency Zone active.` 
                           : `Pivot to ${videoStackComparison.recommended.toUpperCase()} immediately to recover per-video rendering waste and improve margins.`}
                       </p>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <Separator />

        {/* Growth Roadmap */}
        <section className="space-y-12">
            <div className="flex items-center gap-6"><div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20"><Trophy size={32} /></div><div><h2 className="text-5xl font-display font-black text-slate-950 dark:text-white italic tracking-tighter uppercase leading-none">Growth Roadmap</h2><p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.4em] mt-2 italic">BUSINESS COACH'S STEP-BY-STEP DIRECTIVES</p></div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="glass p-10 rounded-[3rem] border border-slate-300 dark:border-white/5 space-y-8 relative overflow-hidden group shadow-sm hover:shadow-md transition-all"><div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><span className="text-8xl font-black italic">01</span></div><div className="w-14 h-14 rounded-2xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center text-pink-600 dark:text-pink-400"><MonitorCheck size={28} /></div><div className="space-y-3"><h4 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Diagnostics</h4><p className="text-[10px] font-black text-pink-600 dark:text-pink-400 uppercase tracking-widest">PHASE: UNIT ECONOMICS</p></div><p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed italic">"Your {((financials.totalCOGS / financials.grossRevenue) * 100).toFixed(1)}% COGS ratio is your primary lever. Ensure every listing includes at least 2 upsells."</p></div>
                <div className="glass p-10 rounded-[3rem] border border-slate-300 dark:border-white/5 space-y-8 relative overflow-hidden group shadow-sm hover:shadow-md transition-all"><div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><span className="text-8xl font-black italic">02</span></div><div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400"><Zap size={28} /></div><div className="space-y-3"><h4 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Automation</h4><p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">PHASE: PIPELINE VELOCITY</p></div><p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed italic">"Pivot to {videoStackComparison.recommended.toUpperCase()} immediately to recover admin overhead per listing."</p></div>
                <div className="glass p-10 rounded-[3rem] border border-slate-300 dark:border-white/5 space-y-8 relative overflow-hidden group shadow-sm hover:shadow-md transition-all"><div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><span className="text-8xl font-black italic">03</span></div><div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400"><Users size={28} /></div><div className="space-y-3"><h4 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Capacity</h4><p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed italic">"With a load of {financials.founderLoad.toFixed(1)} shoots/day, delegate 25% of your volume to a contractor."</p></div><p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">PHASE: FLEET MASTERY</p></div>
                <div className="glass p-10 rounded-[3rem] border border-slate-300 dark:border-white/5 space-y-8 relative overflow-hidden group shadow-sm hover:shadow-md transition-all"><div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><span className="text-8xl font-black italic">04</span></div><div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400"><Sparkles size={28} /></div><div className="space-y-3"><h4 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Wealth Harvest</h4><p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">PHASE: ENTITY OPTIMIZATION</p></div><p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed italic">"Pivot to S-Corp election immediately to capture massive annual tax alpha."</p></div>
            </div>
        </section>

        <Separator />

        {/* Fulfillment COGS Audit */}
        <section className="space-y-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-500/20"><ReceiptText size={32} /></div>
            <div><h2 className="text-5xl font-display font-black text-slate-950 dark:text-white italic tracking-tighter uppercase leading-none">Fulfillment COGS Audit</h2><p className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.4em] mt-2 italic">DIRECT COST BREAKDOWN PER UNIT</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glass p-10 rounded-[3rem] border border-slate-300 dark:border-white/5 space-y-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PHOTO EDITING</p>
              <p className="text-4xl font-black tabular-nums">{formatUSD(financials.cogsPhoto)}</p>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-pink-500" style={{ width: `${(financials.cogsPhoto / Math.max(1, financials.grossRevenue)) * 100}%` }}></div></div>
              <p className="text-[9px] font-bold text-slate-400 italic">Includes bundles + {photoVendor} fee</p>
            </div>
            <div className="glass p-10 rounded-[3rem] border border-slate-300 dark:border-white/5 space-y-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">VIDEO RENDERING</p>
              <p className="text-4xl font-black tabular-nums">{formatUSD(financials.cogsVideo)}</p>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: `${(financials.cogsVideo / Math.max(1, financials.grossRevenue)) * 100}%` }}></div></div>
              <p className="text-[9px] font-bold text-slate-400 italic">Lux inclusions + {videoVendor} overages</p>
            </div>
            <div className="glass p-10 rounded-[3rem] border border-slate-300 dark:border-white/5 space-y-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PLATFORM FEES</p>
              <p className="text-4xl font-black tabular-nums">{formatUSD(financials.cogsPlatform)}</p>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-slate-400" style={{ width: `${(financials.cogsPlatform / Math.max(1, financials.grossRevenue)) * 100}%` }}></div></div>
              <p className="text-[9px] font-bold text-slate-400 italic">Delivery + hosting per listing</p>
            </div>
            <div className="glass p-10 rounded-[3rem] border border-slate-300 dark:border-white/5 space-y-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">FLEET LABOR</p>
              <p className="text-4xl font-black tabular-nums text-rose-600">{formatUSD(financials.cogsLabor)}</p>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-rose-500" style={{ width: `${(financials.cogsLabor / Math.max(1, financials.grossRevenue)) * 100}%` }}></div></div>
              <p className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">Total Active Payroll</p>
            </div>
          </div>
        </section>

        {/* Business OPEX Audit */}
        <section className="space-y-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-white shadow-xl"><Building2 size={32} /></div>
            <div><h2 className="text-5xl font-display font-black text-slate-950 dark:text-white italic tracking-tighter uppercase leading-none">Business OPEX</h2><p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mt-2 italic">FIXED MONTHLY OVERHEAD</p></div>
          </div>
          <div className="glass p-12 rounded-[4rem] border border-slate-300 dark:border-white/5 shadow-inner">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-8">
              {FIXED_OPEX_LIST.map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-slate-400">{item.icon}</div>
                    <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-tight">{item.name}</span>
                  </div>
                  <span className="text-sm font-black tabular-nums">{formatUSD(item.cost)}</span>
                </div>
              ))}
            </div>
            <div className="mt-12 pt-8 border-t-4 border-double border-slate-300 dark:border-white/10 flex justify-between items-end">
              <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">TOTAL MONTHLY FIXED OPEX</p><p className="text-5xl font-black tracking-tighter">{formatUSD(financials.opex)}</p></div>
              <div className="text-right text-slate-400 text-[10px] font-bold uppercase tracking-widest italic leading-relaxed">Admin fees (Gusto/Entity) <br/> included in dynamic model.</div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Monthly Profitability Waterfall */}
        <section className="space-y-12 bg-slate-100 dark:bg-slate-900/20 p-8 md:p-16 rounded-[4rem] border border-slate-300 dark:border-white/10 shadow-inner no-print overflow-hidden">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-8 mb-16">
            <div className="flex items-center gap-8"><div className="w-20 h-20 bg-pink-500 rounded-3xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(236,72,153,0.3)]"><BarChart3 size={44} /></div><div><h2 className="text-4xl sm:text-5xl font-display font-black text-slate-950 dark:text-white italic tracking-tighter uppercase leading-none">Monthly Profitability Waterfall</h2><p className="text-[10px] sm:text-xs font-black text-[#be185d] dark:text-[#ec4899] uppercase tracking-[0.5em] mt-3 italic">Gross-to-net cascade analysis ({formation.toUpperCase()})</p></div></div>
            <div className="bg-emerald-700 dark:bg-emerald-600 px-10 sm:px-16 py-6 sm:py-8 rounded-[3.5rem] text-white shadow-[0_20px_50px_rgba(4,120,87,0.3)] text-center relative overflow-hidden min-w-0 max-w-full">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-1 relative z-10 truncate">OWNER RETENTION / MO</p>
              <p className="text-4xl sm:text-5xl xl:text-6xl font-black tabular-nums relative z-10 tracking-tighter truncate">{formatUSD(financials.netIncome)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 rounded-[3.5rem] p-8 sm:p-10 space-y-10 flex flex-col shadow-md min-w-0">
              <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">STEP 01</span><div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-white/5"><DollarSign size={20} /></div></div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">REVENUE GENERATION</p>
                <p className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tabular-nums tracking-tighter truncate">{formatUSD(financials.grossRevenue)}</p>
              </div>
              <div className="flex-1">
                <div className="bg-slate-50 dark:bg-slate-950/80 rounded-[2.5rem] p-6 space-y-4 border border-slate-300 dark:border-white/5 shadow-inner">
                   {modelingMode === 'executive' ? (
                     <div className="flex flex-col gap-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                       <span className="opacity-60 text-[10px] uppercase">Strategy Target:</span>
                       <span className="text-slate-950 dark:text-white font-black truncate">{executiveVolume} Units @ ${executiveAOV}</span>
                     </div>
                   ) : (
                     <div className="space-y-3">
                       <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200"><span>Packages:</span><span className="text-slate-950 dark:text-white font-black truncate">{formatUSD(grossRevenue - upsells.reduce((s, u) => s + (u.price * u.count), 0))}</span></div>
                       <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200"><span>Upsells:</span><span className="text-pink-700 dark:text-pink-400 font-black truncate">{formatUSD(upsells.reduce((s, u) => s + (u.price * u.count), 0))}</span></div>
                     </div>
                   )}
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 rounded-[3.5rem] p-8 sm:p-10 space-y-10 flex flex-col shadow-md min-w-0">
              <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">STEP 02</span><div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"><Users size={20} /></div></div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">LESS: OP. EXPENSES</p>
                <p className="text-3xl sm:text-4xl font-black text-rose-700 dark:text-rose-400 tabular-nums tracking-tighter truncate">-{formatUSD(financials.totalCOGS + financials.opex)}</p>
              </div>
              <div className="flex-1">
                <div className="bg-rose-50/50 dark:bg-[#2d0f1a]/40 rounded-[2.5rem] p-6 space-y-4 border border-rose-100 dark:border-rose-500/10 shadow-inner">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200"><span>Fleet Labor:</span><span className="text-rose-700 dark:text-rose-400 font-black truncate">-{formatUSD(financials.cogsLabor)}</span></div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200"><span>SaaS/Opex:</span><span className="text-rose-700 dark:text-rose-400 font-black truncate">-{formatUSD(financials.totalCOGS - financials.cogsLabor + financials.opex)}</span></div>
                  <div className="flex justify-between items-center text-xs font-black text-slate-800 dark:text-slate-200 pt-3 border-t border-slate-300 dark:border-white/5"><span>EBITDA:</span><span className="text-slate-950 dark:text-white font-black truncate">{formatUSD(financials.ebitda)}</span></div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 rounded-[3.5rem] p-8 sm:p-10 space-y-10 flex flex-col shadow-md min-w-0">
              <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">STEP 03</span><div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20"><Scale size={20} /></div></div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">LESS: PROGRESSIVE TAX</p>
                <p className="text-3xl sm:text-4xl font-black text-amber-700 dark:text-amber-600 tabular-nums tracking-tighter truncate">-{formatUSD(financials.tax)}</p>
              </div>
              <div className="flex-1">
                <div className="bg-amber-50/50 dark:bg-[#2d1b0f]/40 rounded-[2.5rem] p-6 space-y-4 border border-amber-200 dark:border-amber-500/10 shadow-inner">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200"><span>Fed Income:</span><span className="text-amber-700 dark:text-amber-600 font-black truncate">-{formatUSD(financials.tax * 0.7)}</span></div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200"><span>CA Tax:</span><span className="text-amber-700 dark:text-amber-600 font-black truncate">-{formatUSD(financials.tax * 0.3)}</span></div>
                  <div className="flex justify-between items-center text-xs font-black text-slate-800 dark:text-slate-200 pt-3 border-t border-slate-300 dark:border-white/5"><span>EFF RATE:</span><span className="text-slate-950 dark:text-white font-black truncate">{((financials.tax / Math.max(1, financials.ebitda)) * 100).toFixed(1)}%</span></div>
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="bg-emerald-600/5 dark:bg-emerald-400/10 border border-emerald-600/30 dark:border-emerald-400/20 rounded-[3.5rem] p-8 sm:p-10 space-y-10 flex flex-col shadow-[0_0_60px_rgba(4,120,87,0.1)] min-w-0">
              <div className="flex justify-between items-center"><span className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">RESULT</span><div className="w-10 h-10 rounded-2xl bg-emerald-700 dark:bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-700/20"><Wallet size={20} /></div></div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">TRUE MONTHLY TAKE HOME</p>
                <p className="text-4xl sm:text-5xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums tracking-tighter leading-none truncate">{formatUSD(financials.netIncome)}</p>
              </div>
              <div className="flex-1">
                <div className="bg-white dark:bg-slate-950/60 rounded-[2.5rem] p-6 space-y-4 border border-emerald-600/20 dark:border-emerald-400/20 shadow-inner">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200"><span>Annual Net:</span><span className="text-slate-950 dark:text-white font-black truncate">{formatUSD(financials.netIncome * 12)}</span></div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200"><span>True Margin:</span><span className="text-emerald-700 dark:text-emerald-400 font-black">{financials.margin.toFixed(2)}%</span></div>
                  <div className="text-center pt-4 border-t border-slate-200 dark:border-white/5 mt-2">
                    <p className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.6em] animate-pulse">FINANCIAL VICTORY</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Yearly Profitability Waterfall */}
        <section className="space-y-12 bg-slate-100 dark:bg-slate-900/20 p-8 md:p-16 rounded-[4rem] border border-slate-300 dark:border-white/10 shadow-inner no-print overflow-hidden mt-12">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-8 mb-16">
            <div className="flex items-center gap-8"><div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(79,70,229,0.3)]"><BarChart3 size={44} /></div><div><h2 className="text-4xl sm:text-5xl font-display font-black text-slate-950 dark:text-white italic tracking-tighter uppercase leading-none">Yearly Profitability Waterfall</h2><p className="text-[10px] sm:text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-[0.5em] mt-3 italic">Gross-to-net annual cascade analysis ({formation.toUpperCase()})</p></div></div>
            <div className="bg-emerald-700 dark:bg-emerald-600 px-10 sm:px-16 py-6 sm:py-8 rounded-[3.5rem] text-white shadow-[0_20px_50px_rgba(4,120,87,0.3)] text-center relative overflow-hidden min-w-0 max-w-full">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-1 relative z-10 truncate">OWNER RETENTION / YR</p>
              <p className="text-4xl sm:text-5xl xl:text-6xl font-black tabular-nums relative z-10 tracking-tighter truncate">{formatUSD(financials.netIncome * 12)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 rounded-[3.5rem] p-8 sm:p-10 space-y-10 flex flex-col shadow-md min-w-0">
              <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">STEP 01</span><div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-white/5"><DollarSign size={20} /></div></div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">ANNUAL REVENUE</p>
                <p className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tabular-nums tracking-tighter truncate">{formatUSD(financials.grossRevenue * 12)}</p>
              </div>
              <div className="flex-1">
                <div className="bg-slate-50 dark:bg-slate-950/80 rounded-[2.5rem] p-6 space-y-4 border border-slate-300 dark:border-white/5 shadow-inner">
                   {modelingMode === 'executive' ? (
                     <div className="flex flex-col gap-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                       <span className="opacity-60 text-[10px] uppercase">Strategy Target (Ann):</span>
                       <span className="text-slate-950 dark:text-white font-black truncate">{executiveVolume * 12} Units @ ${executiveAOV}</span>
                     </div>
                   ) : (
                     <div className="space-y-3">
                       <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200"><span>Packages:</span><span className="text-slate-950 dark:text-white font-black truncate">{formatUSD((grossRevenue - upsells.reduce((s, u) => s + (u.price * u.count), 0)) * 12)}</span></div>
                       <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200"><span>Upsells:</span><span className="text-pink-700 dark:text-pink-400 font-black truncate">{formatUSD(upsells.reduce((s, u) => s + (u.price * u.count), 0) * 12)}</span></div>
                     </div>
                   )}
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 rounded-[3.5rem] p-8 sm:p-10 space-y-10 flex flex-col shadow-md min-w-0">
              <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">STEP 02</span><div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"><Users size={20} /></div></div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">LESS: ANNUAL OPEX</p>
                <p className="text-3xl sm:text-4xl font-black text-rose-700 dark:text-rose-400 tabular-nums tracking-tighter truncate">-{formatUSD((financials.totalCOGS + financials.opex) * 12)}</p>
              </div>
              <div className="flex-1">
                <div className="bg-rose-50/50 dark:bg-[#2d0f1a]/40 rounded-[2.5rem] p-6 space-y-4 border border-rose-100 dark:border-rose-500/10 shadow-inner">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200"><span>Fleet Labor:</span><span className="text-rose-700 dark:text-rose-400 font-black truncate">-{formatUSD(financials.cogsLabor * 12)}</span></div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200"><span>SaaS/Opex:</span><span className="text-rose-700 dark:text-rose-400 font-black truncate">-{formatUSD((financials.totalCOGS - financials.cogsLabor + financials.opex) * 12)}</span></div>
                  <div className="flex justify-between items-center text-xs font-black text-slate-800 dark:text-slate-200 pt-3 border-t border-slate-300 dark:border-white/5"><span>EBITDA:</span><span className="text-slate-950 dark:text-white font-black truncate">{formatUSD(financials.ebitda * 12)}</span></div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 rounded-[3.5rem] p-8 sm:p-10 space-y-10 flex flex-col shadow-md min-w-0">
              <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">STEP 03</span><div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-700 dark:text-amber-700 border border-amber-200 dark:border-amber-500/20"><Scale size={20} /></div></div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">LESS: ANNUAL TAX</p>
                <p className="text-3xl sm:text-4xl font-black text-amber-700 dark:text-amber-600 tabular-nums tracking-tighter truncate">-{formatUSD(financials.tax * 12)}</p>
              </div>
              <div className="flex-1">
                <div className="bg-amber-50/50 dark:bg-[#2d1b0f]/40 rounded-[2.5rem] p-6 space-y-4 border border-amber-200 dark:border-amber-500/10 shadow-inner">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200"><span>Fed Income:</span><span className="text-amber-700 dark:text-amber-600 font-black truncate">-{formatUSD(financials.tax * 0.7 * 12)}</span></div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200"><span>CA Tax:</span><span className="text-amber-700 dark:text-amber-600 font-black truncate">-{formatUSD(financials.tax * 0.3 * 12)}</span></div>
                  <div className="flex justify-between items-center text-xs font-black text-slate-800 dark:text-slate-200 pt-3 border-t border-slate-300 dark:border-white/5"><span>EFF RATE:</span><span className="text-slate-950 dark:text-white font-black truncate">{((financials.tax / Math.max(1, financials.ebitda)) * 100).toFixed(1)}%</span></div>
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="bg-emerald-600/5 dark:bg-emerald-400/10 border border-emerald-600/30 dark:border-emerald-400/20 rounded-[3.5rem] p-8 sm:p-10 space-y-10 flex flex-col shadow-[0_0_60px_rgba(4,120,87,0.1)] min-w-0">
              <div className="flex justify-between items-center"><span className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">RESULT</span><div className="w-10 h-10 rounded-2xl bg-emerald-700 dark:bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-700/20"><Wallet size={20} /></div></div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">TRUE YEARLY TAKE HOME</p>
                <p className="text-4xl sm:text-5xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums tracking-tighter leading-none truncate">{formatUSD(financials.netIncome * 12)}</p>
              </div>
              <div className="flex-1">
                <div className="bg-white dark:bg-slate-950/60 rounded-[2.5rem] p-6 space-y-4 border border-emerald-600/20 dark:border-emerald-400/20 shadow-inner">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200"><span>Annual Net:</span><span className="text-slate-950 dark:text-white font-black truncate">{formatUSD(financials.netIncome * 12)}</span></div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200"><span>True Margin:</span><span className="text-emerald-700 dark:text-emerald-400 font-black">{financials.margin.toFixed(2)}%</span></div>
                  <div className="text-center pt-4 border-t border-slate-200 dark:border-white/5 mt-2">
                    <p className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.6em] animate-pulse">YEARLY VICTORY</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="p-12 text-center bg-slate-100/50 dark:bg-slate-950/50 border-t border-slate-300 dark:border-white/5 no-print space-y-4">
        <p className="text-[10px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-[0.5em]">BrightHouse Ops & Strategy • v16.3.5</p>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">© 2026 BrightHouse Applications. All Rights Reserved.</p>
      </footer>
    </div>
  );
}