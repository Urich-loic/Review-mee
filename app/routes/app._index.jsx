import React from "react";

/**
 * STATIC MOCK DATA — NO BACKEND DEPENDENCY
 */
const stats = {
  totalReviews: 124,
  pendingCount: 9,
  avgRating: 4.6,
  responseRate: 92,
};

const recentReviews = [
  {
    id: "1",
    customerName: "Sarah M.",
    rating: 5,
    content: "Amazing product, fast delivery and great support!",
    published: true,
    date: "2 hours ago",
    status:"Published"
  },
  {
    id: "2",
    customerName: "John D.",
    rating: 4,
    content: "Very good quality. Would recommend to others.",
    published: true,
    date: "Yesterday",
    status:"Published"
  },
  {
    id: "3",
    customerName: "Emily R.",
    rating: 3,
    content: "Product is fine but shipping was slower than expected.",
    published: false,
    date: "2 days ago",
    status:"Disabled"
  },
];

export default function ReviewDashboard() {
  return (
    <s-page title="Reviews" subtitle="Overview of customer feedback">
      {/* METRICS */}
      <s-section>
        <s-stack alignment="space-between" gap="large" direction="inline">
          <Metric label="Total reviews" value={stats.totalReviews} />
          <Metric label="Average rating" value={`${stats.avgRating} ★`} />
          <Metric
            label="Pending reviews"
            value={stats.pendingCount}
            tone="warning"
          />
          <Metric label="Response rate" value={`${stats.responseRate}%`} />
        </s-stack>
      </s-section>

      {/* REVIEWS */}
      <s-section heading="Recent review">
        <s-stack gap="small-200">
          <s-stack>
            <s-section heading="Recent activity">
              <s-card>
                <s-stack vertical gap="large">
                  {recentReviews.map((review, index) => (
                    <React.Fragment key={review.id}>
                      <ReviewRow review={review} />
                      {index < recentReviews.length - 1 && <s-divider />}
                    </React.Fragment>
                  ))}
                </s-stack>
              </s-card>
            </s-section>
          </s-stack>
        </s-stack>
      </s-section>
    </s-page>
  );
}

function Metric({ label, value }) {
  return (
    <s-card>
      <s-box padding="400">
        <s-stack vertical spacing="100">
          <s-text tone="subdued">{label}</s-text>
          <s-text variant="heading2xl">{value}</s-text>
        </s-stack>
      </s-box>
    </s-card>
  );
}

function ReviewRow({ review }) {
  return (
    <s-box padding="400">
      <s-stack vertical spacing="200">
        <s-stack padding="400" alignment="space-between">
          <s-text fontWeight="semibold">{review.customerName}</s-text>
          <s-badge
            tone={review.status === "Published" ? "success" : "attention"}
          >
            {review.status}
          </s-badge>
        </s-stack>

        <s-text>{"★".repeat(review.rating)}</s-text>

        <s-text tone="subdued">
          {review.content.length > 100
            ? review.content.slice(0, 100) + "…"
            : review.content}
        </s-text>

        <s-stack alignment="space-between">
          <s-text tone="subdued">{review.date}</s-text>
          {/* <s-button size="slim">View</s-button> */}
        </s-stack>
      </s-stack>
    </s-box>
  );
}
