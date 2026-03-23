export type ModelingMode = 'granular' | 'executive';
export type BillingCycle = 'monthly' | 'yearly';
export type Formation = 'LLC' | 'S-Corp';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ContractorModel = 'Flat Rate' | 'Revenue Share' | 'Hybrid';

export interface Profile {
  id?: string;
  companyName: string;
  brandColor: string;
  modelingMode: ModelingMode;
  billingCycle: BillingCycle;
  formation: Formation;
  themeMode: ThemeMode;
  weeksPerYear: number;
  daysPerWeek: number;
  imagesPerShoot: number;
  photoVendor: string;
  videoVendor: string;
  manualPhotoCost: number;
  targetMarginFloor: number;
  ownerUid: string;
}

export interface Package {
  id?: string;
  profileId: string;
  name: string;
  price: number;
  orders: number;
}

export interface Upsell {
  id?: string;
  profileId: string;
  name: string;
  price: number;
  count: number;
}

export interface Contractor {
  id?: string;
  profileId: string;
  name: string;
  share: number;
  model: ContractorModel;
  flatRate: number;
  percentRate: number;
  hybridBase: number;
  hybridVideoBonus: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalContractorCost: number;
  grossMargin: number;
  marginPercentage: number;
}
