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
          title="Gratuit"
          description="Idéal pour tester l’app et afficher ses premiers avis clients"
          features={[
            "✔️ Collecte d’avis clients basique",
            "✔️ Widget d’avis sur la page produit",
            "✔️ Notes et étoiles visibles",
            "✔️ Avis texte (sans photos)",
            "✔️ Modération manuelle des avis",
            "✔️ Support par email standard",
            "❌ Emails automatiques de demande d’avis",
            "❌ Photos dans les avis",
            "❌ Statistiques avancées",
            "❌ Personnalisation avancée du widget"
          ]}
          price="$0"
          frequency="mois"
          button={{
            content: "Commencer gratuitement",
            props: {
              variant: "primary",
              onClick: () => console.log("clicked plan!"),
            },
          }}
        />

        <PricingCard
          title="Pro"
          featuredText="Most Popular"
          description="Tout ce qu’il faut pour collecter plus d’avis et renforcer la confiance"
          features={[
            "✔️ Tout le plan Starter",
            "✔️ Emails automatiques de demande d’avis après achat",
            "✔️ Avis avec photos clients",
            "✔️ Personnalisation du widget (couleurs, style)",
            "✔️ Tri et filtres des avis (note, date, utilité)",
            "✔️ Statistiques essentielles (note moyenne, nombre d’avis)",
            "✔️ Avis illimités"
          ]}
          price="$9"
          frequency="mois"
          button={{
            content: "Passer au plan Pro",
            props: {
              variant: "primary",
              onClick: () => console.log("clicked plan!"),
            },
          }}
        />

        <PricingCard
          title="Business"
          description="Pour les marques établies, Automatisation, performance et contrôle avancé"
          features={[
                  "✔️ Tout le plan Pro",
                  "✔️ Automatisations avancées (rappels, règles intelligentes)",
                  "✔️ Statistiques avancées & insights clients",
                  "✔️ Avis vérifiés (acheteurs confirmés)",
                  "✔️ Support prioritaire",
                  "✔️ Optimisation SEO des avis",
                  "✔️ Multilingue (selon la boutique)"
          ]}
          price="$29"
          frequency="mois"
          button={{
            content: "Passer au plan Business",
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
