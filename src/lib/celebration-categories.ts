export type CelebrationCategory = {
  slug: string;
  label: string;
  group: string;
  description: string;
};

export const CELEBRATION_CATEGORIES = [
  {
    slug: "birthday",
    label: "Birthday",
    group: "Life moments",
    description: "Warm wishes, stories, and surprise messages.",
  },
  {
    slug: "anniversary",
    label: "Anniversary",
    group: "Life moments",
    description: "Memories, toasts, and love notes for a milestone.",
  },
  {
    slug: "wedding",
    label: "Wedding",
    group: "Life moments",
    description: "Blessings and short messages for the couple.",
  },
  {
    slug: "engagement",
    label: "Engagement",
    group: "Life moments",
    description: "Congratulations before the next chapter begins.",
  },
  {
    slug: "graduation",
    label: "Graduation",
    group: "Achievements",
    description: "Proud messages from friends, family, and mentors.",
  },
  {
    slug: "promotion",
    label: "Promotion",
    group: "Achievements",
    description: "Recognition for a new title or big career step.",
  },
  {
    slug: "new-job",
    label: "New Job",
    group: "Achievements",
    description: "Encouragement for a fresh professional start.",
  },
  {
    slug: "retirement",
    label: "Retirement",
    group: "Work and teams",
    description: "Career memories, thanks, and farewell messages.",
  },
  {
    slug: "farewell",
    label: "Farewell",
    group: "Work and teams",
    description: "Goodbye messages for a teammate, friend, or neighbor.",
  },
  {
    slug: "team-appreciation",
    label: "Team Appreciation",
    group: "Work and teams",
    description: "A shared thank-you from coworkers or collaborators.",
  },
  {
    slug: "employee-recognition",
    label: "Employee Recognition",
    group: "Work and teams",
    description: "Celebrate standout effort and meaningful impact.",
  },
  {
    slug: "teacher-appreciation",
    label: "Teacher Appreciation",
    group: "Appreciation",
    description: "Messages from students, parents, and colleagues.",
  },
  {
    slug: "coach-appreciation",
    label: "Coach Appreciation",
    group: "Appreciation",
    description: "Thanks for guidance, support, and encouragement.",
  },
  {
    slug: "thank-you",
    label: "Thank You",
    group: "Appreciation",
    description: "Collect gratitude from a group in one place.",
  },
  {
    slug: "congratulations",
    label: "Congratulations",
    group: "Achievements",
    description: "For wins, milestones, launches, and big news.",
  },
  {
    slug: "new-baby",
    label: "New Baby",
    group: "Family",
    description: "Welcome messages for a new arrival.",
  },
  {
    slug: "baby-shower",
    label: "Baby Shower",
    group: "Family",
    description: "Advice, love, and wishes for parents-to-be.",
  },
  {
    slug: "housewarming",
    label: "Housewarming",
    group: "Family",
    description: "Celebrate a new home with friendly messages.",
  },
  {
    slug: "family-reunion",
    label: "Family Reunion",
    group: "Family",
    description: "Stories and greetings from across the family.",
  },
  {
    slug: "get-well",
    label: "Get Well Soon",
    group: "Support",
    description: "Supportive messages during recovery or treatment.",
  },
  {
    slug: "encouragement",
    label: "Encouragement",
    group: "Support",
    description: "A boost before a challenge, move, or hard season.",
  },
  {
    slug: "sympathy",
    label: "Sympathy",
    group: "Support",
    description: "Gentle support and care from a community.",
  },
  {
    slug: "memorial-tribute",
    label: "Memorial Tribute",
    group: "Support",
    description: "Stories, memories, and honoring a life.",
  },
  {
    slug: "welcome",
    label: "Welcome",
    group: "Community",
    description: "Greet someone joining a school, team, or group.",
  },
  {
    slug: "milestone",
    label: "Milestone",
    group: "Community",
    description: "Mark a meaningful number, launch, or achievement.",
  },
  {
    slug: "fundraiser",
    label: "Fundraiser",
    group: "Community",
    description: "Invite supporters to share why the cause matters.",
  },
  {
    slug: "mothers-day",
    label: "Mother's Day",
    group: "Holidays",
    description: "Love and appreciation for moms and mother figures.",
  },
  {
    slug: "fathers-day",
    label: "Father's Day",
    group: "Holidays",
    description: "Messages for dads and father figures.",
  },
  {
    slug: "valentines-day",
    label: "Valentine's Day",
    group: "Holidays",
    description: "Affectionate notes from partners, friends, or family.",
  },
  {
    slug: "christmas",
    label: "Christmas",
    group: "Holidays",
    description: "Seasonal greetings from loved ones or teams.",
  },
  {
    slug: "new-year",
    label: "New Year",
    group: "Holidays",
    description: "Reflections, wishes, and fresh-start messages.",
  },
  {
    slug: "thanksgiving",
    label: "Thanksgiving",
    group: "Holidays",
    description: "Gratitude messages from family, friends, or teams.",
  },
  {
    slug: "eid",
    label: "Eid",
    group: "Holidays",
    description: "Festive greetings and blessings from the group.",
  },
  {
    slug: "diwali",
    label: "Diwali",
    group: "Holidays",
    description: "Celebratory wishes for the festival of lights.",
  },
  {
    slug: "hanukkah",
    label: "Hanukkah",
    group: "Holidays",
    description: "Warm greetings for the season.",
  },
  {
    slug: "easter",
    label: "Easter",
    group: "Holidays",
    description: "Joyful messages for family, friends, or community.",
  },
  {
    slug: "other",
    label: "Other",
    group: "Custom",
    description: "Create a video collection for anything else.",
  },
] as const satisfies CelebrationCategory[];

export const categoryGroups = Array.from(
  new Set(CELEBRATION_CATEGORIES.map((category) => category.group)),
);

export const getCategoryBySlug = (slug?: string | null) =>
  CELEBRATION_CATEGORIES.find((category) => category.slug === slug) ??
  CELEBRATION_CATEGORIES[0];

export const normalizeCustomCategory = (value?: string | null) =>
  value?.trim().replace(/\s+/g, " ") || "";

export const getCategoryLabel = (
  categorySlug?: string | null,
  customCategory?: string | null,
) => {
  const normalizedCustomCategory = normalizeCustomCategory(customCategory);

  if (categorySlug === "other" && normalizedCustomCategory) {
    return normalizedCustomCategory;
  }

  return getCategoryBySlug(categorySlug).label;
};

export const createCelebrationTitle = (
  celebrant: string,
  categorySlug?: string | null,
  customCategory?: string | null,
) => `${celebrant}'s ${getCategoryLabel(categorySlug, customCategory)} Video`;
