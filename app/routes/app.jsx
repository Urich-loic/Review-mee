import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `{
    shop {
    id
    name
    email
    shopOwnerName
    myshopifyDomain
    currencyCode
      }

    products(first: 10) {
      nodes {
        id
        title
      }
        pageInfo {
      hasNextPage
    }
    }
    currentAppInstallation{
    accessScopes{
    handle
    }
    activeSubscriptions{
    createdAt
    currentPeriodEnd
    status
    }
    }
  }
  `,
  );

  const json = await response.json();

  // eslint-disable-next-line no-undef
  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    json: json.data,
  };
};

export default function App() {
  const { apiKey, json } = useLoaderData();

  // console.log(json.products);
  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-app-nav>
        <s-link href="/app">Dashboard</s-link>
        <s-link href="/app/plan">Plan</s-link>
        <s-link href="/app/widgets">Widgets</s-link>
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
