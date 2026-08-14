"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "./styles.module.css";

type PackageStatusResponse = {
  package_id: number;
  slug: string;
  driver_number: string | null;
  status: string;
  status_updated_at: string;
  is_active: boolean;
  is_collected: boolean;
  collected_at: string | null;
  is_cancelled: boolean;
  cancelled_at: string | null;
  is_delivered: boolean;
  delivered_at: string | null;
};

const DEFAULT_API_BASE = "https://movobackend01-ccehf3gqbedmg6ax.southafricanorth-01.azurewebsites.net";
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE).replace(/\/+$/, "");
const TRACKING_PATHS = ["/api/intracity/package-status/"];
const TRACKING_QUERY_KEYS = ["package_slug"];

const STATUS_STEPS = ["Pending", "Collected", "In Transit", "Delivered"] as const;

function normalizeStatus(status: string): string {
  return status.trim().toLowerCase();
}

function getErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as Record<string, unknown>;
  const message = candidate.error ?? candidate.detail ?? candidate.message;
  return typeof message === "string" && message.trim().length > 0 ? message : null;
}

function isPackageStatusResponse(payload: unknown): payload is PackageStatusResponse {
  return !!payload && typeof payload === "object" && "status" in payload;
}

function inferStepIndex(data: PackageStatusResponse): number {
  if (data.is_cancelled) {
    return 0;
  }

  if (data.is_delivered) {
    return 3;
  }

  const normalized = normalizeStatus(data.status);

  if (normalized.includes("deliver")) {
    return 3;
  }

  if (normalized.includes("transit") || normalized.includes("dispatch")) {
    return 2;
  }

  if (data.is_collected) {
    return 1;
  }

  if (normalized.includes("collect")) {
    return 1;
  }

  return 0;
}

export default function PackageTracker() {
  const [packageSlug, setPackageSlug] = useState("mov-da3a87cf5499");
  const [trackingData, setTrackingData] = useState<PackageStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeStepIndex = useMemo(() => {
    if (!trackingData) {
      return 0;
    }

    return inferStepIndex(trackingData);
  }, [trackingData]);

  const statusLabel = trackingData?.is_cancelled ? "Cancelled" : trackingData?.status ?? "Not tracked yet";

  const statusUpdatedAt = trackingData?.status_updated_at
    ? new Date(trackingData.status_updated_at).toLocaleString()
    : "-";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedSlug = packageSlug.trim();
    if (!trimmedSlug) {
      setError("Please enter a package code.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchRequests = TRACKING_PATHS.flatMap((path) =>
        TRACKING_QUERY_KEYS.map((queryKey) => `${API_BASE}${path}?${queryKey}=${encodeURIComponent(trimmedSlug)}`)
      );

      let lastError = "Failed to track package. Check the package code and try again.";

      for (const url of searchRequests) {
        let response: Response;
        try {
          response = await fetch(url, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          });
        } catch {
          // Try next candidate endpoint/parameter if the current one is unreachable.
          continue;
        }

        console.log("Tracking request to:", url, "Response status:", response.status);

        const payload = await response.json().catch(() => null);

        if (response.ok) {
          if (isPackageStatusResponse(payload)) {
            setTrackingData(payload);
            return;
          }

          // Some endpoints wrap response body in a data object.
          if (
            payload &&
            typeof payload === "object" &&
            "data" in payload &&
            isPackageStatusResponse((payload as { data?: unknown }).data)
          ) {
            setTrackingData((payload as { data: PackageStatusResponse }).data);
            return;
          }

          lastError = "Unexpected tracking response from server.";
          continue;
        }

        const apiError = getErrorMessage(payload);
        if (apiError) {
          lastError = apiError;
        }
      }

      throw new Error(lastError);
    } catch (fetchError) {
      setTrackingData(null);
      setError(fetchError instanceof Error ? fetchError.message : "Could not fetch package status.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.trackerCard}>
      <h3 className={styles.trackerHeading}>Track a package</h3>
      <p className={styles.trackerSubcopy}>
        Enter your package code to view the latest status.
      </p>

      <form className={styles.trackerForm} onSubmit={handleSubmit}>
        <label htmlFor="packageSlug" className={styles.trackerLabel}>
          Package code
        </label>
        <div className={styles.trackerInputRow}>
          <input
            id="packageSlug"
            type="text"
            value={packageSlug}
            onChange={(event) => setPackageSlug(event.target.value)}
            placeholder="e.g. mov-da3a87cf5499"
            className={styles.trackerInput}
            autoComplete="off"
          />
          <button type="submit" className={styles.trackerButton} disabled={isLoading}>
            {isLoading ? "Tracking..." : "Track"}
          </button>
        </div>
      </form>

      {error ? <p className={styles.trackerError}>{error}</p> : null}

      <div className={styles.trackerMeta} aria-live="polite">
        <p>
          <strong>Status:</strong> {statusLabel}
        </p>
        <p>
          <strong>Package ID:</strong> {trackingData?.package_id ?? "-"}
        </p>
        <p>
          <strong>Last update:</strong> {statusUpdatedAt}
        </p>
      </div>

      <div className={styles.statusRail} role="img" aria-label="Animated package status progression">
        {STATUS_STEPS.map((step, index) => {
          const stepState = index < activeStepIndex ? "done" : index === activeStepIndex ? "active" : "upcoming";

          return (
            <div
              key={step}
              className={`${styles.statusStep} ${styles[`statusStep${stepState[0].toUpperCase()}${stepState.slice(1)}`]}`}
            >
              <span className={styles.statusStepDot} aria-hidden="true" />
              <span className={styles.statusStepText}>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}