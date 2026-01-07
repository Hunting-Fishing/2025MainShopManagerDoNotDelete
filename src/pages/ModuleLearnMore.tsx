import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, Zap, ChevronDown } from 'lucide-react';
import { LANDING_MODULES } from '@/config/landingModules';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-2 space-y-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${module.color}`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                {module.tagline && (
                  <p className="text-lg font-medium text-primary">{module.tagline}</p>
                )}
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  {module.name}
                </h1>
                <p className="text-xl text-muted-foreground">{module.description}</p>
                {module.longDescription && (
                  <div className="text-muted-foreground space-y-4 leading-relaxed">
                    {module.longDescription.split('\n\n').map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button asChild size="lg">
                    <Link to="/staff-login">
                      Start Free Trial
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/#modules">View All Modules</Link>
                  </Button>
                </div>
              </div>
              {module.price && (
                <div className="rounded-2xl border bg-card p-6 shadow-lg">
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">Starting at</p>
                  <p className="text-4xl font-bold text-primary mt-2">{module.price}</p>
                  <p className="text-sm text-muted-foreground mt-1">per month</p>
                  <Button asChild className="mt-6 w-full" size="lg">
                    <Link to="/staff-login">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    14-day free trial • No credit card required
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      {module.idealFor && module.idealFor.length > 0 && (
        <section className="py-16 border-b">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Who It's For</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {module.idealFor.map((audience) => (
                  <span
                    key={audience}
                    className="px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm"
                  >
                    {audience}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Feature Highlights */}
      {module.featureHighlights && module.featureHighlights.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Zap className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Powerful Features</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {module.featureHighlights.map((feature) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <Card key={feature.title} className="h-full">
                      <CardContent className="pt-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${module.color} mb-4`}>
                          <FeatureIcon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Core & Extra Features */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Core Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {module.coreFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">{feature}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  Extra Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {module.extraFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">{feature}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      {module.useCases && module.useCases.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold mb-8">Real-World Use Cases</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {module.useCases.map((useCase, idx) => (
                  <Card key={useCase.title}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </span>
                        <h3 className="font-semibold">{useCase.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground ml-11">
                        {useCase.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Integrations */}
      {module.integrations && module.integrations.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Integrations & Compatibility</h2>
              <div className="flex flex-wrap gap-3">
                {module.integrations.map((integration) => (
                  <span
                    key={integration}
                    className="px-4 py-2 rounded-lg border bg-card text-sm font-medium"
                  >
                    {integration}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {module.faqs && module.faqs.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {module.faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`faq-${idx}`} className="bg-card rounded-lg border px-6">
                    <AccordionTrigger className="text-left font-medium hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to transform your {module.name.toLowerCase()}?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8 text-lg">
            Get started with a free trial and see the difference a purpose-built management system makes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/staff-login">
                Start Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/#modules">Explore Other Modules</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
