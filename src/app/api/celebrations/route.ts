import { prisma } from "@/lib/prisma";
import {
  createCelebrationTitle,
  getCategoryBySlug,
  normalizeCustomCategory,
} from "@/lib/celebration-categories";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json(
      { error: "Sign in to create an invite." },
      { status: 401 },
    );
  }

  const body = await req.json();

  const slug = nanoid(8);
  const celebrant = String(body.celebrant || "").trim();
  const category = getCategoryBySlug(String(body.category || "birthday")).slug;
  const customCategory = normalizeCustomCategory(body.customCategory);

  if (!celebrant) {
    return Response.json({ error: "Celebrant name is required" }, { status: 400 });
  }

  if (category === "other" && !customCategory) {
    return Response.json({ error: "Category name is required" }, { status: 400 });
  }

  const celebration = await prisma.celebration.create({
    data: {
      slug,
      organizerId: userId,
      category,
      customCategory: customCategory || null,
      celebrant,
      title: createCelebrationTitle(celebrant, category, customCategory),
      deadline: body.deadline || null,
    },
  });

  return Response.json(celebration);
}
