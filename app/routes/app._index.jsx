import {
  redirect,
  useFetcher,
  useLoaderData,
  useRouteLoaderData,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
// export const loader = async ({ request }) => {
//   await authenticate.admin(request);

//   return null;
// };

// export const loader = async ({request}) => {
//   const { admin } = await authenticate.admin(request);
//   const response = await admin.graphql(
//     `#graphql
//   query GetProducts {
//     products(first: 10) {
//       nodes {
//         id
//         title
//       }
//     }
//   }`,
//   );
//   const json = await response.json();
//   return json.data;
// }

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  return null;
};

export default function Index() {
  const fetcher = useFetcher();

  const { totalReviews, pendingCount, avgRating, recentReviews } =
    useRouteLoaderData("routes/app");

  return (
    <s-page
    title="Dashboard">
      <s-section>
        <s-stack columns="2" direction="inline" gap="large">
          <s-card>
            <s-box padding="400">
              <s-paragraph variant="headingMd" as="h2">
                Total Reviews
              </s-paragraph>
              <s-paragraph variant="heading2xl" as="p">
                {totalReviews}
              </s-paragraph>
            </s-box>
          </s-card>

          <s-card>
            <s-box padding="400">
              <s-paragraph variant="headingMd" as="h2">
                Average Rating
              </s-paragraph>
              <s-paragraph variant="heading2xl" as="p">
                {avgRating} ⭐
              </s-paragraph>
            </s-box>
          </s-card>

          <s-card>
            <s-box padding="400">
              <s-paragraph variant="headingMd" as="h2">
                Pending Reviews
              </s-paragraph>
              <s-paragraph variant="heading2xl" as="p">
                {pendingCount}
              </s-paragraph>
            </s-box>
          </s-card>

          <s-card>
            <s-box padding="400">
              <s-paragraph variant="headingMd" as="h2">
                Response Rate
              </s-paragraph>
              <s-paragraph variant="heading2xl" as="p">
                {totalReviews > 0 ? "100%" : "0%"}
              </s-paragraph>
            </s-box>
          </s-card>
        </s-stack>
      </s-section>

      <s-section heading="Recent review">
        <s-card>
          <s-paragraph padding="400">
            <s-text variant="headingMd" as="h2">
              Recent Reviews are displayed here
            </s-text>
          </s-paragraph>

          {recentReviews.map((review, index) => (
            <div key={review.id}>
              <s-box padding="400">
                <s-stack vertical spacing="200">
                  <s-stack alignment="space-between">
                    <s-paragraph variant="bodyMd" fontWeight="semibold">
                      {review.customerName}
                    </s-paragraph>
                    <s-badge tone={review.published ? "success" : "info"}>
                      {review.published ? "Published" : "Pending"}
                    </s-badge>
                  </s-stack>

                  <div>{"⭐".repeat(review.rating)}</div>

                  <s-paragraph variant="bodyMd" tone="subdued">
                    {review.content.substring(0, 100)}...
                  </s-paragraph>

                  <s-button-group>
                    <s-button href={`/app/reviews/${review.id}`}>
                      View Details
                    </s-button>
                  </s-button-group>
                </s-stack>
              </s-box>
              {index < recentReviews.length - 1 && <s-divider />}
            </div>
          ))}
        </s-card>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
