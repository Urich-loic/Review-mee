import { authenticate } from "../shopify.server";
import { useState, useEffect } from "react";
import db from "../db.server";
import { useLoaderData, useSubmit, useNavigation } from "react-router";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);

  let settings = await db.settings.findUnique({
    where: { shop: session.shop },
  });

  if (!settings) {
    settings = await db.settings.create({
      data: { shop: session.shop },
    });
  }

  return { settings };
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const data = {
    autoPublish: formData.get("autoPublish") === "true",
    emailEnabled: formData.get("emailEnabled") === "true",
    emailDelay: parseInt(formData.get("emailDelay")),
    moderationEnabled: formData.get("moderationEnabled") === "true",
    widgetEnabled: formData.get("widgetEnabled") === "true",
    starColor: formData.get("starColor"),
  };

  await db.settings.upsert({
    where: { shop: session.shop },
    update: data,
    create: { ...data, shop: session.shop },
  });

  return { success: true };
}

export default function Settings() {
  const { settings } = useLoaderData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const [showToast, setShowToast] = useState(false);

  const [formState, setFormState] = useState({
    autoPublish: settings.autoPublish,
    emailEnabled: settings.emailEnabled,
    emailDelay: settings.emailDelay.toString(),
    moderationEnabled: settings.moderationEnabled,
    widgetEnabled: settings.widgetEnabled,
    starColor: settings.starColor,
  });

  const isLoading = navigation.state === "submitting";

  useEffect(() => {
    if (navigation.state === "idle" && navigation.formData) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  }, [navigation.state]);

  const handleSubmit = () => {
    const formData = new FormData();
    Object.entries(formState).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    submit(formData, { method: "post" });
  };

  return (
    <>
      {showToast && (
        <s-toast open duration={3000}>
          Settings saved successfully
        </s-toast>
      )}

      <s-page title="Settings">
        <s-page-actions slot="actions">
          <s-button
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
          >
            Save Settings
          </s-button>
        </s-page-actions>

        <s-layout>
          <s-layout-section>
            {/* Review Management */}
            <s-card>
              <s-box padding="400">
                <s-text variant="headingMd">Review Management</s-text>
              </s-box>

              <s-divider />

              <s-box padding="400">
                <s-stack vertical spacing="400">
                  <s-checkbox
                    label="Auto-publish reviews"
                    helpText="Automatically publish new reviews without manual approval"
                    checked={formState.autoPublish}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        autoPublish: e.target.checked,
                      })
                    }
                  />

                  <s-checkbox
                    label="Enable moderation"
                    helpText="Require manual approval before reviews are published"
                    checked={formState.moderationEnabled}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        moderationEnabled: e.target.checked,
                      })
                    }
                  />
                </s-stack>
              </s-box>
            </s-card>

            {/* Email Settings */}
            <s-card>
              <s-box padding="400">
                <s-text variant="headingMd">Email Settings</s-text>
              </s-box>

              <s-divider />

              <s-box padding="400">
                <s-stack vertical spacing="400">
                  <s-checkbox
                    label="Send review request emails"
                    helpText="Automatically email customers to request reviews after delivery"
                    checked={formState.emailEnabled}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        emailEnabled: e.target.checked,
                      })
                    }
                  />

                  <s-text-field
                    label="Days after delivery"
                    type="number"
                    value={formState.emailDelay}
                    onChange={(e) =>
                      setFormState({ ...formState, emailDelay: e.target.value })
                    }
                    helpText="Number of days to wait after order delivery"
                    min="1"
                    max="30"
                  />
                </s-stack>
              </s-box>
            </s-card>

            {/* Widget Display */}
            <s-card>
              <s-box padding="400">
                <s-text variant="headingMd">Widget Display</s-text>
              </s-box>

              <s-divider />

              <s-box padding="400">
                <s-stack vertical spacing="400">
                  <s-checkbox
                    label="Show widget on storefront"
                    helpText="Display the review widget on product pages"
                    checked={formState.widgetEnabled}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        widgetEnabled: e.target.checked,
                      })
                    }
                  />

                  <s-text-field
                    label="Star color"
                    type="color"
                    value={formState.starColor}
                    onChange={(e) =>
                      setFormState({ ...formState, starColor: e.target.value })
                    }
                    helpText="Choose the color for star ratings"
                  />
                </s-stack>
              </s-box>
            </s-card>

            {/* Danger Zone */}
            <s-card>
              <s-box padding="400">
                <s-stack vertical spacing="200">
                  <s-text variant="headingMd">Danger Zone</s-text>
                  <s-button
                    variant="critical"
                    onClick={() => {
                      if (confirm("Delete all unpublished reviews?")) {
                        // Handle deletion
                      }
                    }}
                  >
                    Delete Unpublished Reviews
                  </s-button>
                </s-stack>
              </s-box>
            </s-card>
          </s-layout-section>
        </s-layout>
      </s-page>
    </>
  );
}
