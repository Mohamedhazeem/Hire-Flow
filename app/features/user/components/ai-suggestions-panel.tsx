"use client";

import { useState } from "react";
import { XIcon, CopyIcon, CheckIcon, SparklesIcon, AlertCircle, Loader2Icon } from "lucide-react";
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

function scoreColor(score: number): string {
  if (score < 50) return "text-error";
  if (score < 75) return "text-amber";
  return "text-green";
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
      className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-heading transition-colors"
    >
      {copied ? <CheckIcon className="size-3.5 text-green" /> : <CopyIcon className="size-3.5" />}
      {copied ? "Copied" : failed ? "Copy failed" : "Copy"}
    </button>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border-subtle bg-bg-surface shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-subtle bg-bg-surface px-6 py-4">
          <div className="flex items-center gap-2">
            <SparklesIcon className="size-5 text-brand" />
            <h2 className="text-lg font-semibold text-text-heading">AI Suggestions</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-bg-elevated transition-colors"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">Score:</span>
              <span className={`text-2xl font-bold ${scoreColor(overallScore)}`}>
                {overallScore}
                <span className="text-sm text-text-muted">/100</span>
              </span>
            </div>
          </div>

          {keyStrengths.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Key Strengths</p>
              <div className="flex flex-wrap gap-1.5">
                {keyStrengths.map((s, i) => (
                  <span key={i} className="inline-flex items-center rounded-full bg-green/10 text-green border border-green/20 px-2.5 py-0.5 text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {improvementAreas.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Areas to Improve</p>
              <div className="flex flex-wrap gap-1.5">
                {improvementAreas.map((s, i) => (
                  <span key={i} className="inline-flex items-center rounded-full bg-amber/10 text-amber border border-amber/20 px-2.5 py-0.5 text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {suggestions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CheckIcon className="size-8 text-green" />
              <p className="text-sm font-medium text-text-heading">No specific suggestions found</p>
              <p className="text-xs text-text-muted">Your resume looks well-optimized!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sectionOrder.map((section) => {
                const items = grouped[section];
                if (!items || items.length === 0) return null;
                return (
                  <div key={section}>
                    <h3 className="text-sm font-medium text-text-heading capitalize mb-2">
                      {section === "summary" ? "Professional Summary" :
                       section === "experience" ? "Experience" :
                       section === "education" ? "Education" : "Skills"}
                    </h3>
                    <div className="space-y-2">
                      {items
                        .sort((a, b) => {
                          const order = { high: 0, medium: 1, low: 2 };
                          return order[a.priority] - order[b.priority];
                        })
                        .map((s, idx) => {
                          const pc = priorityColors[s.priority] ?? priorityColors.low;
                          return (
                            <div key={idx} className="rounded-xl border border-border-subtle bg-bg-elevated p-4 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                  {typeLabels[s.type] ?? s.type}
                                </span>
                                <span className={`inline-flex items-center gap-1 rounded-full ${pc.bg} ${pc.text} px-2 py-0.5 text-[10px] font-medium`}>
                                  <span className={`size-1.5 rounded-full ${pc.dot}`} />
                                  {s.priority}
                                </span>
                              </div>
                              {s.original && (
                                <p className="text-xs text-text-muted line-through">
                                  {s.original}
                                </p>
                              )}
                              <p className="text-sm text-text-heading">{s.suggestion}</p>
                              <p className="text-xs text-text-muted">{s.reasoning}</p>
                              <div className="flex items-center gap-3 pt-1">
                                <CopyButton text={s.suggestion} />
                                {isBuilder && (
                                  <button
                                    type="button"
                                    onClick={() => onApply(s)}
                                    disabled={isApplying}
                                    className="inline-flex items-center gap-1 text-xs text-brand hover:text-brand/80 disabled:text-text-muted disabled:cursor-not-allowed transition-colors"
                                  >
                                    {isApplying ? <Loader2Icon className="size-3.5 animate-spin" /> : <SparklesIcon className="size-3.5" />}
                                    {isApplying ? "Applying..." : "Apply"}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isBuilder && suggestions.length > 0 && (
            <div className="flex items-start gap-2 rounded-xl bg-amber/5 border border-amber/20 p-3">
              <AlertCircle className="size-4 text-amber shrink-0 mt-0.5" />
              <p className="text-xs text-text-muted">
                This is a file-uploaded resume. To apply suggestions, copy each change, edit the file externally, and re-upload.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
