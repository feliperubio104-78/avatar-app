"use client";

import { useState, useEffect } from "react";

const steps = [
  "Analizando tu nicho específico…",
  "Detectando el problema crítico real…",
  "Refinando tu diferenciación estratégica…",
  "Construyendo posicionamiento profesional…",
  "Generando mensaje de autoridad…",
];

export default function NuevaArquitecturaPage() {
  const [niche, setNiche] = useState("");
  const [problem, setProblem] = useState("");
  const [outcome, setOutcome] = useState("");
  const [differentiator, setDifferentiator] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setStepIndex((prev) =>
        prev < steps.length - 1 ? prev + 1 : prev
      );
    }, 800);

    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async () => {
    if (loading) return;

    if (!niche || !problem || !outcome || !differentiator) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);
    setError(null);
    setStepIndex(0);

    try {
      const res = await fetch("/api/ai/arquitectura", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          niche,
          problem,
          outcome,
          differentiator,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          window.location.href = "/dashboard?upgrade=1";
          return;
        }

        setError(json?.error ?? "Error generando arquitectura");
        setLoading(false);
        return;
      }

      // Redirección elegante
      setTimeout(() => {
        window.location.href = `/arquitectura/${json.id}`;
      }, 1200);

    } catch (err) {
      console.error(err);
      setError("Error inesperado");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          padding: 40,
        }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>
          Construyendo tu Arquitectura Estratégica
        </h1>

        <p
          style={{
            marginTop: 20,
            fontSize: 16,
            color: "#374151",
          }}
        >
          {steps[stepIndex]}
        </p>

        <div style={spinnerStyle} />
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 880, margin: "40px auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>
        Nueva Arquitectura Estratégica
      </h1>

      <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
        <input
          placeholder="¿A quién ayudas?"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="¿Qué problema urgente resuelves?"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="¿Qué resultado concreto prometes?"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="¿Qué te diferencia?"
          value={differentiator}
          onChange={(e) => setDifferentiator(e.target.value)}
          style={inputStyle}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: "12px 18px",
          borderRadius: 8,
          border: "none",
          background: loading ? "#9ca3af" : "black",
          color: "white",
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        Construir Arquitectura
      </button>

      {error && (
        <div style={{ marginTop: 16, color: "crimson" }}>
          {error}
        </div>
      )}
    </main>
  );
}

const spinnerStyle = {
  marginTop: 30,
  width: 60,
  height: 60,
  borderRadius: "50%",
  border: "4px solid #e5e7eb",
  borderTop: "4px solid black",
  animation: "spin 1s linear infinite",
};

const inputStyle = {
  padding: 12,
  borderRadius: 8,
  border: "1px solid #e5e7eb",
};