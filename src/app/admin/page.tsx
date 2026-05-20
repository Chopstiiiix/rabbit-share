import { APP_ADMIN_EMAIL, hasVerifiedAppAdminEmail } from "@/lib/admin";
import { getCategoryLabel } from "@/lib/celebration-categories";
import { prisma } from "@/lib/prisma";
import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { list } from "@vercel/blob";
import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Database,
  Film,
  Gauge,
  HardDrive,
  LayoutDashboard,
  Link as LinkIcon,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BlobSummary = {
  bytes: number;
  count: number;
  unavailable: boolean;
};

const numberFormatter = new Intl.NumberFormat("en-US");
const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatCompact(value: number) {
  return compactFormatter.format(value);
}

function formatBytes(bytes: number) {
  if (bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function getStartOfToday() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
}

function buildLastSevenDays() {
  const today = getStartOfToday();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    return {
      key: date.toISOString().slice(0, 10),
      label: dateFormatter.format(date),
      start: date,
    };
  });
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function summarizeBlobPrefix(prefix: string): Promise<BlobSummary> {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.VERCEL_OIDC_TOKEN) {
    return { bytes: 0, count: 0, unavailable: true };
  }

  try {
    let cursor: string | undefined;
    let bytes = 0;
    let count = 0;

    do {
      const page = await list({ prefix, cursor, limit: 1000 });
      bytes += page.blobs.reduce((total, blob) => total + blob.size, 0);
      count += page.blobs.length;
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);

    return { bytes, count, unavailable: false };
  } catch (error) {
    console.error(`Unable to load Blob metrics for ${prefix}`, error);
    return { bytes: 0, count: 0, unavailable: true };
  }
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="motion-pop rounded-2xl border border-white/10 bg-neutral-900 p-5 shadow-2xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-400">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>

        <div className="rounded-2xl bg-pink-500/15 p-3 text-pink-200">
          <Icon size={22} />
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-neutral-400">{detail}</p>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-neutral-950/60 p-6 text-sm text-neutral-400">
      <p className="font-semibold text-neutral-200">{title}</p>
      <p className="mt-2 leading-6">{body}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const user = await currentUser();
  const isAdmin = hasVerifiedAppAdminEmail(user?.emailAddresses);

  if (!isAdmin) {
    notFound();
  }

  const todayStart = getStartOfToday();
  const sevenDays = buildLastSevenDays();
  const sevenDaysAgo = sevenDays[0].start;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalEvents,
    totalSubmissions,
    totalFinalVideos,
    eventsToday,
    submissionsToday,
    eventsLast30Days,
    submissionsLast30Days,
    uniqueOrganizerRows,
    recentEvents,
    recentSubmissions,
    categoryGroups,
    eventsForActivity,
    submissionsForActivity,
    uploadsStorage,
    finalStorage,
  ] = await Promise.all([
    prisma.celebration.count(),
    prisma.submission.count(),
    prisma.finalVideo.count(),
    prisma.celebration.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.submission.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.celebration.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.submission.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.celebration.findMany({
      where: { organizerId: { not: null } },
      distinct: ["organizerId"],
      select: { organizerId: true },
    }),
    prisma.celebration.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { submissions: true } },
        finalVideo: true,
      },
    }),
    prisma.submission.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        celebration: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    }),
    prisma.celebration.groupBy({
      by: ["category", "customCategory"],
      _count: { _all: true },
    }),
    prisma.celebration.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.submission.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
    summarizeBlobPrefix("uploads/"),
    summarizeBlobPrefix("final/"),
  ]);

  const storageUnavailable = uploadsStorage.unavailable || finalStorage.unavailable;
  const totalStorageBytes = uploadsStorage.bytes + finalStorage.bytes;
  const totalBlobObjects = uploadsStorage.count + finalStorage.count;
  const collectingEvents = Math.max(totalEvents - totalFinalVideos, 0);
  const averageSubmissions =
    totalEvents > 0 ? totalSubmissions / totalEvents : 0;
  const renderRate =
    totalEvents > 0 ? Math.round((totalFinalVideos / totalEvents) * 100) : 0;

  const activityRows = sevenDays.map((day) => {
    const events = eventsForActivity.filter(
      (event) => dayKey(event.createdAt) === day.key,
    ).length;
    const submissions = submissionsForActivity.filter(
      (submission) => dayKey(submission.createdAt) === day.key,
    ).length;

    return {
      ...day,
      events,
      submissions,
      total: events + submissions,
    };
  });
  const maxActivity = Math.max(...activityRows.map((row) => row.total), 1);

  const categoryRows = categoryGroups
    .map((group) => ({
      label: getCategoryLabel(group.category, group.customCategory),
      count: group._count._all,
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 8);
  const maxCategoryCount = Math.max(...categoryRows.map((row) => row.count), 1);

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-7xl space-y-8">
        <header className="motion-rise flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-pink-300/20 bg-pink-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">
              <ShieldCheck size={14} />
              Admin only
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Rabbit Share metrics
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-300">
              Signed in as {APP_ADMIN_EMAIL}. App data, storage, and event
              health are calculated server-side on each load.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="pressable-card rounded-full border border-white/10 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Organizer view
            </Link>
            <UserButton />
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={LayoutDashboard}
            label="Events"
            value={formatNumber(totalEvents)}
            detail={`${formatNumber(eventsToday)} created today, ${formatNumber(eventsLast30Days)} in the last 30 days.`}
          />
          <MetricCard
            icon={Video}
            label="Submissions"
            value={formatNumber(totalSubmissions)}
            detail={`${formatNumber(submissionsToday)} submitted today, ${formatNumber(submissionsLast30Days)} in the last 30 days.`}
          />
          <MetricCard
            icon={Film}
            label="Final videos"
            value={formatNumber(totalFinalVideos)}
            detail={`${renderRate}% of events have a generated montage. ${formatNumber(collectingEvents)} still collecting.`}
          />
          <MetricCard
            icon={Users}
            label="Organizers"
            value={formatNumber(uniqueOrganizerRows.length)}
            detail={`${averageSubmissions.toFixed(1)} average submissions per event across the app.`}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="motion-rise rounded-3xl border border-white/10 bg-neutral-900 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-pink-200">
                  Activity
                </p>
                <h2 className="mt-2 text-2xl font-bold">Last 7 days</h2>
              </div>
              <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-neutral-300">
                Events + submissions
              </span>
            </div>

            <div className="mt-6 grid min-h-64 grid-cols-7 items-end gap-2">
              {activityRows.map((row) => (
                <div key={row.key} className="flex h-full flex-col justify-end">
                  <div className="flex min-h-44 flex-col justify-end rounded-2xl bg-neutral-950 p-2">
                    <div
                      className="rounded-xl bg-pink-500"
                      style={{
                        height: `${Math.max(8, (row.total / maxActivity) * 160)}px`,
                      }}
                    />
                  </div>
                  <p className="mt-3 text-center text-xs font-semibold text-neutral-200">
                    {formatCompact(row.total)}
                  </p>
                  <p className="mt-1 text-center text-[11px] text-neutral-500">
                    {row.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="motion-rise rounded-3xl border border-white/10 bg-neutral-900 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-pink-200">
                  Storage
                </p>
                <h2 className="mt-2 text-2xl font-bold">Vercel Blob</h2>
              </div>
              <HardDrive className="text-pink-200" size={24} />
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-neutral-950 p-4">
                <p className="text-sm text-neutral-500">Total app media</p>
                <p className="mt-2 text-3xl font-bold">
                  {storageUnavailable ? "Unavailable" : formatBytes(totalStorageBytes)}
                </p>
                <p className="mt-2 text-sm text-neutral-400">
                  {formatNumber(totalBlobObjects)} objects under uploads/ and
                  final/.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-neutral-950 p-4">
                  <p className="text-sm text-neutral-500">Uploaded clips</p>
                  <p className="mt-2 text-xl font-bold">
                    {formatBytes(uploadsStorage.bytes)}
                  </p>
                  <p className="mt-1 text-sm text-neutral-400">
                    {formatNumber(uploadsStorage.count)} files
                  </p>
                </div>
                <div className="rounded-2xl bg-neutral-950 p-4">
                  <p className="text-sm text-neutral-500">Final renders</p>
                  <p className="mt-2 text-xl font-bold">
                    {formatBytes(finalStorage.bytes)}
                  </p>
                  <p className="mt-1 text-sm text-neutral-400">
                    {formatNumber(finalStorage.count)} files
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="motion-rise rounded-3xl border border-white/10 bg-neutral-900 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-pink-200">
                  Category mix
                </p>
                <h2 className="mt-2 text-2xl font-bold">Top event types</h2>
              </div>
              <BarChart3 className="text-pink-200" size={24} />
            </div>

            <div className="mt-6 space-y-3">
              {categoryRows.length === 0 ? (
                <EmptyState
                  title="No category data yet"
                  body="New production events will appear here as organizers create them."
                />
              ) : (
                categoryRows.map((category) => (
                  <div key={category.label}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-neutral-200">
                        {category.label}
                      </span>
                      <span className="text-neutral-400">
                        {formatNumber(category.count)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-950">
                      <div
                        className="h-full rounded-full bg-pink-500"
                        style={{
                          width: `${Math.max(6, (category.count / maxCategoryCount) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="motion-rise rounded-3xl border border-white/10 bg-neutral-900 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-pink-200">
                  Health
                </p>
                <h2 className="mt-2 text-2xl font-bold">System snapshot</h2>
              </div>
              <Database className="text-pink-200" size={24} />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-neutral-950 p-4">
                <CheckCircle2 className="text-green-300" size={22} />
                <p className="mt-3 text-sm text-neutral-500">Database</p>
                <p className="mt-1 font-semibold">Connected</p>
              </div>
              <div className="rounded-2xl bg-neutral-950 p-4">
                <HardDrive className="text-pink-200" size={22} />
                <p className="mt-3 text-sm text-neutral-500">Blob metrics</p>
                <p className="mt-1 font-semibold">
                  {storageUnavailable ? "Needs token" : "Connected"}
                </p>
              </div>
              <div className="rounded-2xl bg-neutral-950 p-4">
                <CalendarClock className="text-pink-200" size={22} />
                <p className="mt-3 text-sm text-neutral-500">Last refreshed</p>
                <p className="mt-1 font-semibold">
                  {dateTimeFormatter.format(new Date())}
                </p>
              </div>
              <div className="rounded-2xl bg-neutral-950 p-4">
                <ShieldCheck className="text-pink-200" size={22} />
                <p className="mt-3 text-sm text-neutral-500">Access</p>
                <p className="mt-1 font-semibold">Admin email only</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="motion-rise rounded-3xl border border-white/10 bg-neutral-900 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-pink-200">
                  Events
                </p>
                <h2 className="mt-2 text-2xl font-bold">Recent events</h2>
              </div>
              <LayoutDashboard className="text-pink-200" size={24} />
            </div>

            <div className="mt-5 space-y-3">
              {recentEvents.length === 0 ? (
                <EmptyState
                  title="No events yet"
                  body="The app is production-ready and waiting for the first real event."
                />
              ) : (
                recentEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/dashboard/${event.slug}`}
                    className="pressable-card block rounded-2xl border border-white/10 bg-neutral-950 p-4 hover:border-pink-300/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {event.title}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {getCategoryLabel(event.category, event.customCategory)}
                        </p>
                      </div>
                      <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-neutral-300">
                        {event.finalVideo ? "Ready" : "Collecting"}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-neutral-400">
                      <span>{formatNumber(event._count.submissions)} submissions</span>
                      <span>{dateTimeFormatter.format(event.createdAt)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="motion-rise rounded-3xl border border-white/10 bg-neutral-900 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-pink-200">
                  Submissions
                </p>
                <h2 className="mt-2 text-2xl font-bold">Latest clips</h2>
              </div>
              <LinkIcon className="text-pink-200" size={24} />
            </div>

            <div className="mt-5 space-y-3">
              {recentSubmissions.length === 0 ? (
                <EmptyState
                  title="No submissions yet"
                  body="Submitted clips will appear here with the event they belong to."
                />
              ) : (
                recentSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="rounded-2xl border border-white/10 bg-neutral-950 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {submission.name}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {submission.celebration.title}
                        </p>
                      </div>
                      <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-neutral-300">
                        {submission.approved ? "Approved" : "Pending"}
                      </span>
                    </div>
                    <p className="mt-4 text-xs text-neutral-400">
                      {dateTimeFormatter.format(submission.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
