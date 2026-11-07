import { createFileRoute } from "@tanstack/react-router";
import { CinematicExperience } from "@/components/CinematicExperience";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lavage International | Premium Vehicle Care" },
      {
        name: "description",
        content:
          "Discover premium vehicle care at Lavage International. Explore our services and track your vehicle's progress.",
      },
      { property: "og:title", content: "Lavage International | Premium Vehicle Care" },
      {
        property: "og:description",
        content:
          "Explore vehicle care services and follow your vehicle's progress at Lavage International.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return <CinematicExperience />;
}
