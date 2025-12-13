import db from "../db.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");
  const shop = url.searchParams.get("shop");

  if (!productId || !shop) {
    return ({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    // Récupérer les avis publiés
    const reviews = await db.review.findMany({
      where: {
        shop: shop,
        productId: productId,
        published: true,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        customerName: true,
        rating: true,
        title: true,
        content: true,
        images: true,
        verified: true,
        helpful: true,
        createdAt: true,
      },
    });

    // Calculer les statistiques
    const stats = await db.review.aggregate({
      where: { shop, productId, published: true },
      _avg: { rating: true },
      _count: true,
    });

    // Distribution des notes
    const distribution = await db.review.groupBy({
      by: ["rating"],
      where: { shop, productId, published: true },
      _count: true,
    });

    const distributionMap = {};
    distribution.forEach((d) => {
      distributionMap[d.rating] = d._count;
    });

    return (
      {
        reviews,
        stats: {
          avgRating: stats._avg.rating || 0,
          totalReviews: stats._count,
          distribution: distributionMap,
        },
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=300", // Cache 5 minutes
        },
      }
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return ({ error: "Internal server error" }, { status: 500 });
  }
}
