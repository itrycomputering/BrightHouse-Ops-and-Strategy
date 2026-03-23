import React from 'react';
import { 
  Scale, Globe, Mail, ShieldCheck, MapPin, Phone, Key, Camera, 
  Layers, Receipt, Shirt, ShieldAlert, Bot, HardDrive, Gift
} from 'lucide-react';

export const FIXED_OPEX_LIST = [
  { name: "Legal/Tax Compliance (CA)", cost: 66.67, icon: <Scale size={16}/> },
  { name: "Domain Name", cost: 3.02, icon: <Globe size={16}/> },
  { name: "Professional Email", cost: 1.57, icon: <Mail size={16}/> },
  { name: "Registered Agent", cost: 10.42, icon: <ShieldCheck size={16}/> },
  { name: "Virtual Address", cost: 29.00, icon: <MapPin size={16}/> },
  { name: "Business Phone", cost: 15.00, icon: <Phone size={16}/> },
  { name: "MLS Access/Key", cost: 25.00, icon: <Key size={16}/> },
  { name: "Gear Depreciation Fund", cost: 150.00, icon: <Camera size={16}/> },
  { name: "Business Insurance", cost: 65.00, icon: <ShieldCheck size={16}/> },
  { name: "Adobe Photography Plan", cost: 20.99, icon: <Layers size={16}/> },
  { name: "QuickBooks Online", cost: 35.00, icon: <Receipt size={16}/> },
  { name: "Marketing & Swag", cost: 100.00, icon: <Shirt size={16}/> },
  { name: "Emergency Reserve", cost: 150.00, icon: <ShieldAlert size={16}/> },
  { name: "AI Suite (GPT/MJ)", cost: 40.00, icon: <Bot size={16}/> },
  { name: "AWS Cloud Backup", cost: 25.00, icon: <HardDrive size={16}/> },
  { name: "Client Gifting (LTV)", cost: 75.00, icon: <Gift size={16}/> },
];

export const PHOTO_PRICING = {
  autohdr: {
    tiers: [
      { name: 'Basic', price: 28.50, limit: 50, topup: 0.57 },
      { name: 'Standard', price: 265.00, limit: 500, topup: 0.53 },
      { name: 'Professional', price: 500.00, limit: 1000, topup: 0.50 }
    ],
    twilight: 2.50,
    staging: 5.00,
    spiroFee: 5.00
  },
  fotello: {
    monthly: 22.00,
    yearly: 18.00,
    overage: 1.00,
    whiteLabelFee: 2.00,
    allowancePerListing: {
      twilight: 2,
      staging: 2
    }
  }
};

export const VIDEO_PRICING = {
  videotour: {
    monthly: [
      { name: 'Independant', limit: 10, price: 39 },
      { name: 'Agency', limit: 40, price: 79 },
      { name: 'Enterprise', limit: 200, price: 159 }
    ],
    yearly: [
      { name: 'Independant', limit: 10, price: 29 },
      { name: 'Agency', limit: 40, price: 59 },
      { name: 'Enterprise', limit: 200, price: 99 }
    ],
    creditPacks: [
      { size: 3500, price: 99 },
      { size: 800, price: 29 },
      { size: 200, price: 9 },
      { size: 100, price: 5 }
    ],
    imagesPerVideo: 20,
    creditsPerImage: 10
  },
  autoreel: {
    monthly: {
      essential: { name: 'Essential', price: 59, included: 3, overage: 20 },
      growth: { name: 'Growth', price: 139, included: 10, overage: 14 },
      pro: { name: 'Pro', price: 249, included: 20, overage: 12 }
    },
    yearly: {
      essential: { name: 'Essential', price: 30, included: 25 / 12, overage: 16 },
      growth: { name: 'Growth', price: 90, included: 100 / 12, overage: 12 },
      pro: { name: 'Pro', price: 165, included: 200 / 12, overage: 11 }
    }
  },
  amplifiles: {
    costPerVideo: 30.00 // Assuming 20 photos @ $1.50 each
  }
};