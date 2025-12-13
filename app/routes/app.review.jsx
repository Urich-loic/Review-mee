import { authenticate } from "../shopify.server";
import { useState } from "react";
import db from "../db.server";
import { useLoaderData, useNavigate, useSubmit } from "react-router";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const filter = url.searchParams.get("filter") || "all";

  const where = { shop: session.shop };
  if (filter === "published") where.published = true;
  if (filter === "pending") where.published = false;

  const reviews = await db.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return { reviews, filter };
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");
  const reviewId = formData.get("reviewId");
  const reviewIds = formData.get("reviewIds");

  if (action === "approve" && reviewId) {
    await db.review.update({
      where: { id: reviewId, shop: session.shop },
      data: { published: true },
    });
  } else if (action === "bulkApprove" && reviewIds) {
    const ids = JSON.parse(reviewIds);
    await db.review.updateMany({
      where: { id: { in: ids }, shop: session.shop },
      data: { published: true },
    });
  } else if (action === "delete" && reviewId) {
    await db.review.delete({
      where: { id: reviewId, shop: session.shop },
    });
  } else if (action === "bulkDelete" && reviewIds) {
    const ids = JSON.parse(reviewIds);
    await db.review.deleteMany({
      where: { id: { in: ids }, shop: session.shop },
    });
  }

  return { success: true };
}

export default function Reviews() {
  const { reviews, filter } = useLoaderData();
  const navigate = useNavigate();
  const submit = useSubmit();
  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(reviews.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkAction = (action) => {
    const formData = new FormData();
    formData.append("action", action);
    formData.append("reviewIds", JSON.stringify(selectedIds));
    submit(formData, { method: "post" });
    setSelectedIds([]);
  };

  const handleAction = (action, reviewId) => {
    const formData = new FormData();
    formData.append("action", action);
    formData.append("reviewId", reviewId);
    submit(formData, { method: "post" });
  };

  return (
    <s-page title="Reviews">
      <s-page-actions slot="actions">
        <s-button href="/app/import-reviews">Import reviews</s-button>
      </s-page-actions>

      <s-section>
        <s-card>
          <s-box padding="400">
            <s-stack direction="inline" gap="large">
              <s-button-group segmented>
                <s-button
                  pressed={filter === "all"}
                  onClick={() => navigate("/app/reviews?filter=all")}
                >
                  All
                </s-button>
                <s-button
                  pressed={filter === "published"}
                  onClick={() => navigate("/app/reviews?filter=published")}
                >
                  Published
                </s-button>
                <s-button
                  pressed={filter === "pending"}
                  onClick={() => navigate("/app/reviews?filter=pending")}
                >
                  Pending
                </s-button>
              </s-button-group>

              {selectedIds.length > 0 && (
                <s-button-group>
                  <s-button onClick={() => handleBulkAction("bulkApprove")}>
                    Approve ({selectedIds.length})
                  </s-button>
                  <s-button
                    variant="critical"
                    onClick={() => {
                      if (confirm(`Delete ${selectedIds.length} reviews?`)) {
                        handleBulkAction("bulkDelete");
                      }
                    }}
                  >
                    Delete ({selectedIds.length})
                  </s-button>
                </s-button-group>
              )}
            </s-stack>
          </s-box>

          <s-divider />

          <s-section padding="none">
            <s-table>
              <s-table-header-row>
                <s-table-header>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === reviews.length}
                  />
                </s-table-header>
                <s-table-header>Customer</s-table-header>
                <s-table-header>Rating</s-table-header>
                <s-table-header>Review</s-table-header>
                <s-table-header>Status</s-table-header>
                <s-table-header>Date</s-table-header>
                <s-table-header>Action</s-table-header>
              </s-table-header-row>
              <s-table-body>
                {reviews.map((review) => (
                  <s-table-row key={review.id}>
                    <s-table-cell>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(review.id)}
                        onChange={() => handleSelect(review.id)}
                      />
                    </s-table-cell>
                    <s-table-cell fontWeight="semibold">
                      {review.customerName}
                    </s-table-cell>
                    <s-table-cell>{"⭐".repeat(review.rating)}</s-table-cell>
                    <s-table-cell truncate>{review.content}</s-table-cell>
                    <s-table-cell>
                      {" "}
                      <s-badge tone={review.published ? "success" : "info"}>
                        {review.published ? "Published" : "Pending"}
                      </s-badge>
                    </s-table-cell>
                    <s-table-cell>
                      {" "}
                      <s-text variant="bodySm" tone="subdued">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </s-text>
                    </s-table-cell>
                    <s-table-cell>
                      {" "}
                      <s-button-group>
                        <s-button
                          size="slim"
                          onClick={() => navigate(`/app/reviews/${review.id}`)}
                        >
                          View
                        </s-button>
                        {!review.published && (
                          <s-button
                            size="slim"
                            variant="primary"
                            onClick={() => handleAction("approve", review.id)}
                          >
                            Approve
                          </s-button>
                        )}
                      </s-button-group>
                    </s-table-cell>
                  </s-table-row>
                ))}
              </s-table-body>
            </s-table>
          </s-section>
        </s-card>
      </s-section>
    </s-page>
  );
}
