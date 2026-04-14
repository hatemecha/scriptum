import { SettingsScreen } from "@/features/product/components/settings-screen";

export default function SettingsLoadingPage() {
  return (
    <SettingsScreen
      accountEmail={null}
      initialProfile={null}
      passwordAuthAvailable={false}
      profileLoadFailed={false}
      viewState="loading"
    />
  );
}
