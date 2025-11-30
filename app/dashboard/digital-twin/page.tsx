"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/libs/supabase";
import {
  createDigitalTwin,
  dbProfileToPsychometric,
  type DigitalTwin,
  type ToneProfile,
} from "@/libs/digital-twin";

export default function DigitalTwinPage() {
  const [digitalTwin, setDigitalTwin] = useState<DigitalTwin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dossier" | "system-prompt" | "tone" | "styles">("dossier");
  const [copySuccess, setCopySuccess] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const loadDigitalTwin = useCallback(async () => {
    const supabase = createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setIsLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_psychometric_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      setIsLoading(false);
      return;
    }

    const psychometricProfile = dbProfileToPsychometric(profile);
    const completion = profile.completion_percentage || 0;
    setCompletionPercentage(completion);

    const twin = createDigitalTwin(user.id, psychometricProfile, completion);
    setDigitalTwin(twin);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadDigitalTwin();
  }, [loadDigitalTwin]);

  const copySystemPrompt = async () => {
    if (digitalTwin?.systemPrompt) {
      await navigator.clipboard.writeText(digitalTwin.systemPrompt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const ToneBar = ({ label, value, colorClass = "bg-primary" }: { label: string; value: number; colorClass?: string }) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-base-content/60">{value}%</span>
      </div>
      <div className="w-full bg-base-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${colorClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  const ToneProfileDisplay = ({ profile }: { profile: ToneProfile }) => (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <ToneBar label="Formality" value={profile.formality} />
        <ToneBar label="Warmth" value={profile.warmth} colorClass="bg-secondary" />
        <ToneBar label="Humor" value={profile.humor} colorClass="bg-accent" />
        <ToneBar label="Authority" value={profile.authority} colorClass="bg-info" />
        <ToneBar label="Empathy" value={profile.empathy} colorClass="bg-success" />
      </div>
      <div>
        <ToneBar label="Directness" value={profile.directness} colorClass="bg-warning" />
        <ToneBar label="Complexity" value={profile.complexity} colorClass="bg-error" />
        <ToneBar label="Creativity" value={profile.creativity} colorClass="bg-primary" />
        <ToneBar label="Emotionality" value={profile.emotionality} colorClass="bg-secondary" />
        <ToneBar label="Assertiveness" value={profile.assertiveness} colorClass="bg-accent" />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4 text-base-content/60">Generating your Digital Twin...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!digitalTwin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-base-100 rounded-2xl border border-base-200 p-12 text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Create Your Digital Twin</h2>
          <p className="text-base-content/60 mb-6 max-w-md mx-auto">
            Complete the psychometric assessments to generate your Digital Twin - an AI model that captures
            your unique voice, thinking patterns, and writing style.
          </p>
          <Link href="/dashboard/psychometrics" className="btn btn-primary">
            Start Assessments
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Digital Twin</h1>
          <p className="text-base-content/60 mt-1">
            AI-powered representation of your voice, thinking, and writing style
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/psychometrics" className="btn btn-ghost">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Refine Profile
          </Link>
          <Link href="/dashboard?use_twin=true" className="btn btn-primary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Create Book with Twin
          </Link>
        </div>
      </div>

      {/* Completion Banner */}
      {completionPercentage < 100 && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="radial-progress text-warning" style={{ "--value": completionPercentage, "--size": "4rem" } as React.CSSProperties}>
              {completionPercentage}%
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-warning-content">Profile Incomplete</h3>
              <p className="text-sm text-base-content/70">
                Complete more assessments to improve your Digital Twin&apos;s accuracy.
                Current: {completionPercentage}% complete.
              </p>
            </div>
            <Link href="/dashboard/psychometrics" className="btn btn-warning btn-sm">
              Continue Assessments
            </Link>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center shrink-0">
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Profile Summary</h2>
            <p className="text-base-content/70 leading-relaxed">
              {digitalTwin.dossier.summary}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {digitalTwin.dossier.coreTraits.slice(0, 5).map((trait, i) => (
                <span key={i} className="badge badge-primary badge-outline">{trait}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs tabs-boxed bg-base-200 p-1 mb-6 w-fit">
        <button
          className={`tab ${activeTab === "dossier" ? "tab-active bg-base-100" : ""}`}
          onClick={() => setActiveTab("dossier")}
        >
          Personality Dossier
        </button>
        <button
          className={`tab ${activeTab === "system-prompt" ? "tab-active bg-base-100" : ""}`}
          onClick={() => setActiveTab("system-prompt")}
        >
          AI System Prompt
        </button>
        <button
          className={`tab ${activeTab === "tone" ? "tab-active bg-base-100" : ""}`}
          onClick={() => setActiveTab("tone")}
        >
          Tone Profile
        </button>
        <button
          className={`tab ${activeTab === "styles" ? "tab-active bg-base-100" : ""}`}
          onClick={() => setActiveTab("styles")}
        >
          Recommended Styles
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "dossier" && (
        <div className="space-y-6">
          {/* Thinking Style */}
          <div className="bg-base-100 rounded-xl border border-base-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Thinking Style</h3>
            </div>
            <p className="text-base-content/70">{digitalTwin.dossier.thinkingStyle}</p>
          </div>

          {/* Communication Style */}
          <div className="bg-base-100 rounded-xl border border-base-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Communication Style</h3>
            </div>
            <p className="text-base-content/70">{digitalTwin.dossier.communicationStyle}</p>
          </div>

          {/* Emotional Profile */}
          <div className="bg-base-100 rounded-xl border border-base-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Emotional Profile</h3>
            </div>
            <p className="text-base-content/70">{digitalTwin.dossier.emotionalProfile || "Complete the Emotional Intelligence assessment to generate this section."}</p>
          </div>

          {/* Values & Motivations */}
          <div className="bg-base-100 rounded-xl border border-base-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Values & Motivations</h3>
            </div>
            <p className="text-base-content/70">{digitalTwin.dossier.valuesAndMotivations || "Complete the Values assessment to generate this section."}</p>
          </div>

          {/* Creative Tendencies */}
          <div className="bg-base-100 rounded-xl border border-base-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Creative Tendencies</h3>
            </div>
            <p className="text-base-content/70">{digitalTwin.dossier.creativeTendencies || "Complete the Creativity Profile assessment to generate this section."}</p>
          </div>

          {/* Writing Voice */}
          <div className="bg-base-100 rounded-xl border border-base-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Writing Voice</h3>
            </div>
            <p className="text-base-content/70">{digitalTwin.dossier.writingVoice || "Complete the Writing Preferences assessment to generate this section."}</p>
          </div>

          {/* Strengths & Quirks */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-base-100 rounded-xl border border-base-200 p-6">
              <h3 className="text-lg font-bold mb-4">Strengths as a Writer</h3>
              <ul className="space-y-2">
                {digitalTwin.dossier.strengthsAsWriter.length > 0 ? (
                  digitalTwin.dossier.strengthsAsWriter.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-success shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-base-content/70">{strength}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-base-content/50">Complete more assessments to identify your strengths</li>
                )}
              </ul>
            </div>
            <div className="bg-base-100 rounded-xl border border-base-200 p-6">
              <h3 className="text-lg font-bold mb-4">Unique Quirks</h3>
              <ul className="space-y-2">
                {digitalTwin.dossier.uniqueQuirks.length > 0 ? (
                  digitalTwin.dossier.uniqueQuirks.map((quirk, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      <span className="text-base-content/70">{quirk}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-base-content/50">Complete more assessments to discover your quirks</li>
                )}
              </ul>
            </div>
          </div>

          {/* Recommended Genres */}
          <div className="bg-base-100 rounded-xl border border-base-200 p-6">
            <h3 className="text-lg font-bold mb-4">Recommended Genres</h3>
            <div className="flex flex-wrap gap-2">
              {digitalTwin.dossier.recommendedGenres.length > 0 ? (
                digitalTwin.dossier.recommendedGenres.map((genre, i) => (
                  <span key={i} className="badge badge-lg badge-outline">{genre}</span>
                ))
              ) : (
                <span className="text-base-content/50">Complete more assessments to get genre recommendations</span>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "system-prompt" && (
        <div className="bg-base-100 rounded-xl border border-base-200">
          <div className="flex items-center justify-between p-4 border-b border-base-200">
            <div>
              <h3 className="font-bold">AI System Prompt</h3>
              <p className="text-sm text-base-content/60">Use this prompt with any AI to write in your voice</p>
            </div>
            <button
              onClick={copySystemPrompt}
              className={`btn btn-sm ${copySuccess ? "btn-success" : "btn-primary"}`}
            >
              {copySuccess ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Prompt
                </>
              )}
            </button>
          </div>
          <div className="p-4 max-h-[600px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono text-base-content/80 bg-base-200 rounded-lg p-4">
              {digitalTwin.systemPrompt}
            </pre>
          </div>
        </div>
      )}

      {activeTab === "tone" && (
        <div className="bg-base-100 rounded-xl border border-base-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Your Tone Profile</h3>
            <p className="text-base-content/60">
              These values represent your natural communication tendencies across different dimensions.
              They are used to calibrate AI writing to match your authentic voice.
            </p>
          </div>
          <ToneProfileDisplay profile={digitalTwin.toneProfile} />
          <div className="mt-8 p-4 bg-base-200 rounded-lg">
            <h4 className="font-bold mb-2">Understanding Your Profile</h4>
            <ul className="text-sm text-base-content/70 space-y-1">
              <li><strong>Formality:</strong> 0 = casual, conversational | 100 = formal, academic</li>
              <li><strong>Warmth:</strong> 0 = professional distance | 100 = warm, personal</li>
              <li><strong>Humor:</strong> 0 = serious tone | 100 = playful, witty</li>
              <li><strong>Authority:</strong> 0 = peer-level | 100 = commanding expert</li>
              <li><strong>Empathy:</strong> 0 = objective, analytical | 100 = deeply empathetic</li>
              <li><strong>Directness:</strong> 0 = indirect, diplomatic | 100 = direct, assertive</li>
              <li><strong>Complexity:</strong> 0 = simple, accessible | 100 = sophisticated, nuanced</li>
              <li><strong>Creativity:</strong> 0 = conventional | 100 = highly creative</li>
              <li><strong>Emotionality:</strong> 0 = reserved | 100 = emotionally expressive</li>
              <li><strong>Assertiveness:</strong> 0 = passive, gentle | 100 = strongly assertive</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === "styles" && (
        <div className="space-y-6">
          <div className="bg-base-100 rounded-xl border border-base-200 p-6">
            <h3 className="text-lg font-bold mb-2">Recommended Author Styles</h3>
            <p className="text-base-content/60 mb-6">
              Based on your psychometric profile, these author styles align with your natural voice and tendencies.
              You can use these as starting points and customize them to your preferences.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {digitalTwin.recommendedStyleIds.map((styleId) => (
                <div key={styleId} className="bg-base-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold capitalize">{styleId.replace(/_/g, " ")}</h4>
                      <p className="text-sm text-base-content/60">Style match based on your profile</p>
                    </div>
                    <Link
                      href={`/dashboard/styles?highlight=${styleId}`}
                      className="btn btn-sm btn-primary"
                    >
                      View Style
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-1">Digital Twin vs. Author Styles</h3>
                <p className="text-sm text-base-content/70">
                  Your Digital Twin captures YOUR unique voice. Author Styles emulate famous writers.
                  Use your Digital Twin for authentic content, or blend it with a style for creative fusion.
                </p>
              </div>
              <Link href="/dashboard/styles" className="btn btn-primary">
                Browse All Styles
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
