import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export const revalidate = 60;

export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center space-y-2 mb-16">
        <span className="text-xs font-semibold tracking-[0.25em] text-[#C6AE91] uppercase">
          Nexstep Gazette
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-light text-[#111111] uppercase tracking-tight">
          The Fashion Journal
        </h1>
        <p className="text-xs text-[#858585] max-w-md mx-auto">
          Essays on textile heritage, modern minimalism, craftsmanship, and sartorial philosophy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group flex flex-col space-y-4 bg-white p-6 rounded-sm border border-[#EAEAEA] shadow-sm"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-neutral-200 rounded-sm">
              <Image
                src={post.coverImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000'}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#858585]">
                <span>{post.author}</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <h2 className="text-lg font-serif font-medium text-[#111111] group-hover:text-[#C6AE91] transition-colors">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="text-xs text-[#858585] line-clamp-2 leading-relaxed">
                {post.summary}
              </p>
              <div className="pt-2">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-xs font-semibold uppercase tracking-wider text-[#111111] group-hover:text-[#C6AE91] inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
