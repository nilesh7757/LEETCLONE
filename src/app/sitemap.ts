import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://logiquest.nileshmori.me";

  // 1. Static routes
  const staticRoutes = [
    "",
    "/about",
    "/problems",
    "/arena",
    "/leaderboard",
    "/resources",
    "/cs-core",
    "/arcade",
    "/study-plans",
    "/blog",
    "/signup",
    "/login",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : (route === "/about" ? 0.9 : 0.8),
  }));

  // 2. Dynamic public problems
  let problemRoutes: MetadataRoute.Sitemap = [];
  try {
    const publicProblems = await prisma.problem.findMany({
      where: {
        OR: [
          { isPublic: true },
          { contests: { some: { endTime: { lte: new Date() } } } }
        ]
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    problemRoutes = publicProblems.map((problem) => ({
      url: `${baseUrl}/problems/${problem.slug}`,
      lastModified: problem.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error generating sitemap problems:", error);
  }

  // 3. Dynamic public blog posts
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const publishedBlogs = await prisma.blogPost.findMany({
      where: { published: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    blogRoutes = publishedBlogs.map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: blog.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Error generating sitemap blogs:", error);
  }

  // 4. Dynamic public study plans
  let studyPlanRoutes: MetadataRoute.Sitemap = [];
  try {
    const publicStudyPlans = await prisma.studyPlan.findMany({
      where: { isPublic: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    studyPlanRoutes = publicStudyPlans.map((plan) => ({
      url: `${baseUrl}/study-plans/${plan.slug}`,
      lastModified: plan.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Error generating sitemap study plans:", error);
  }

  return [...staticRoutes, ...problemRoutes, ...blogRoutes, ...studyPlanRoutes];
}
