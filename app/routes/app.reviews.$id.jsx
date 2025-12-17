import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { redirect, useNavigate, useSubmit, useLoaderData } from "react-router";

export async function loader({ request, params }) {
  const { session } = await authenticate.admin(request);

  const review = await prisma.review.findFirst({
    where: { id: params.id, shop: session.shop },
  });

  if (!review) {
    throw new Response("Not Found", { status: 404 });
  }

  return { review };
}

export async function action({ request, params }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "approve") {
    await prisma.review.update({
      where: { id: params.id, shop: session.shop },
      data: { published: true },
    });
  } else if (action === "delete") {
    await db.review.delete({
      where: { id: params.id, shop: session.shop },
    });
    return redirect("/app/reviews");
  }

  return { success: true };
}

export default function ReviewDetail() {
  const { review } = useLoaderData();
  const submit = useSubmit();
  const navigate = useNavigate();

  const handleAction = (action) => {
    const formData = new FormData();
    formData.append("action", action);
    submit(formData, { method: "post" });
  };

  const images = review.images ? JSON.parse(review.images) : [];

  return (
    <s-page title="Détails de l'avis">
      <s-page-actions slot="actions">
        <s-button onClick={() => navigate("/app/reviews")}>← Retour</s-button>
      </s-page-actions>

      <s-layout>
        <s-layout-section>
          <s-card>
            <s-box padding="400">
              <s-stack vertical spacing="400">
                <s-text variant="headingMd">Client</s-text>
                <s-text variant="bodyLg">{review.customerName}</s-text>
                <s-text tone="subdued">{review.customerEmail}</s-text>

                <s-divider />

                <s-text variant="headingMd">Note</s-text>
                <s-text variant="headingLg">
                  {"⭐".repeat(review.rating)}
                </s-text>

                {review.title && (
                  <>
                    <s-divider />
                    <s-text variant="headingMd">Titre</s-text>
                    <s-text>{review.title}</s-text>
                  </>
                )}

                <s-divider />

                <s-text variant="headingMd">Avis</s-text>
                <s-text>{review.content}</s-text>

                {images.length > 0 && (
                  <>
                    <s-divider />
                    <s-text variant="headingMd">Photos</s-text>
                    <s-stack spacing="200">
                      {images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Photo ${idx + 1}`}
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                      ))}
                    </s-stack>
                  </>
                )}

                <s-divider />

                <s-stack spacing="200">
                  {!review.published && (
                    <s-button
                      variant="primary"
                      onClick={() => handleAction("approve")}
                    >
                      Approuver
                    </s-button>
                  )}
                  <s-button
                    variant="critical"
                    onClick={() => {
                      if (confirm("Supprimer cet avis ?")) {
                        handleAction("delete");
                      }
                    }}
                  >
                    Supprimer
                  </s-button>
                </s-stack>
              </s-stack>
            </s-box>
          </s-card>
        </s-layout-section>
      </s-layout>
    </s-page>
  );
}
