export default function AdditionalPage() {
  return (
    <s-page heading="Settings page">
      <s-section heading="Store Information">
          <s-text-field
            label="Store name"
            name="store-name"
            value="Puzzlify Store"
            placeholder="Enter store name"
          />
          <s-text-field
            label="Business address"
            name="business-address"
            value="123 Main St, Anytown, USA"
            placeholder="Enter business address"
          />
          <s-text-field
            label="Store phone"
            name="store-phone"
            value="+1 (555) 123-4567"
            placeholder="Enter phone number"
          />
          <s-choice-list label="Primary currency" name="currency">
            <s-choice value="usd" selected>
              US Dollar ($)
            </s-choice>
            <s-choice value="cad">Canadian Dollar (CAD)</s-choice>
            <s-choice value="eur">Euro (€)</s-choice>
          </s-choice-list>
        </s-section>
    </s-page>
  );
}
