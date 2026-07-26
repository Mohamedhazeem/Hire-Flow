"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { XIcon, CopyIcon, CheckIcon, SparklesIcon, AlertCircle, Loader2Icon, WandSparklesIcon, TrendingUpIcon, LightbulbIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResumeSuggestion, EnhancementsResponse } from "@/app/features/user/schema/resume-ai.schema";

type AiSuggestionsPanelProps = {
  result: EnhancementsResponse;
  isBuilder: boolean;
  isApplying: boolean;
  onApply: (suggestion: ResumeSuggestion) => void;
  onClose: () => void;
};

const priorityColors: Record<string, { bg: string; text: string; dot: string }> = {
  high: { bg: "bg-error/10", text: "text-error", dot: "bg-error" },
  medium: { bg: "bg-amber/10", text: "text-amber", dot: "bg-amber" },
  low: { bg: "bg-brand/10", text: "text-brand", dot: "bg-brand" },
};

const typeLabels: Record<string, string> = {
  bullet_improvement: "Bullet Improvement",
  skill_addition: "Skill Addition",
  section_expansion: "Section Expansion",
  ats_optimization: "ATS Optimization",
  grammar: "Grammar",
};

function scoreConfig(score: number): { color: string; bg: string; ring: string; label: string } {
  if (score < 40) return { color: "text-white", bg: "bg-error", ring: "ring-error/20", label: "Needs Work" };
  if (score < 60) return { color: "text-white", bg: "bg-orange-500", ring: "ring-orange-500/20", label: "Fair" };
  if (score < 75) return { color: "text-white", bg: "bg-amber", ring: "ring-amber/20", label: "Good" };
  if (score < 90) return { color: "text-white", bg: "bg-emerald-500", ring: "ring-emerald-500/20", label: "Great" };
  return { color: "text-white", bg: "bg-green", ring: "ring-green/20", label: "Excellent" };
}

function ScoreCircle({ score }: { score: number }) {
  const cfg = scoreConfig(score);
  return (
    <div className="flex items-center gap-5">
      <div className={`relative size-24 rounded-full ${cfg.bg} ${cfg.ring} ring-4 flex items-center justify-center shrink-0`}>
        <div className="text-center">
          <p className={`text-2xl font-bold tracking-tight ${cfg.color}`}>{score}</p>
          <p className="text-[10px] font-medium text-white/70">/ 100</p>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-text-heading">{cfg.label}</p>
        <p className="text-xs text-text-muted leading-relaxed max-w-xs">
          {score >= 80 ? "Strong resume with minor optimizations available." :
           score >= 50 ? "Good foundation with several areas to improve." :
           "Significant improvements recommended."}
        </p>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(
          () => { setCopied(true); setFailed(false); setTimeout(() => setCopied(false), 2000); },
          () => { setFailed(true); },
        );
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-bg-surface px-2.5 py-1.5 text-xs font-medium text-text-muted hover:border-brand/30 hover:text-text-heading hover:bg-brand/5 transition-all"
    >
      {copied ? <CheckIcon className="size-3.5 text-green" /> : <CopyIcon className="size-3.5" />}
      {copied ? "Copied" : failed ? "Failed" : "Copy"}
    </button>
  );
}

function InfoChip({ children, icon: Icon, color }: { children: string; icon: typeof LightbulbIcon; color: "green" | "amber" }) {
  const styles = {
    green: "bg-green/5 text-green border-green/15",
    amber: "bg-amber/5 text-amber border-amber/15",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${styles[color]} px-3 py-1 text-xs font-medium`}>
      <Icon className="size-3" />
      {children}
    </span>
  );
}

export function AiSuggestionsPanel({ result, isBuilder, isApplying, onApply, onClose }: AiSuggestionsPanelProps) {
  const { suggestions, overallScore, keyStrengths, improvementAreas } = result;

  const grouped: Record<string, ResumeSuggestion[]> = {};
  const sectionOrder = ["summary", "experience", "education", "skills"];
  for (const s of suggestions) {
    if (!grouped[s.section]) grouped[s.section] = [];
    grouped[s.section].push(s);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border-subtle bg-bg-surface shadow-xl"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-subtle bg-bg-surface px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-gradient-to-br from-brand to-purple-500 flex items-center justify-center">
                <WandSparklesIcon className="size-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text-heading">AI Resume Analysis</h2>
                <p className="text-xs text-text-muted">Suggestions to improve your resume</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-muted hover:bg-bg-elevated hover:text-text-heading transition-colors"
            >
              <XIcon className="size-5" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">

            <ScoreCircle score={overallScore} />

            {keyStrengths.length > 0 && (
              <div className="rounded-xl border border-green/15 bg-gradient-to-r from-green/5 to-transparent p-4 space-y-3">
                <p className="text-xs font-semibold text-green uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUpIcon className="size-3.5" />
                  Key Strengths
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {keyStrengths.map((s, i) => (
                    <InfoChip key={i} icon={CheckIcon} color="green">{s}</InfoChip>
                  ))}
                </div>
              </div>
            )}

            {improvementAreas.length > 0 && (
              <div className="rounded-xl border border-amber/15 bg-gradient-to-r from-amber/5 to-transparent p-4 space-y-3">
                <p className="text-xs font-semibold text-amber uppercase tracking-wider flex items-center gap-1.5">
                  <LightbulbIcon className="size-3.5" />
                  Areas to Improve
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {improvementAreas.map((s, i) => (
                    <InfoChip key={i} icon={SparklesIcon} color="amber">{s}</InfoChip>
                  ))}
                </div>
              </div>
            )}

            {suggestions.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <div className="size-14 rounded-full bg-green/10 flex items-center justify-center">
                  <CheckIcon className="size-7 text-green" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-heading">Your resume is well-optimized!</p>
                  <p className="text-xs text-text-muted mt-1">No specific suggestions found at this time.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {sectionOrder.map((section) => {
                  const items = grouped[section];
                  if (!items || items.length === 0) return null;
                  return (
                    <div key={section}>
                      <h3 className="text-sm font-semibold text-text-heading mb-3 flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-brand" />
                        {section === "summary" ? "Professional Summary" :
                         section === "experience" ? "Experience" :
                         section === "education" ? "Education" : "Skills"}
                      </h3>
                      <div className="space-y-2.5">
                        {items
                          .sort((a, b) => {
                            const order = { high: 0, medium: 1, low: 2 };
                            return order[a.priority] - order[b.priority];
                          })
                          .map((s, idx) => {
                            const pc = priorityColors[s.priority] ?? priorityColors.low;
                            return (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: idx * 0.03 }}
                                className="rounded-xl border border-border-subtle bg-bg-elevated shadow-xs hover:shadow-sm hover:border-border transition-all p-4 space-y-2.5"
                              >
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                                    {typeLabels[s.type] ?? s.type}
                                  </span>
                                  <span className={`inline-flex items-center gap-1.5 rounded-full ${pc.bg} ${pc.text} border border-transparent px-2 py-0.5 text-[10px] font-medium`}>
                                    <span className={`size-1.5 rounded-full ${pc.dot}`} />
                                    {s.priority}
                                  </span>
                                </div>
                                {s.original && (
                                  <div className="rounded-lg bg-error/5 border border-error/10 px-3 py-2">
                                    <p className="text-xs text-text-muted line-through">{s.original}</p>
                                  </div>
                                )}
                                <p className="text-sm font-medium text-text-heading">{s.suggestion}</p>
                                <p className="text-xs text-text-muted leading-relaxed">{s.reasoning}</p>
                                <div className="flex items-center gap-2 pt-1.5 border-t border-border-subtle">
                                  <CopyButton text={s.suggestion} />
                                  {isBuilder && (
                                    <Button
                                      variant="outline"
                                      size="xs"
                                      className="gap-1 text-xs"
                                      onClick={() => onApply(s)}
                                      disabled={isApplying}
                                    >
                                      {isApplying ? <Loader2Icon className="size-3.5 animate-spin" /> : <WandSparklesIcon className="size-3.5" />}
                                      {isApplying ? "Applying..." : "Apply"}
                                    </Button>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!isBuilder && suggestions.length > 0 && (
              <div className="flex items-start gap-2.5 rounded-xl bg-amber/5 border border-amber/20 p-3.5">
                <AlertCircle className="size-4 text-amber shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted leading-relaxed">
                  This resume was uploaded as a file. To apply suggestions, <span className="font-medium text-text-heading">copy each change</span>, edit the file externally, and re-upload.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}