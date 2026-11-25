import React from 'react';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ShieldCheck, UserPlus } from 'lucide-react';

export const revalidate = 0;

export default async function AdminUsersPage() {
  const staff = await prisma.user.findMany({
    where: {
      role: { not: 'CUSTOMER' },
    },
    include: { adminProfile: true },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-2xl font-serif font-light text-[#111111]">
            Staff Personnel & Role Access Control
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Manage administrative personnel, department titles, and granular operational privileges.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#EAEAEA] text-[#858585]">
                <th className="py-3 px-4 font-semibold uppercase">Staff Member</th>
                <th className="py-3 px-4 font-semibold uppercase">Administrative Role</th>
                <th className="py-3 px-4 font-semibold uppercase">Department & Title</th>
                <th className="py-3 px-4 font-semibold uppercase">Joined Date</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">Access Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {staff.map((u) => (
                <tr key={u.id} className="hover:bg-[#F8F7F4]">
                  <td className="py-3 px-4">
                    <strong className="text-[#111111] font-bold block">{u.name}</strong>
                    <span className="text-[11px] text-[#858585]">{u.email}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 bg-[#111111] text-white rounded text-[10px] font-bold uppercase tracking-wider">
                      {u.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#252525]">
                    <p className="font-medium">{u.adminProfile?.title || 'Executive'}</p>
                    <span className="text-[10px] text-[#858585]">
                      {u.adminProfile?.department || 'Operations'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#858585]">{formatDate(u.createdAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-bold uppercase text-[10px]">
                      Active Staff
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
