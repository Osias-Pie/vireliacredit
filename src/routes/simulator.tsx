import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy URL kept only as a backwards-compatible redirect. The simulator itself was removed. */
export const Route = createFileRoute("/simulator")({
  beforeLoad: () => {
    throw redirect({ to: "/eligibility", replace: true });
  },
  component: () => null,
});
