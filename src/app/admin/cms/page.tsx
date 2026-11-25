import React from 'react';
import Image from 'next/image';
import prisma from '@/lib/prisma';

export const revalidate = 0;

export default async function AdminCMSPage() {
  const [banners, announcements, blogPosts] = await Promise.all([
    prisma.banner.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.announcement.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="pb-6 border-b border-[#EAEAEA]">
        <h1 className="text-2xl font-serif font-light text-[#111111]">
          Content Management System (CMS)
        </h1>
        <p className="text-xs text-[#858585] mt-0.5">
          Configure editorial banners, rotating marquee announcements, and fashion journal articles.
        </p>
      </div>

      {/* Banners */}
      <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#EAEAEA] bg-[#F8F7F4]">
          <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111]">
            Homepage Editorial Banners ({banners.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#EAEAEA] text-[#858585]">
                <th className="py-3 px-4 font-semibold uppercase">Banner Preview</th>
                <th className="py-3 px-4 font-semibold uppercase">Headline</th>
                <th className="py-3 px-4 font-semibold uppercase">Placement</th>
                <th className="py-3 px-4 font-semibold uppercase">Call to Action</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {banners.map((b) => (
                <tr key={b.id} className="hover:bg-[#F8F7F4]">
                  <td className="py-3 px-4">
                    <div className="relative w-20 h-10 rounded overflow-hidden bg-neutral-200">
                      <Image src={b.desktopImage} alt={b.title} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#111111]">{b.title}</td>
                  <td className="py-3 px-4 uppercase text-[10px] font-bold text-[#858585]">
                    {b.placement}
                  </td>
                  <td className="py-3 px-4 text-[#858585]">
                    {b.ctaText} → {b.ctaLink}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded text-[10px] font-bold uppercase">
                      Live
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#EAEAEA] bg-[#F8F7F4]">
          <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111]">
            Top Marquee Announcement Messages ({announcements.length})
          </h2>
        </div>
        <div className="divide-y divide-[#EAEAEA] text-xs">
          {announcements.map((a) => (
            <div key={a.id} className="p-4 flex items-center justify-between">
              <span className="font-semibold text-[#111111]">{a.text}</span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded text-[10px] font-bold uppercase">
                Active in Rotation
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
