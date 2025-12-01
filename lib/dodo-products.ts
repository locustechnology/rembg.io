// Dodo Payment Product Configuration
// This file centralizes all product definitions to avoid duplication

export interface DodoProduct {
  id: string;
  name: string;
  price: number;
  credits: number;
  billing_interval: 'monthly' | 'annually';
  description: string;
}

export function getDodoProducts(): DodoProduct[] {
  // Validate that all required environment variables are present
  const requiredEnvVars = [
    'DODO_PRODUCT_STARTER_MONTHLY',
    'DODO_PRODUCT_PREMIUM_MONTHLY',
    'DODO_PRODUCT_STARTER_ANNUAL',
    'DODO_PRODUCT_PREMIUM_ANNUAL'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return [
    {
      id: process.env.DODO_PRODUCT_STARTER_MONTHLY!,
      name: 'Starter',
      price: 5.00,
      credits: 25,
      billing_interval: 'monthly',
      description: 'Perfect for occasional use - 25 credits monthly'
    },
    {
      id: process.env.DODO_PRODUCT_PREMIUM_MONTHLY!,
      name: 'Premium',
      price: 10.00,
      credits: 50,
      billing_interval: 'monthly',
      description: 'Best value for regular users - 50 credits monthly'
    },
    {
      id: process.env.DODO_PRODUCT_STARTER_ANNUAL!,
      name: 'Starter',
      price: 60.00,
      credits: 300,
      billing_interval: 'annually',
      description: 'Perfect for occasional use - 300 credits annually (save $0)'
    },
    {
      id: process.env.DODO_PRODUCT_PREMIUM_ANNUAL!,
      name: 'Premium', 
      price: 120.00,
      credits: 600,
      billing_interval: 'annually',
      description: 'Best value for regular users - 600 credits annually (save $0)'
    }
  ];
}

export function findProductById(productId: string): DodoProduct | undefined {
  const products = getDodoProducts();
  return products.find(product => product.id === productId);
}

export function getProductsByBillingInterval(billingInterval: 'monthly' | 'annually'): DodoProduct[] {
  const products = getDodoProducts();
  return products.filter(product => product.billing_interval === billingInterval);
}