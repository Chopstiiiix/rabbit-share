import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const body = await req.json();

  const slug = nanoid(8);

  const celebration = await prisma.celebration.create({
    data: {
      slug,
      celebrant: body.celebrant,
      title: `${body.celebrant}'s Birthday Wishes`,
      deadline: body.deadline || null,
    },
  });

  return Response.json(celebration);
}
