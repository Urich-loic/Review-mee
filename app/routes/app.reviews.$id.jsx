import { authenticate } from "../shopify.server";
import db from "../db.server";
import { useLoaderData, useSubmit, useNavigate, redirect } from "react-router";

export async function loader({ request, params }) {
  const { session } = await authenticate.admin(request);

  const review = await db.review.findFirst({
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
    await db.review.update({
      where: { id: params.id, shop: session.shop },
      data: { published: true },
    });
  } else if (action === "reject") {
    await db.review.update({
      where: { id: params.id, shop: session.shop },
      data: { published: false },
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

  const images = review.images ? JSON.parse(review.images) : [];

  const handleAction = (action) => {
    const formData = new FormData();
    formData.append("action", action);
    submit(formData, { method: "post" });
  };

  return (
    <s-page title="Review Details">
      <s-page-actions slot="actions">
        <s-button onClick={() => navigate("/app/reviews")}>
          Back to Reviews
        </s-button>
      </s-page-actions>

      <s-layout>
        <s-layout-section>
          {!review.published && (
            <s-banner tone="warning">
              <s-text>This review is pending approval</s-text>
            </s-banner>
          )}

          <s-card>
            <s-box padding="400">
              <s-stack vertical spacing="400">
                {/* Customer Info */}
                <s-stack vertical spacing="200">
                  <s-text variant="headingMd">Customer Information</s-text>
                  <s-text variant="bodyLg" fontWeight="semibold">
                    {review.customerName}
                  </s-text>
                  <s-text variant="bodyMd" tone="subdued">
                    {review.customerEmail}
                  </s-text>
                  {review.verified && (
                    <s-badge tone="success">Verified Purchase</s-badge>
                  )}
                </s-stack>

                <s-divider />

                {/* Rating */}
                <s-stack vertical spacing="200">
                  <s-text variant="headingMd">Rating</s-text>
                  <s-text variant="headingLg">
                    {"⭐".repeat(review.rating)}
                  </s-text>
                </s-stack>

                <s-divider />

                {/* Title */}
                {review.title && (
                  <>
                    <s-stack vertical spacing="200">
                      <s-text variant="headingMd">Title</s-text>
                      <s-text variant="bodyLg" fontWeight="semibold">
                        {review.title}
                      </s-text>
                    </s-stack>
                    <s-divider />
                  </>
                )}

                {/* Review Content */}
                <s-stack vertical spacing="200">
                  <s-text variant="headingMd">Review</s-text>
                  <s-text variant="bodyMd">{review.content}</s-text>
                </s-stack>

                {/* Photos */}
                {images.length > 0 && (
                  <>
                    <s-divider />
                    <s-stack vertical spacing="200">
                      <s-text variant="headingMd">Photos</s-text>
                      <s-stack spacing="300">
                        {images.map((img, idx) => (
                          <s-thumbnail
                            key={idx}
                            source={img}
                            size="large"
                            alt={`Review photo ${idx + 1}`}
                          />
                        ))}
                      </s-stack>
                    </s-stack>
                  </>
                )}

                <s-divider />

                {/* Metadata */}
                <s-stack vertical spacing="200">
                  <s-text variant="headingMd">Details</s-text>
                  <s-text variant="bodyMd" tone="subdued">
                    Product ID: {review.productId}
                  </s-text>
                  <s-text variant="bodyMd" tone="subdued">
                    Created: {new Date(review.createdAt).toLocaleString()}
                  </s-text>
                  <s-text variant="bodyMd" tone="subdued">
                    Helpful votes: {review.helpful}
                  </s-text>
                </s-stack>
              </s-stack>
            </s-box>
          </s-card>

          {/* Actions Card */}
          <s-card>
            <s-box padding="400">
              <s-stack spacing="300">
                {!review.published && (
                  <s-button
                    variant="primary"
                    onClick={() => handleAction("approve")}
                  >
                    Approve & Publish
                  </s-button>
                )}
                {review.published && (
                  <s-button onClick={() => handleAction("reject")}>
                    Unpublish
                  </s-button>
                )}
                <s-button
                  variant="critical"
                  onClick={() => {
                    if (
                      confirm("Are you sure you want to delete this review?")
                    ) {
                      handleAction("delete");
                    }
                  }}
                >
                  Delete Review
                </s-button>
              </s-stack>
            </s-box>
          </s-card>
        </s-layout-section>
      </s-layout>
    </s-page>
  );
}
