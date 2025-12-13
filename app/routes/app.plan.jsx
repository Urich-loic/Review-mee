import PricingCard from "./Components/PricingCard";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "react-router";

// export const loader = async ({ request }) => {
//   await authenticate.admin(request);

//   return null;
// };

export const loader = async ({request}) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `#graphql
  query GetProducts {
    products(first: 10) {
      nodes {
        id
        title
      }
    }
  }`,
  );
  const json = await response.json();
  return json.data;
}

export default function AdditionalPage() {
  const { products } = useLoaderData();

  console.log("Plan loader data" + products.nodes);
  return (
    <s-page heading="Plan page">
      <s-section heading="plan pages">
        <s-paragraph>
          The app template comes with an additional page which demonstrates how
          to create multiple pages within app navigation using{" "}
        </s-paragraph>
      </s-section>

      <s-stack direction="inline" gap="large">
        <PricingCard
          title="Standard"
          description="This is a great plan for stores that are just starting out"
          features={[
            "Process up to 1,000 orders/mo",
            "Amazing feature",
            "Another really cool feature",
            "24/7 Customer Support",
          ]}
          price="$19"
          frequency="month"
          button={{
            content: "Select Plan",
            props: {
              variant: "primary",
              onClick: () => console.log("clicked plan!"),
            },
          }}
        />

        <PricingCard
          title="Advanced"
          featuredText="Most Popular"
          description="For stores that are growing and need a reliable solution to scale with them"
          features={[
            "Process up to 10,000 orders/mo",
            "Amazing feature",
            "Another really cool feature",
            "24/7 Customer Support",
          ]}
          price="$49"
          frequency="month"
          button={{
            content: "Select Plan",
            props: {
              variant: "primary",
              onClick: () => console.log("clicked plan!"),
            },
          }}
        />

        <PricingCard
          title="Premium"
          description="The best of the best, for stores that have the highest order processing needs"
          features={[
            "Process up to 100,000 orders/mo",
            "Amazing feature",
            "Another really cool feature",
            "24/7 Customer Support",
          ]}
          price="$99"
          frequency="month"
          button={{
            content: "Select Plan",
            props: {
              variant: "primary",
              onClick: () => console.log("clicked plan!"),
            },
          }}
        />
      </s-stack>
    </s-page>
  );
}
