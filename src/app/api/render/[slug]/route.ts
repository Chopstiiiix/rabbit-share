import { importLegacyDuplicateSubmissions } from "@/lib/legacy-celebrations";
import { prisma } from "@/lib/prisma";
import { uploadObject } from "@/lib/storage";
import { auth } from "@clerk/nextjs/server";
import ffmpegPath from "ffmpeg-static";
import { execFile } from "node:child_process";
import { constants } from "node:fs";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const execFileAsync = promisify(execFile);

const resolveFfmpegBinary = async () => {
  const candidates = [
    process.env.FFMPEG_BIN,
    path.join(process.cwd(), "node_modules", "ffmpeg-static", "ffmpeg"),
    "/var/task/node_modules/ffmpeg-static/ffmpeg",
    ffmpegPath,
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Try the next runtime-specific path.
    }
  }

  return "ffmpeg";
};

const downloadToFile = async (url: string, filePath: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Unable to download source video: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(filePath, buffer);
};

const redirectToDashboard = (
  req: Request,
  slug: string,
  params: Record<string, string>,
) => {
  const url = new URL(`/dashboard/${slug}`, req.url);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return NextResponse.redirect(url, { status: 303 });
};

const getRenderErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message.includes("ENOENT")) {
    return "The video renderer is not available on this server. Please try again in a moment.";
  }

  return "Unable to generate the final video. Please check the uploaded clips and try again.";
};

const createNormalizedRenderArgs = ({
  sourceFiles,
  outputPath,
}: {
  sourceFiles: string[];
  outputPath: string;
}) => {
  const args = ["-y"];
  const filterParts: string[] = [];
  const concatInputs: string[] = [];

  sourceFiles.forEach((sourceFile, index) => {
    args.push("-t", "30", "-i", sourceFile);
    filterParts.push(
      `[${index}:v]setpts=PTS-STARTPTS,scale=540:960:force_original_aspect_ratio=decrease,pad=540:960:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,format=yuv420p[v${index}]`,
      `[${index}:a]asetpts=PTS-STARTPTS,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,aresample=async=1:first_pts=0[a${index}]`,
    );
    concatInputs.push(`[v${index}][a${index}]`);
  });

  filterParts.push(
    `${concatInputs.join("")}concat=n=${sourceFiles.length}:v=1:a=1[outv][outa]`,
  );

  args.push(
    "-filter_complex",
    filterParts.join(";"),
    "-map",
    "[outv]",
    "-map",
    "[outa]",
    "-c:v",
    "libx264",
    "-preset",
    "ultrafast",
    "-crf",
    "28",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-ar",
    "48000",
    "-ac",
    "2",
    "-movflags",
    "+faststart",
    outputPath,
  );

  return args;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json(
      { error: "Sign in to generate a video." },
      { status: 401 },
    );
  }

  const { slug } = await params;

  let celebration = await prisma.celebration.findUnique({
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

  if (celebration.organizerId && celebration.organizerId !== userId) {
    return Response.json({ error: "Celebration not found" }, { status: 404 });
  }

  await importLegacyDuplicateSubmissions(celebration);

  celebration = await prisma.celebration.findUnique({
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
    return redirectToDashboard(req, slug, {
      renderError: "No videos have been submitted yet.",
    });
  }

  try {
    const ffmpegBinary = await resolveFfmpegBinary();
    console.info("Using FFmpeg binary", ffmpegBinary);
    const workDir = path.join(tmpdir(), "rabbit-share", celebration.slug);
    const sourceDir = path.join(workDir, "source");
    await mkdir(sourceDir, { recursive: true });

    const outputDir = path.join(workDir, "final");
    await mkdir(outputDir, { recursive: true });

    const sourceFiles: string[] = [];

    for (const submission of celebration.submissions) {
      const inputPath = path.join(sourceDir, `${submission.id}.mp4`);
      await downloadToFile(submission.videoUrl, inputPath);
      sourceFiles.push(inputPath);
    }

    const finalFilename = `${celebration.slug}-final-${Date.now()}.mp4`;
    const finalPath = path.join(outputDir, finalFilename);

    await execFileAsync(
      ffmpegBinary,
      createNormalizedRenderArgs({
        sourceFiles,
        outputPath: finalPath,
      }),
      {
        timeout: 240_000,
        maxBuffer: 1024 * 1024 * 20,
      },
    );

    const finalBuffer = await readFile(finalPath);
    const finalVideoUrl = await uploadObject({
      key: `final/${celebration.slug}/${finalFilename}`,
      body: finalBuffer,
      contentType: "video/mp4",
    });

    await prisma.finalVideo.upsert({
      where: { celebrationId: celebration.id },
      update: {
        videoUrl: finalVideoUrl,
      },
      create: {
        celebrationId: celebration.id,
        videoUrl: finalVideoUrl,
      },
    });
  } catch (error) {
    console.error("Video render failed", error);

    return redirectToDashboard(req, slug, {
      renderError: getRenderErrorMessage(error),
    });
  }

  return redirectToDashboard(req, slug, { render: "success" });
}
