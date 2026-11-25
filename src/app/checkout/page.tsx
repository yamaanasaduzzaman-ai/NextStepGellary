'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  Truck,
  CreditCard,
  Lock,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatBDT } from '@/lib/utils';
import { BANGLADESH_DIVISIONS, calculateShippingCharge } from '@/lib/bangladesh-geo';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, refreshCart } = useCart();
  const { user, guestToken } = useAuth();

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingDivision, setShippingDivision] = useState('Dhaka');
  const [shippingDistrict, setShippingDistrict] = useState('Dhaka');
  const [shippingArea, setShippingArea] = useState('');
  const [shippingStreet, setShippingStreet] = useState('');
  const [shippingPostal, setShippingPostal] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH' | 'NAGAD' | 'SSLCOMMERZ'>('COD');

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Prefill if user logged in
  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '');
      setCustomerEmail(user.email || '');
      setCustomerPhone(user.phone || '');

      if (user.addresses && user.addresses.length > 0) {
        const defaultAddr = user.addresses[0];
        setShippingDivision(defaultAddr.division || 'Dhaka');
        setShippingDistrict(defaultAddr.district || 'Dhaka');
        setShippingArea(defaultAddr.area || '');
        setShippingStreet(defaultAddr.street || '');
        setShippingPostal(defaultAddr.postalCode || '');
      }
    }
  }, [user]);

  // Compute live shipping based on chosen district & subtotal
  const shippingCalculation = calculateShippingCharge(shippingDistrict, subtotal, 3000, 70, 130);
  let finalShippingCost = shippingCalculation.cost;
  if (shippingMethod === 'EXPRESS') {
    finalShippingCost += 80;
  }

  const grandTotal = Math.max(0, subtotal - couponDiscount + finalShippingCost);

  // Get districts for current division
  const currentDivisionObj = BANGLADESH_DIVISIONS.find((d) => d.name === shippingDivision);
  const availableDistricts = currentDivisionObj ? currentDivisionObj.districts : ['Dhaka'];

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.isValid) {
        setCouponDiscount(data.discountAmount);
        setCouponApplied(true);
        setCouponMessage(data.message);
      } else {
        setCouponDiscount(0);
        setCouponApplied(false);
        setCouponMessage(data.message || 'Invalid coupon');
      }
    } catch (err) {
      setCouponMessage('Validation error');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName || !customerEmail || !customerPhone || !shippingStreet || !shippingDistrict) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          shippingStreet,
          shippingArea,
          shippingDistrict,
          shippingDivision,
          shippingPostal,
          deliveryInstructions,
          paymentMethod,
          shippingMethod,
          couponCode: couponApplied ? couponCode : undefined,
          guestToken: user ? undefined : guestToken,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await refreshCart();
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          router.push(`/order-confirmation/${data.orderNumber}`);
        }
      } else {
        setErrorMessage(data.error || 'Failed to place order.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network connection failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-xl font-serif text-[#111111]">Your bag is empty</h1>
        <p className="text-xs text-[#858585] mt-2 mb-6">
          Add items before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="px-6 py-2.5 bg-[#111111] text-white text-xs font-semibold uppercase tracking-luxury rounded-sm"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 border-b border-[#EAEAEA] pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-light text-[#111111] uppercase tracking-tight">
            Checkout
          </h1>
          <p className="text-xs text-[#858585]">Complete your luxury order with secure delivery.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#858585]">
          <Lock className="w-3.5 h-3.5 text-[#C6AE91]" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Multi-Step Forms */}
          <div className="lg:col-span-7 space-y-8">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
                {errorMessage}
              </div>
            )}

            {/* STEP 1: Customer Information */}
            <div className="bg-white p-6 rounded-sm border border-[#EAEAEA] space-y-4 shadow-sm">
              <div className="flex items-center space-x-2 border-b border-[#EAEAEA] pb-3">
                <span className="w-5 h-5 bg-[#111111] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                  1
                </span>
                <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111]">
                  Customer Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-[#111111] block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Tanvir Hossain"
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium uppercase tracking-wider text-[#111111] block mb-1">
                    Email Address (for order tracking) *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. tanvir@example.com"
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium uppercase tracking-wider text-[#111111] block mb-1">
                    Phone Number (for courier delivery) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 01700112233"
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>
            </div>

            {/* STEP 2: Shipping Destination in Bangladesh */}
            <div className="bg-white p-6 rounded-sm border border-[#EAEAEA] space-y-4 shadow-sm">
              <div className="flex items-center space-x-2 border-b border-[#EAEAEA] pb-3">
                <span className="w-5 h-5 bg-[#111111] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                  2
                </span>
                <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111]">
                  Shipping Address (Bangladesh)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium uppercase tracking-wider text-[#111111] block mb-1">
                    Division *
                  </label>
                  <select
                    value={shippingDivision}
                    onChange={(e) => {
                      const div = e.target.value;
                      setShippingDivision(div);
                      const divObj = BANGLADESH_DIVISIONS.find((d) => d.name === div);
                      if (divObj && divObj.districts.length > 0) {
                        setShippingDistrict(divObj.districts[0]);
                      }
                    }}
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm bg-white focus:outline-none focus:border-[#111111]"
                  >
                    {BANGLADESH_DIVISIONS.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium uppercase tracking-wider text-[#111111] block mb-1">
                    District *
                  </label>
                  <select
                    value={shippingDistrict}
                    onChange={(e) => setShippingDistrict(e.target.value)}
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm bg-white focus:outline-none focus:border-[#111111]"
                  >
                    {availableDistricts.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium uppercase tracking-wider text-[#111111] block mb-1">
                    Thana / Area
                  </label>
                  <input
                    type="text"
                    value={shippingArea}
                    onChange={(e) => setShippingArea(e.target.value)}
                    placeholder="e.g. Gulshan / Uttara / Agrabad"
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium uppercase tracking-wider text-[#111111] block mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={shippingPostal}
                    onChange={(e) => setShippingPostal(e.target.value)}
                    placeholder="e.g. 1212"
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-[#111111] block mb-1">
                    Street Address, House & Flat Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingStreet}
                    onChange={(e) => setShippingStreet(e.target.value)}
                    placeholder="House 12, Road 4, Block B"
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-[#111111] block mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    placeholder="e.g. Call before delivery, leave with building reception"
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>
            </div>

            {/* STEP 3: Delivery Speed */}
            <div className="bg-white p-6 rounded-sm border border-[#EAEAEA] space-y-4 shadow-sm">
              <div className="flex items-center space-x-2 border-b border-[#EAEAEA] pb-3">
                <span className="w-5 h-5 bg-[#111111] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                  3
                </span>
                <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111]">
                  Delivery Method
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-4 border rounded-sm flex items-start justify-between cursor-pointer transition-all ${
                    shippingMethod === 'STANDARD'
                      ? 'border-[#111111] bg-[#F8F7F4]'
                      : 'border-[#EAEAEA] hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === 'STANDARD'}
                      onChange={() => setShippingMethod('STANDARD')}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#111111]">Standard Delivery</p>
                      <p className="text-[11px] text-[#858585] mt-0.5">
                        {shippingCalculation.estimatedDays}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#111111]">
                    {shippingCalculation.isFree ? 'FREE' : formatBDT(shippingCalculation.cost)}
                  </span>
                </label>

                <label
                  className={`p-4 border rounded-sm flex items-start justify-between cursor-pointer transition-all ${
                    shippingMethod === 'EXPRESS'
                      ? 'border-[#111111] bg-[#F8F7F4]'
                      : 'border-[#EAEAEA] hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === 'EXPRESS'}
                      onChange={() => setShippingMethod('EXPRESS')}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#111111]">Express VIP Delivery</p>
                      <p className="text-[11px] text-[#858585] mt-0.5">Priority same-day dispatch</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#111111]">
                    {formatBDT(shippingCalculation.cost + 80)}
                  </span>
                </label>
              </div>
            </div>

            {/* STEP 4: Payment Method */}
            <div className="bg-white p-6 rounded-sm border border-[#EAEAEA] space-y-4 shadow-sm">
              <div className="flex items-center space-x-2 border-b border-[#EAEAEA] pb-3">
                <span className="w-5 h-5 bg-[#111111] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                  4
                </span>
                <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111]">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label
                  className={`p-4 border rounded-sm flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-[#111111] bg-[#F8F7F4]'
                      : 'border-[#EAEAEA] hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                    />
                    <div>
                      <p className="text-xs font-bold text-[#111111]">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-[#858585]">
                        Pay in cash when your parcel is delivered to your doorstep.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#111111] text-white rounded-sm">
                    Popular
                  </span>
                </label>

                {/* bKash */}
                <label
                  className={`p-4 border rounded-sm flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'BKASH'
                      ? 'border-[#111111] bg-[#F8F7F4]'
                      : 'border-[#EAEAEA] hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'BKASH'}
                      onChange={() => setPaymentMethod('BKASH')}
                    />
                    <div>
                      <p className="text-xs font-bold text-[#111111]">bKash Direct Gateway</p>
                      <p className="text-[11px] text-[#858585]">
                        Instant zero-charge payment via bKash merchant integration.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded">
                    bKash
                  </span>
                </label>

                {/* Nagad */}
                <label
                  className={`p-4 border rounded-sm flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'NAGAD'
                      ? 'border-[#111111] bg-[#F8F7F4]'
                      : 'border-[#EAEAEA] hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'NAGAD'}
                      onChange={() => setPaymentMethod('NAGAD')}
                    />
                    <div>
                      <p className="text-xs font-bold text-[#111111]">Nagad Direct Gateway</p>
                      <p className="text-[11px] text-[#858585]">
                        Pay instantly with your Nagad wallet account.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                    Nagad
                  </span>
                </label>

                {/* SSLCommerz / Cards */}
                <label
                  className={`p-4 border rounded-sm flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'SSLCOMMERZ'
                      ? 'border-[#111111] bg-[#F8F7F4]'
                      : 'border-[#EAEAEA] hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'SSLCOMMERZ'}
                      onChange={() => setPaymentMethod('SSLCOMMERZ')}
                    />
                    <div>
                      <p className="text-xs font-bold text-[#111111]">
                        Debit / Credit Cards & Internet Banking
                      </p>
                      <p className="text-[11px] text-[#858585]">
                        Visa, MasterCard, Amex, City Bank, Brac Bank via SSLCommerz.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    Cards / NetBanking
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Placement */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-sm border border-[#EAEAEA] shadow-sm space-y-6">
              <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111] border-b border-[#EAEAEA] pb-3">
                Items in Order ({items.length})
              </h2>

              {/* Items List */}
              <div className="max-h-80 overflow-y-auto space-y-4 pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex space-x-3 text-xs">
                    <div className="relative w-14 h-18 bg-[#ECE8E1] rounded-sm overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.images?.[0]?.url || 'https://via.placeholder.com/100'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#111111] line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-[#858585]">
                        {item.size} | {item.color}
                      </p>
                      <p className="text-[11px] text-[#858585]">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-[#111111]">
                      {formatBDT(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Accordion */}
              <div className="pt-4 border-t border-[#EAEAEA] space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon (e.g. NEXSTEP10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-[#EAEAEA] rounded-sm uppercase focus:outline-none focus:border-[#111111]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3 py-2 bg-[#111111] text-white text-xs font-semibold uppercase rounded-sm hover:bg-[#C6AE91] hover:text-[#111111]"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-[11px] ${couponApplied ? 'text-emerald-700' : 'text-red-600'}`}>
                    {couponMessage}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="pt-4 border-t border-[#EAEAEA] space-y-2 text-xs">
                <div className="flex justify-between text-[#858585]">
                  <span>Subtotal</span>
                  <span className="text-[#111111] font-semibold">{formatBDT(subtotal)}</span>
                </div>

                {couponApplied && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span>-{formatBDT(couponDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#858585]">
                  <span>Delivery Charge ({shippingCalculation.isInsideDhaka ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                  <span className="text-[#111111] font-semibold">
                    {finalShippingCost === 0 ? 'FREE' : formatBDT(finalShippingCost)}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#EAEAEA] flex justify-between text-base font-bold text-[#111111]">
                  <span>Total Payable</span>
                  <span>{formatBDT(grandTotal)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#111111] text-white text-xs font-bold tracking-luxury uppercase rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
              >
                <span>{isSubmitting ? 'Processing Order...' : 'Place Order'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-[#858585] text-center leading-relaxed">
                By placing this order, you agree to Nexstep Gallery&apos;s Terms of Service and
                Delivery Policies.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
