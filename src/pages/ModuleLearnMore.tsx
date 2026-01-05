import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { LANDING_MODULES } from '@/config/landingModules';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ModuleLearnMore() {
  const { slug } = useParams();
  const module = LANDING_MODULES.find((item) => item.slug === slug);

  if (!module) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Module not found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The module you requested is not available yet.
            </p>
            <Button asChild>
              <Link to="/#modules">Back to modules</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Icon = module.icon;

  return (
    <div className="min-h-screen bg-background font-['Space_Grotesk',sans-serif]">
      <section className="py-20 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${module.color}`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  {module.name}
                </h1>
                <p className="text-lg text-muted-foreground">{module.description}</p>
              </div>
              {module.price && (
                <div className="rounded-2xl border bg-card p-6 text-center">
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">Starting at</p>
                  <p className="text-3xl font-bold text-primary mt-2">{module.price}</p>
                  <Button asChild className="mt-4 w-full">
                    <Link to="/staff-login">
                      Start Exploring
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Core Capabilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {module.coreFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-1" />
                    <p className="text-sm text-foreground">{feature}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Extra Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {module.extraFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-1" />
                    <p className="text-sm text-foreground">{feature}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to launch {module.name}?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Get a guided setup and activate the module with your team in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/staff-login">
                Start Exploring
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/#modules">Back to modules</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
