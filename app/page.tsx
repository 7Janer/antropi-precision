"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  FileCheck2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type PrecisionTier = {
  id: "standard" | "pro" | "ultra";
  name: string;
  value: string;
  fit: string;
  examples: string;
  inspection: string;
};

type ComponentGuide = {
  id: string;
  name: string;
  label: string;
  summary: string;
  features: string[];
  tier: string;
};

const precisionTiers: PrecisionTier[] = [
  {
    id: "standard",
    name: "Standard",
    value: "100 μm",
    fit: "Reliable production for non-critical geometry.",
    examples: "Brackets, covers, fixture plates and general enclosures.",
    inspection: "Defined dimensional sampling with a shipment-linked report.",
  },
  {
    id: "pro",
    name: "Pro",
    value: "10 μm",
    fit: "Tighter control where fit and alignment matter.",
    examples: "Bearing seats, sealing interfaces and aligned assemblies.",
    inspection: "Critical-feature inspection planned before machining begins.",
  },
  {
    id: "ultra",
    name: "Ultra",
    value: "5 μm",
    fit: "For the few dimensions that cannot move.",
    examples: "High-precision mating features, optics and robotic assemblies.",
    inspection: "Comprehensive verification of every defined critical feature.",
  },
];

const componentGuides: ComponentGuide[] = [
  {
    id: "bearing-housing",
    name: "Bearing housing",
    label: "Rotating assembly",
    summary:
      "Supports a bearing and keeps a shaft aligned, so bore geometry and mounting faces usually carry the risk.",
    features: ["Bearing bore", "Mounting face", "Coaxiality"],
    tier: "Pro · 10 μm",
  },
  {
    id: "motor-mount",
    name: "Motor mount",
    label: "Structural bracket",
    summary:
      "Locates a motor relative to the driven system while resisting vibration and maintaining belt or shaft alignment.",
    features: ["Hole pattern", "Face flatness", "Stiffness"],
    tier: "Standard · 100 μm",
  },
  {
    id: "fluid-manifold",
    name: "Fluid manifold",
    label: "Flow control",
    summary:
      "Routes air or fluid through compact internal passages; sealing surfaces, intersecting bores and clean deburring matter most.",
    features: ["Sealing lands", "Port threads", "Cross-bores"],
    tier: "Pro · 10 μm",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Upload what you have",
    text: "CAD, drawings and notes enter one structured order package.",
  },
  {
    number: "02",
    title: "Lock the important details",
    text: "Material, finish, critical features and inspection needs are confirmed in context.",
  },
  {
    number: "03",
    title: "Follow production",
    text: "The assured date, milestones and risk flags stay visible as the job moves.",
  },
  {
    number: "04",
    title: "Reorder the approved part",
    text: "The manufacturing record stays tied to the part, ready for repeat production.",
  },
];

const comparisons = [
  ["Delivery", "Best-effort date after follow-ups", "Assured expectations at quote"],
  ["Clarification", "Details scattered across email", "Decisions tied to the order"],
  ["Quality", "Reports chased after delivery", "Inspection evidence ships with the lot"],
  ["Repeat order", "Re-explain the part each time", "Reuse the approved manufacturing record"],
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function MarkIcon() {
  return (
    <span className="mark-icon" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

export default function Home() {
  const [activeTier, setActiveTier] = useState<PrecisionTier>(precisionTiers[1]);
  const [selectedComponent, setSelectedComponent] = useState<ComponentGuide | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerSource, setAnswerSource] = useState<"gemini" | "fallback" | "">("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");

  async function explainComponent(component: ComponentGuide, customQuestion?: string) {
    setSelectedComponent(component);
    setSheetOpen(true);
    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          componentId: component.id,
          question:
            customQuestion?.trim() ||
            `Explain what a ${component.name} does, what is difficult to machine, and what should be inspected.`,
        }),
      });

      if (!response.ok) throw new Error("Explanation unavailable");
      const data = (await response.json()) as {
        answer: string;
        source: "gemini" | "fallback";
      };
      setAnswer(data.answer);
      setAnswerSource(data.source);
    } catch {
      setAnswer(
        `${component.summary} The production team would focus on ${component.features.join(
          ", ",
        )}. Antropi would confirm the final tolerance and inspection plan against your drawing before production.`,
      );
      setAnswerSource("fallback");
    } finally {
      setLoading(false);
    }
  }

  function submitQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedComponent && question.trim()) {
      void explainComponent(selectedComponent, question);
      setQuestion("");
    }
  }

  return (
    <main>
      <section className="hero" id="top">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />

        <header className="site-header shell">
          <a className="brand" href="#top" aria-label="Antropi Robotics home">
            <img src="/antropi-logo.svg" alt="Antropi Robotics" />
          </a>
          <nav aria-label="Primary navigation">
            <a href="#precision">Precision</a>
            <a href="#quality">Quality</a>
            <a href="#process">Process</a>
            <a href="#part-guide">AI part guide</a>
          </nav>
          <div className="header-actions">
            <a className="text-link" href="https://order.antropi.world/login">
              Log in
            </a>
            <Button asChild className="button button-compact button-light">
              <a href="#start">Start an order <ArrowRight /></a>
            </Button>
          </div>
        </header>

        <div className="hero-content shell">
          <div className="hero-copy">
            <p className="eyebrow"><span /> Autonomous CNC manufacturing · Bengaluru</p>
            <h1>Your precision parts. Repeated exactly.</h1>
            <p className="hero-lede">
              Upload a CAD package, choose the precision your part needs and get
              a delivery expectation you can actually plan around.
            </p>
            <div className="hero-actions">
              <Button asChild className="button button-primary">
                <a href="#start"><Upload /> Upload your CAD</a>
              </Button>
              <Button asChild variant="outline" className="button button-outline">
                <a href="#precision">Compare precision tiers <ArrowRight /></a>
              </Button>
            </div>
            <div className="hero-proof" aria-label="Key service benefits">
              <span><Check /> 5 μm capability</span>
              <span><Check /> In-house inspection</span>
              <span><Check /> Repeat-order ready</span>
            </div>
          </div>

          <div className="live-order-card" aria-label="Example order visibility card">
            <div className="live-card-topline">
              <span>ORDER / AR-2048</span>
              <span className="live-state"><i /> ON TRACK</span>
            </div>
            <div className="live-card-title">
              <div>
                <span>FLUID MANIFOLD</span>
                <strong>Production record</strong>
              </div>
              <MarkIcon />
            </div>
            <div className="precision-stamp">
              <span>PRECISION TIER</span>
              <strong>PRO</strong>
              <b>10 μm</b>
            </div>
            <div className="order-progress">
              <div className="progress-line"><span style={{ width: "64%" }} /></div>
              <div className="progress-labels">
                <span><i className="done" /> CAM</span>
                <span><i className="done" /> MACHINING</span>
                <span><i className="active" /> INSPECTION</span>
                <span><i /> SHIP</span>
              </div>
            </div>
            <div className="order-card-footer">
              <span><small>DELIVERY</small><strong>Assured at quote</strong></span>
              <span><small>QUALITY PLAN</small><strong>12 checkpoints</strong></span>
            </div>
          </div>
        </div>

        <div className="trust-rail">
          <div className="shell trust-grid">
            <p>Built for teams that cannot afford production uncertainty.</p>
            <span>BACKED BY <strong>Y COMBINATOR</strong></span>
            <span><ShieldCheck /> IN-HOUSE QUALITY</span>
            <span><RefreshCw /> REPEAT PRODUCTION</span>
          </div>
        </div>
      </section>

      <section className="section precision-section" id="precision">
        <div className="shell">
          <div className="section-heading heading-split">
            <div>
              <p className="kicker">01 / CHOOSE WHAT THE PART NEEDS</p>
              <h2>Precision is a decision,<br />not a vague promise.</h2>
            </div>
            <p>
              Match cost and control to the function of your part. Every tier
              comes with a defined quality plan and traceable order record.
            </p>
          </div>

          <div className="tier-selector" role="tablist" aria-label="Precision tiers">
            {precisionTiers.map((tier) => (
              <button
                key={tier.id}
                id={`tier-${tier.id}`}
                className={activeTier.id === tier.id ? "tier-tab active" : "tier-tab"}
                onClick={() => setActiveTier(tier)}
                role="tab"
                aria-selected={activeTier.id === tier.id}
                aria-controls="tier-panel"
              >
                <span>{tier.name}</span>
                <strong>{tier.value}</strong>
                <i aria-hidden="true" />
              </button>
            ))}
          </div>

          <div
            className="tier-detail"
            id="tier-panel"
            role="tabpanel"
            aria-labelledby={`tier-${activeTier.id}`}
          >
            <div className="tier-scale" aria-hidden="true">
              <span className="scale-label scale-label-left">0</span>
              <span className="scale-line scale-line-1" />
              <span className="scale-line scale-line-2" />
              <span className="scale-line scale-line-3" />
              <span className="scale-line scale-line-4" />
              <span className="scale-focus" style={{ width: activeTier.id === "standard" ? "78%" : activeTier.id === "pro" ? "38%" : "20%" }} />
              <span className="scale-value">{activeTier.value}</span>
            </div>
            <div className="tier-copy">
              <div>
                <p className="micro-label">BEST FIT</p>
                <h3>{activeTier.fit}</h3>
                <p>{activeTier.examples}</p>
              </div>
              <div>
                <p className="micro-label">INSPECTION APPROACH</p>
                <p className="tier-inspection"><FileCheck2 /> {activeTier.inspection}</p>
              </div>
              <Button asChild variant="outline" className="button button-dark-outline">
                <a href="#start">Start with {activeTier.name} <ArrowRight /></a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section quality-section" id="quality">
        <div className="shell quality-layout">
          <div className="quality-copy">
            <p className="kicker">02 / TRUST IS MEASURED</p>
            <h2>Quality proof travels with every part.</h2>
            <p className="quality-lede">
              Inspection is planned before the spindle starts. Critical
              dimensions, lot records and decisions stay connected to the order.
            </p>
            <div className="quality-points">
              <article>
                <ShieldCheck />
                <div><h3>In-house control</h3><p>Quality checks happen inside the same manufacturing loop.</p></div>
              </article>
              <article>
                <FileCheck2 />
                <div><h3>Evidence, not assurances</h3><p>Inspection records are ready when the shipment is ready.</p></div>
              </article>
              <article>
                <RefreshCw />
                <div><h3>A repeatable record</h3><p>Approved part context carries into the next order.</p></div>
              </article>
            </div>
          </div>

          <div className="inspection-card">
            <div className="inspection-header">
              <div><span>SAMPLE INSPECTION RECORD</span><strong>IR / 0427-B</strong></div>
              <span className="pass-badge"><Check /> PASS</span>
            </div>
            <div className="inspection-part">
              <span>PART</span>
              <strong>BEARING HOUSING / REV C</strong>
              <small>LOT 014 · PRO TIER</small>
            </div>
            <div className="inspection-table" role="table" aria-label="Sample inspection measurements">
              <div className="inspection-row table-head" role="row">
                <span>FEATURE</span><span>NOMINAL</span><span>MEASURED</span><span>STATUS</span>
              </div>
              <div className="inspection-row" role="row">
                <span>Bore ØA</span><span>24.000</span><span>23.998</span><span><i /> Pass</span>
              </div>
              <div className="inspection-row" role="row">
                <span>Face B</span><span>42.500</span><span>42.503</span><span><i /> Pass</span>
              </div>
              <div className="inspection-row" role="row">
                <span>Position C</span><span>0.010</span><span>0.007</span><span><i /> Pass</span>
              </div>
            </div>
            <div className="inspection-footer">
              <span>3 OF 12 CRITICAL FEATURES SHOWN</span>
              <span>TRACEABLE TO SHIPPED LOT</span>
            </div>
          </div>
        </div>

        <div className="shell comparison-wrap">
          <div className="comparison-heading">
            <p className="kicker">WHAT CHANGES</p>
            <h3>Less chasing. More certainty.</h3>
          </div>
          <div className="comparison-table">
            <div className="comparison-row comparison-head">
              <span /> <span>TRADITIONAL JOB SHOP</span><span><MarkIcon /> ANTROPI</span>
            </div>
            {comparisons.map(([label, traditional, antropi]) => (
              <div className="comparison-row" key={label}>
                <strong>{label}</strong><span>{traditional}</span><span><Check /> {antropi}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section process-section" id="process">
        <div className="shell">
          <div className="section-heading heading-split">
            <div>
              <p className="kicker">03 / FROM CAD TO REPEAT ORDER</p>
              <h2>A manufacturing thread<br />that stays unbroken.</h2>
            </div>
            <p>
              One source of truth replaces scattered drawings, status calls and
              the guesswork that returns with every repeat order.
            </p>
          </div>
          <div className="process-grid">
            {processSteps.map((step, index) => (
              <article className="process-step" key={step.number}>
                <div className="step-top"><span>{step.number}</span>{index < processSteps.length - 1 && <ArrowRight />}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section ai-section" id="part-guide">
        <div className="shell ai-layout">
          <div className="ai-intro">
            <p className="kicker">04 / AI PART GUIDE</p>
            <h2>Understand the part before you quote it.</h2>
            <p>
              Choose a common CNC component for a plain-English explanation of
              its function, machining risks and the features that deserve attention.
            </p>
            <div className="ai-note"><Sparkles /><span><strong>Powered by Gemini</strong> with a curated knowledge fallback whenever the AI service is unavailable.</span></div>
          </div>

          <div className="component-list">
            {componentGuides.map((component, index) => (
              <article className="component-card" key={component.id}>
                <div className="component-index">0{index + 1}</div>
                <div className="component-card-body">
                  <p>{component.label}</p>
                  <h3>{component.name}</h3>
                  <div className="feature-tags">
                    {component.features.map((feature) => <span key={feature}>{feature}</span>)}
                  </div>
                </div>
                <div className="component-action">
                  <span>{component.tier}</span>
                  <Button
                    variant="outline"
                    className="icon-button"
                    aria-label={`Explain ${component.name}`}
                    onClick={() => void explainComponent(component)}
                  >
                    <Sparkles />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="order-cta" id="start">
        <div className="order-cta-grid" aria-hidden="true" />
        <div className="shell cta-layout">
          <div>
            <p className="eyebrow"><span /> YOUR NEXT PRODUCTION RUN</p>
            <h2>Send the part.<br />We’ll make certainty part of the order.</h2>
          </div>
          <div className="upload-panel">
            <div className="upload-panel-icon"><Upload /></div>
            <div>
              <strong>{selectedFile || "Upload CAD, drawing or order notes"}</strong>
              <span>{selectedFile ? "File selected — continue to add requirements" : "STEP, STP, IGES, STL, PDF or ZIP · up to 100 MB"}</span>
            </div>
            <Button asChild className="button button-primary upload-button">
              <label>
                {selectedFile ? "Replace file" : "Choose file"}
                <input
                  type="file"
                  accept=".step,.stp,.iges,.igs,.stl,.pdf,.zip,.dwg"
                  onChange={(event) => setSelectedFile(event.target.files?.[0]?.name || "")}
                />
              </label>
            </Button>
            {selectedFile && (
              <Button asChild variant="outline" className="button button-outline continue-button">
                <a href="https://order.antropi.world/new-order/parts">Continue securely <ArrowRight /></a>
              </Button>
            )}
          </div>
        </div>
      </section>

      <footer>
        <div className="shell footer-main">
          <img src="/antropi-logo.svg" alt="Antropi Robotics" />
          <p>Autonomous CNC factories for faster, repeatable hardware.</p>
          <div>
            <a href="#precision">Precision</a>
            <a href="#quality">Quality</a>
            <a href="#process">Process</a>
            <a href="https://www.antropi.world/">Company</a>
          </div>
        </div>
        <div className="shell footer-bottom">
          <span>© 2026 Wingway Robotics Pvt. Ltd.</span>
          <span>Bengaluru, India</span>
        </div>
      </footer>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="ai-sheet" side="right">
          {selectedComponent && (
            <>
              <SheetHeader className="ai-sheet-header">
                <span className="sheet-kicker"><Sparkles /> AI PART GUIDE</span>
                <SheetTitle>{selectedComponent.name}</SheetTitle>
                <SheetDescription>{selectedComponent.label} · Suggested {selectedComponent.tier}</SheetDescription>
              </SheetHeader>
              <div className="ai-sheet-content">
                <div className="sheet-tags">
                  {selectedComponent.features.map((feature) => <span key={feature}>{feature}</span>)}
                </div>
                <div className={loading ? "answer-box loading" : "answer-box"} aria-live="polite">
                  {loading ? (
                    <>
                      <span className="loading-line long" />
                      <span className="loading-line" />
                      <span className="loading-line medium" />
                      <p>Reading the part like a manufacturing engineer…</p>
                    </>
                  ) : (
                    <>
                      <p>{answer}</p>
                      {answerSource && (
                        <span className="answer-source">
                          {answerSource === "gemini" ? "GEMINI RESPONSE" : "CURATED FALLBACK RESPONSE"}
                        </span>
                      )}
                    </>
                  )}
                </div>
                <form className="question-form" onSubmit={submitQuestion}>
                  <label htmlFor="component-question">Ask about this component</label>
                  <div>
                    <input
                      id="component-question"
                      value={question}
                      onChange={(event) => setQuestion(event.target.value)}
                      placeholder="e.g. Why does bore alignment matter?"
                      maxLength={280}
                    />
                    <Button type="submit" className="question-submit" disabled={!question.trim() || loading}>
                      <ArrowRight />
                      <span className="sr-only">Ask question</span>
                    </Button>
                  </div>
                </form>
                <p className="ai-disclaimer">
                  Educational preview only. Final material, tolerance and inspection
                  decisions are confirmed against your drawing by the manufacturing team.
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
}
