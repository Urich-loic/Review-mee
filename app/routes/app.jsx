import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
export const loader = async ({ request }) => {
  // const { admin } = await authenticate.admin(request);

  const { session } = await authenticate.admin(request);

  const [totalReviews, pendingCount, avgRating, recentReviews] =
    await Promise.all([
      prisma.review.count({
        where: { shop: session.shop, published: true },
      }),
      prisma.review.count({
        where: { shop: session.shop, published: false },
      }),
      prisma.review.aggregate({
        where: { shop: session.shop, published: true },
        _avg: { rating: true },
      }),
      prisma.review.findMany({
        where: { shop: session.shop },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  // const response = await admin.graphql(
  //   `{
  //   shop {
  //   id
  //   name
  //   email
  //   shopOwnerName
  //   myshopifyDomain
  //   currencyCode
  //     }

  //   products(first: 10) {
  //     nodes {
  //       id
  //       title
  //     }
  //       pageInfo {
  //     hasNextPage
  //   }
  //   }
  //   currentAppInstallation{
  //   accessScopes{
  //   handle
  //   }
  //   activeSubscriptions{
  //   createdAt
  //   currentPeriodEnd
  //   status
  //   }
  //   launchUrl
  //   }
  // }
  // `,
  // );

  // const json = await response.json();

  // eslint-disable-next-line no-undef
  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    totalReviews,
    avgRating:
      avgRating._avg.rating !== null
        ? Number(avgRating._avg.rating.toFixed(1))
        : 0,
    recentReviews,
    pendingCount,
  };
};

export default function App() {
  const { apiKey } = useLoaderData();

  // console.log(json.products);
  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-app-nav>
        <s-link href="/app">Dashboard</s-link>
        <s-link href="/app/review">Review</s-link>
        <s-link href="/app/plan">Plan</s-link>
        <s-link href="/app/settings">Settings</s-link>
      </s-app-nav>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
