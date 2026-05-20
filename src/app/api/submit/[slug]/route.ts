import { prisma } from "@/lib/prisma";
import { resolveSubmissionCelebration } from "@/lib/legacy-celebrations";

export const runtime = "nodejs";

type SubmitVideoRequest = {
  name?: string;
  message?: string;
  videoUrl?: string;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const inviteCelebration = await prisma.celebration.findUnique({
    where: { slug },
  });

  if (!inviteCelebration) {
    return Response.json({ error: "Celebration not found" }, { status: 404 });
  }

  const celebration = await resolveSubmissionCelebration(inviteCelebration);

  const body = (await req.json()) as SubmitVideoRequest;
  const name = String(body.name || "").trim();
  const message = String(body.message || "").trim();
  const videoUrl = String(body.videoUrl || "").trim();

  if (!name || !videoUrl) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!videoUrl.startsWith("https://")) {
    return Response.json({ error: "Invalid video URL" }, { status: 400 });
  }

  const count = await prisma.submission.count({
    where: { celebrationId: celebration.id },
  });

  const submission = await prisma.submission.create({
    data: {
      celebrationId: celebration.id,
      name,
      message,
      videoUrl,
      order: count,
    },
  });

  return Response.json(submission);
}
