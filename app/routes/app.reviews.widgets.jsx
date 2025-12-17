import ReviewTabs from "./ReviewTabs";

export default function Widgets() {
  return (
    <>
      <ReviewTabs />
      <s-page title="Widgets">
        <s-layout>
          <s-layout-section>
            <s-card>
              <s-box padding="400">
                <s-text variant="headingMd">Configuration des Widgets</s-text>
                <s-text variant="bodyMd">À venir...</s-text>
              </s-box>
            </s-card>
          </s-layout-section>
        </s-layout>
      </s-page>
    </>
  );
}
