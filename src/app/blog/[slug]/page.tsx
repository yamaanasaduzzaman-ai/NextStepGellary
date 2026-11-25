import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export const revalidate = 60;

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });

  if (!post) return { title: 'Article Not Found | Nexstep Gazette' };

  return {
    title: `${post.title} | Nexstep Gazette`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#858585] hover:text-[#111111] mb-8 font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Gazette</span>
      </Link>

      <div className="space-y-4 mb-8">
        <span className="text-[11px] font-semibold tracking-[0.25em] text-[#C6AE91] uppercase">
          Nexstep Editorial
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-light text-[#111111] tracking-tight leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center space-x-4 text-xs text-[#858585] pt-2 border-t border-[#EAEAEA]">
          <span>By {post.author}</span>
          <span>•</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>
      </div>

      {post.coverImage && (
        <div className="relative aspect-[16/9] w-full rounded-sm overflow-hidden mb-10 shadow-sm">
          <Image src={post.coverImage} alt={post.title} fill priority className="object-cover" />
        </div>
      )}

      <div className="prose prose-sm max-w-none text-[#252525] text-sm leading-relaxed space-y-6 whitespace-pre-line font-serif">
        {post.content}
      </div>
    </article>
  );
}
