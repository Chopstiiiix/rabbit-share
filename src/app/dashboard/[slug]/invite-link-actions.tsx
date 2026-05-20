"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";

export default function InviteLinkActions({ inviteLink }: { inviteLink: string }) {
  const [copied, setCopied] = useState(false);

  async function copyInviteLink() {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function shareInviteLink() {
    if (navigator.share) {
      await navigator.share({
        title: "Rabbit Share invite",
        text: "Add your video message to this Rabbit Share montage.",
        url: inviteLink,
      });
      return;
    }

    await copyInviteLink();
  }

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
      <input
        readOnly
        value={inviteLink}
        onFocus={(event) => event.currentTarget.select()}
        className="w-full rounded-2xl bg-neutral-800 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 transition focus:ring-pink-400"
        aria-label="Invite link"
      />

      <button
        type="button"
        onClick={copyInviteLink}
        className="pressable-cta inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black"
      >
        {copied ? <Check size={18} /> : <Copy size={18} />}
        {copied ? "Copied" : "Copy"}
      </button>

      <button
        type="button"
        onClick={shareInviteLink}
        className="pressable-cta inline-flex items-center justify-center gap-2 rounded-2xl bg-pink-500 px-4 py-3 text-sm font-semibold text-white"
      >
        <Share2 size={18} />
        Share
      </button>
    </div>
  );
}
