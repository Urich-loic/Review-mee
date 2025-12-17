import { authenticate } from "../shopify.server";
import { useState } from "react";
import prisma from "../db.server";
import { useSubmit, useLoaderData, useNavigate } from "react-router";
import ReviewTabs from "./ReviewTabs";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);

  const reviews = await prisma.review.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return { reviews };
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");
  const reviewId = formData.get("reviewId");

  if (action === "approve" && reviewId) {
    await prisma.review.update({
      where: { id: reviewId, shop: session.shop },
      data: { published: true },
    });
  } else if (action === "delete" && reviewId) {
    await prisma.review.delete({
      where: { id: reviewId, shop: session.shop },
    });
  }

  return { success: true };
}

export default function ReviewsList() {
  const { reviews } = useLoaderData();
  const navigate = useNavigate();
  const submit = useSubmit();
  const [selectedIds, setSelectedIds] = useState([]);

  const handleAction = (action, reviewId) => {
    const formData = new FormData();
    formData.append("action", action);
    formData.append("reviewId", reviewId);
    submit(formData, { method: "post" });
  };

  return (
    <>
      <ReviewTabs />
      <s-page title="Liste des Avis">
        <s-layout>
          <s-section>
            <s-card>
              <s-box padding="400">
                {reviews.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <s-text variant="headingMd">
                      Aucun avis pour le moment
                    </s-text>
                    <s-text variant="bodyMd" tone="subdued">
                      Les avis apparaîtront ici une fois qu'ils seront soumis
                    </s-text>
                  </div>
                ) : (
                  <s-stack vertical spacing="400">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        style={{
                          padding: "16px",
                          borderBottom: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      >
                        <s-stack vertical rowGap="100">
                          <s-stack alignment="space-between" direction="inline" gap="large">
                            <s-text variant="bodyMd" fontWeight="semibold">
                              {review.customerName}
                            </s-text>
                            <s-badge
                              tone={review.published ? "success" : "info"}
                            >
                              {review.published ? "Publié" : "En attente"}
                            </s-badge>
                          </s-stack>

                          <div>{"⭐".repeat(review.rating)}</div>

                          <p variant="bodyMd">{review.content}</p>

                          <s-stack spacing="200" direction="inline" gap="large">
                            <s-button
                              size="slim"
                              onClick={() =>
                                navigate(`/app/reviews/${review.id}`)
                              }
                            >
                              Voir détails
                            </s-button>
                            {!review.published && (
                              <s-button
                                size="slim"
                                variant="primary"
                                onClick={() =>
                                  handleAction("approve", review.id)
                                }
                              >
                                Approuver
                              </s-button>
                            )}
                            <s-button
                              size="slim"
                              variant="critical"
                              onClick={() => {
                                if (confirm("Supprimer cet avis ?")) {
                                  handleAction("delete", review.id);
                                }
                              }}
                            >
                              Supprimer
                            </s-button>
                          </s-stack>
                        </s-stack>
                      </div>
                    ))}
                  </s-stack>
                )}
              </s-box>
            </s-card>
          </s-section>
        </s-layout>
      </s-page>
    </>
  );
}
