"use client";

import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/logo.svg" // pastikan ada di folder public/
        alt="NodeOps Logo"
        width={40}
        height={40}
        priority
      />
      <span className="text-xl font-semibold text-gray-100">NodeOps</span>
    </Link>
  );
}
