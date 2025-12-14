import React, { useState } from "react";

/**
 * Minimal functional Settings Page for Review App
 * Fully static for now
 */

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    autoPublish: false,
    emailNotifications: true,
    reviewReminder: true,
    ratingThreshold: 3,
  });

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = () => {
    alert("Settings saved! (static demo)");
  };

  return (
    <s-page title="App Settings" subtitle="Configure your review app behavior">
      <s-section>
        <s-card>
          <s-stack vertical spacing="300">
            <SettingToggle
              label="Automatically publish reviews"
              value={settings.autoPublish}
              onToggle={() => handleToggle("autoPublish")}
            />
            <SettingToggle
              label="Email notifications on new review"
              value={settings.emailNotifications}
              onToggle={() => handleToggle("emailNotifications")}
            />
            <SettingToggle
              label="Send review reminders to customers"
              value={settings.reviewReminder}
              onToggle={() => handleToggle("reviewReminder")}
            />
            <SettingInput
              label="Minimum rating to feature review"
              value={settings.ratingThreshold}
              onChange={(val) => setSettings({ ...settings, ratingThreshold: val })}
              type="number"
              min={1}
              max={5}
            />
            <s-button primary onClick={handleSave}>Save Settings</s-button>
          </s-stack>
        </s-card>
      </s-section>
    </s-page>
  );
}

function SettingToggle({ label, value, onToggle }) {
  return (
    <s-stack alignment="space-between">
      <s-text>{label}</s-text>
      <s-switch checked={value} onChange={onToggle} />
    </s-stack>
  );
}

function SettingInput({ label, value, onChange, type = "text", min, max }) {
  return (
    <s-stack alignment="space-between">
      <s-text>{label}</s-text>
      <s-text-field
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
      />
    </s-stack>
  );
}
