'use client';

import React, { Suspense } from 'react';
import AllPosts from '@/views/AllPosts';

export default function PostsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <AllPosts />
    </Suspense>
  );
}
