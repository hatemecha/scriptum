import { AuthScreen } from "@/features/product/components/auth-screen";
import { EditorScreen } from "@/features/product/components/editor-screen";
import { ProjectsScreen } from "@/features/product/components/projects-screen";
import { SettingsScreen } from "@/features/product/components/settings-screen";

export default function BoneyardPlaygroundPage() {
  return (
    <main
      style={{
        display: "grid",
        gap: "4rem",
        margin: "0 auto",
        maxWidth: "1280px",
        padding: "2rem 1rem 6rem",
      }}
    >
      <section>
        <AuthScreen mode="login" viewState="loading" />
      </section>

      <section>
        <AuthScreen mode="register" viewState="loading" />
      </section>

      <section>
        <ProjectsScreen projects={[]} viewState="loading" />
      </section>

      <section>
        <SettingsScreen
          accountEmail="marina@example.com"
          initialProfile={null}
          passwordAuthAvailable={true}
          profileLoadFailed={false}
          viewState="loading"
        />
      </section>

      <section>
        <EditorScreen
          editorAutosaveEnabled={false}
          editorTipsDetailLevel="full"
          editorTipsEnabled={true}
          initialData={null}
          projectId="the-silent-editor"
          prototypeMode={true}
          userId="playground-bones"
          viewState="loading"
        />
      </section>
    </main>
  );
}
