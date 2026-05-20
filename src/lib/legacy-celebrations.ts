import { prisma } from "@/lib/prisma";

type CelebrationIdentity = {
  id: string;
  organizerId: string | null;
  celebrant: string;
  category: string;
  customCategory: string | null;
};

const matchingLegacyCelebrationWhere = (celebration: CelebrationIdentity) => ({
  id: { not: celebration.id },
  organizerId: null,
  celebrant: celebration.celebrant,
  category: celebration.category,
  customCategory: celebration.customCategory,
});

export async function resolveSubmissionCelebration(
  celebration: CelebrationIdentity,
) {
  if (celebration.organizerId) {
    return celebration;
  }

  return (
    (await prisma.celebration.findFirst({
      where: {
        id: { not: celebration.id },
        organizerId: { not: null },
        celebrant: celebration.celebrant,
        category: celebration.category,
        customCategory: celebration.customCategory,
      },
      orderBy: { createdAt: "desc" },
    })) ?? celebration
  );
}

export async function importLegacyDuplicateSubmissions(
  celebration: CelebrationIdentity,
) {
  if (!celebration.organizerId) {
    return 0;
  }

  const legacySubmissions = await prisma.submission.findMany({
    where: {
      celebration: matchingLegacyCelebrationWhere(celebration),
    },
    orderBy: { createdAt: "asc" },
  });

  if (legacySubmissions.length === 0) {
    return 0;
  }

  const existingCount = await prisma.submission.count({
    where: { celebrationId: celebration.id },
  });

  await prisma.$transaction(
    legacySubmissions.map((submission, index) =>
      prisma.submission.update({
        where: { id: submission.id },
        data: {
          celebrationId: celebration.id,
          order: existingCount + index,
        },
      }),
    ),
  );

  return legacySubmissions.length;
}
