export type BillingCycle = 'monthly' | 'yearly';
export type PhotoVendor = 'autohdr' | 'fotello' | 'manual';
export type VideoVendor = 'videotour' | 'autoreel' | 'amplifiles';
export type LaborModel = 'flat' | 'percent' | 'hybrid';
export type EntityFormation = 'llc' | 'scorp';

export interface Branding {
  companyName: string;
  brandColor: string;
  logoUrl: string;
}

export interface PackageTier {
  name: string;
  price: number;
  orders: number;
}

export interface Upsell {
  name: string;
  price: number;
  count: number;
}

export interface Contractor {
  id: string;
  name: string;
  share: number;
  model: LaborModel;
  flatRate: number;
  percentRate: number;
  hybridBase: number;
  hybridVideoBonus: number;
}

export interface Financials {
  grossRevenue: number;
  cogsPhoto: number;
  cogsVideo: number;
  cogsPlatform: number;
  cogsLabor: number;
  totalCOGS: number;
  grossProfit: number;
  opex: number;
  ebitda: number;
  tax: number;
  netIncome: number;
  margin: number;
  founderLoad: number;
  healthScore: number;
}