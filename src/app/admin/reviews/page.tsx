'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    try {
      setLoading(true);
      // Fetch reviews through product query
      const res = await fetch('/api/products?limit=50&admin=true');
      const data = await res.json();
      let allReviews: any[] = [];
      if (data.products) {
        data.products.forEach((p: any) => {
          if (p.reviews) {
            p.reviews.forEach((r: any) => {
              allReviews.push({ ...r, productName: p.name });
            });
          }
        });
      }
      setReviews(allReviews);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggleApproval = async (reviewId: string, currentStatus: boolean) => {
    try {
      await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, isApproved: !currentStatus }),
      });
      loadReviews();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="pb-6 border-b border-[#EAEAEA]">
        <h1 className="text-2xl font-serif font-light text-[#111111]">
          Customer Reviews & Moderation
        </h1>
        <p className="text-xs text-[#858585] mt-0.5">
          Moderate verified client impressions and publish star ratings to product pages.
        </p>
      </div>

      <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#EAEAEA] text-[#858585]">
                <th className="py-3 px-4 font-semibold uppercase">Product</th>
                <th className="py-3 px-4 font-semibold uppercase">Author</th>
                <th className="py-3 px-4 font-semibold uppercase">Rating</th>
                <th className="py-3 px-4 font-semibold uppercase">Review Content</th>
                <th className="py-3 px-4 font-semibold uppercase">Verified</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">Moderation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#858585]">
                    No reviews awaiting moderation.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F8F7F4]">
                    <td className="py-3 px-4 font-bold text-[#111111]">{r.productName}</td>
                    <td className="py-3 px-4 text-[#252525] font-semibold">{r.authorName}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-0.5 text-[#C6AE91]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < r.rating ? 'fill-[#C6AE91]' : 'text-neutral-300'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      {r.title && <strong className="text-[#111111] block">{r.title}</strong>}
                      <p className="text-[#858585] line-clamp-2">{r.comment}</p>
                    </td>
                    <td className="py-3 px-4">
                      {r.isVerifiedPurchase ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          Verified Buyer
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400">Guest Reviewer</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleApproval(r.id, r.isApproved)}
                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                          r.isApproved
                            ? 'bg-emerald-50 text-emerald-800 hover:bg-red-50 hover:text-red-800'
                            : 'bg-neutral-200 text-neutral-800 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        {r.isApproved ? 'Approved (Click to Unpublish)' : 'Approve & Publish'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
