import React from 'react';
import ProductForm from '@/components/admin/ProductForm';

export const metadata = {
  title: 'Add New Product | Nexstep Gallery Admin',
};

export default function NewProductPage() {
  return <ProductForm isEdit={false} />;
}
