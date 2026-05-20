import { prisma } from "@/lib/prisma";
import { mkdir, writeFile } from "fs/promises";
import { nanoid } from "nanoid";
import path from "path";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const celebration = await prisma.celebration.findUnique({
    where: { slug },
  });

  if (!celebration) {
    return Response.json({ error: "Celebration not found" }, { status: 404 });
  }

  const formData = await req.formData();

  const name = String(formData.get("name") || "");
  const message = String(formData.get("message") || "");
  const video = formData.get("video") as File | null;

  if (!name || !video) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const bytes = await video.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const ext = video.name.split(".").pop() || "mp4";
  const filename = `${nanoid()}.${ext}`;
  const filepath = path.join(uploadDir, filename);

  await writeFile(filepath, buffer);

  const count = await prisma.submission.count({
    where: { celebrationId: celebration.id },
  });

  const submission = await prisma.submission.create({
    data: {
      celebrationId: celebration.id,
      name,
      message,
      videoUrl: `/uploads/${filename}`,
      order: count,
    },
  });

  return Response.json(submission);
}
