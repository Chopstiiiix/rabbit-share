import { prisma } from "@/lib/prisma";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export const runtime = "nodejs";

const maxVideoSizeInBytes = 500 * 1024 * 1024;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const body = (await request.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = JSON.parse(clientPayload || "{}") as {
          slug?: string;
        };

        if (payload.slug !== slug) {
          throw new Error("Invalid upload target.");
        }

        const celebration = await prisma.celebration.findUnique({
          where: { slug },
          select: { id: true },
        });

        if (!celebration) {
          throw new Error("Celebration not found.");
        }

        if (!pathname.startsWith(`uploads/${slug}/`)) {
          throw new Error("Invalid upload path.");
        }

        return {
          allowedContentTypes: ["video/*"],
          maximumSizeInBytes: maxVideoSizeInBytes,
          validUntil: Date.now() + 60 * 60 * 1000,
          tokenPayload: JSON.stringify({ slug }),
        };
      },
    });

    return Response.json(response);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to prepare video upload.",
      },
      { status: 400 },
    );
  }
}
