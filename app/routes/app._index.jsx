import { useFetcher, useLoaderData, useRouteLoaderData } from "react-router";
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

  const products = useRouteLoaderData('routes/app')
  const storeOwner = products.json.shop.shopOwnerName;

  const subscriptionStatus = products.json.currentAppInstallation.activeSubscriptions.status;

  console.log(subscriptionStatus)
  return (
    <s-page heading="Dashboard page">
      <s-section heading="Dashboard pages">
        <s-paragraph>Welcome to the LIKE app <b>{storeOwner}</b></s-paragraph>
      </s-section>
      <s-section heading="Statistics">
        <s-stack direction="inline" columnGap="large">
          <s-section heading="Total">
            <s-paragraph>140</s-paragraph>
          </s-section>
          <s-section heading="Total">
            <s-paragraph>140</s-paragraph>
          </s-section>
          <s-section heading="Total">
            <s-paragraph>140</s-paragraph>
          </s-section>
        </s-stack>
      </s-section>

      <s-section heading="Tutorial">
        <s-ordered-list>
          <s-list-item>Go to your theme editor</s-list-item>
          <s-list-item>Select default product page</s-list-item>
          <s-list-item>Add new section</s-list-item>
          <s-list-item>Click on app</s-list-item>
          <s-list-item>Click on Like product</s-list-item>
        </s-ordered-list>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
