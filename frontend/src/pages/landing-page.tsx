import { Link } from "react-router-dom";
import { ActivitySquare, HeartPulse, ShieldCheck, Sparkles, Users2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

const features = [
  {
    icon: HeartPulse,
    title: "Unified patient records",
    description:
      "A single, secure home for medical history, built to scale as new modules come online.",
  },
  {
    icon: Users2,
    title: "Role-based experience",
    description:
      "Purpose-built workflows for patients and doctors, with clear separation of concerns.",
  },
  {
    icon: Sparkles,
    title: "AI-ready architecture",
    description:
      "A foundation designed from day one to support intelligent features without rework.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    description:
      "Clean architecture and layered access control, ready for enterprise-grade auth.",
  },
];

export function LandingPage() {
  return (
    <div>
      <section className="container flex flex-col items-center gap-6 py-20 text-center md:py-32">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
          <ActivitySquare className="h-4 w-4" />
          Role-Based AI Healthcare Platform
        </div>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Healthcare, organized around{" "}
          <span className="text-primary">people, not paperwork</span>
        </h1>

        <p className="max-w-xl text-lg text-muted-foreground">
          MediVerse AI brings patients and doctors onto one connected platform —
          built on a clean, scalable foundation ready for what comes next.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link to={ROUTES.REGISTER}>Create your account</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to={ROUTES.LOGIN}>I already have an account</Link>
          </Button>
        </div>
      </section>

      <section className="container grid gap-6 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="border-border/80">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle className="pt-3 text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
