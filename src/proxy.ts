import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/create(.*)",
  "/dashboard(.*)",
  "/api/celebrations(.*)",
  "/api/render(.*)",
]);

export default clerkMiddleware(
  async (auth, request) => {
    const { isAuthenticated, redirectToSignIn } = await auth();

    if (isProtectedRoute(request) && !isAuthenticated) {
      return redirectToSignIn();
    }
  },
  {
    signInUrl: "/sign-in",
    signUpUrl: "/sign-up",
  },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api)(.*)",
    "/__clerk/(.*)",
  ],
};
