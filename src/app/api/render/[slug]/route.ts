import { prisma } from "@/lib/prisma";
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

const execFileAsync = promisify(execFile);

const quoteConcatFile = (filePath: string) =>
  `file '${filePath.replace(/'/g, "'\\''")}'`;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const celebration = await prisma.celebration.findUnique({
    where: { slug },
    include: {
      submissions: {
        where: { approved: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!celebration) {
    return Response.json({ error: "Celebration not found" }, { status: 404 });
  }

  if (celebration.submissions.length === 0) {
    return Response.json({ error: "No videos yet" }, { status: 400 });
  }

  const outputDir = path.join(process.cwd(), "public", "final");
  await mkdir(outputDir, { recursive: true });

  const normalizedDir = path.join(process.cwd(), "public", "normalized");
  await mkdir(normalizedDir, { recursive: true });

  const normalizedFiles: string[] = [];

  for (const [index, submission] of celebration.submissions.entries()) {
    const inputPath = path.join(
      process.cwd(),
      "public",
      submission.videoUrl.replace(/^\/+/, ""),
    );

    const outputPath = path.join(
      normalizedDir,
      `${celebration.slug}-${index}.mp4`,
    );

    await execFileAsync("ffmpeg", [
      "-y",
      "-i",
      inputPath,
      "-t",
      "30",
      "-vf",
      "scale=720:-2,setsar=1",
      "-r",
      "30",
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "23",
      "-c:a",
      "aac",
      "-ar",
      "44100",
      "-ac",
      "2",
      outputPath,
    ]);

    normalizedFiles.push(outputPath);
  }

  const listPath = path.join(normalizedDir, `${celebration.slug}-list.txt`);
  const fileList = normalizedFiles.map(quoteConcatFile).join("\n");

  await writeFile(listPath, fileList);

  const finalFilename = `${celebration.slug}-final.mp4`;
  const finalPath = path.join(outputDir, finalFilename);

  await execFileAsync("ffmpeg", [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listPath,
    "-c",
    "copy",
    finalPath,
  ]);

  await prisma.finalVideo.upsert({
    where: { celebrationId: celebration.id },
    update: {
      videoUrl: `/final/${finalFilename}`,
    },
    create: {
      celebrationId: celebration.id,
      videoUrl: `/final/${finalFilename}`,
    },
  });

  redirect(`/dashboard/${slug}`);
}
