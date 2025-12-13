import { useEffect } from "react";
import { useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  return null;
};

export default function Index() {
  const fetcher = useFetcher();

  return (
    <s-page heading="Dashboard page">
      <s-section heading="Dashboard pages">
        <s-paragraph>Welcome to the like plan page</s-paragraph>
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
