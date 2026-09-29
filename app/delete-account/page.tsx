"use client"

import React, { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import styles from "./styles.module.css"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

function DeleteAccountContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleConfirmDelete() {
    if (!token) {
      setError("Missing account token. Please use the deletion link sent to you.")
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE}/api/users/customer/deactivate/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setError(data?.detail || data?.error || "Could not delete your account. Please try again.")
        return
      }

      setSuccess(true)
      setShowConfirm(false)
    } catch {
      setError(`Connection failed. Please check your network. API_BASE: ${API_BASE}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h1>Delete Your Account</h1>
          <Link href="/" className={styles.backLink}>
            Back to Home
          </Link>
        </div>

        {!token ? (
          <div className={`${styles.tokenNotice} ${styles.missing}`}>
            This link is missing your account token. Please use the deletion link sent to your
            email or phone.
          </div>
        ) : null}

        <section className={styles.section}>
          <h2>Account Deletion Request</h2>
          <p>
            You can permanently request the deletion of your Movo account and associated personal
            data.
          </p>
          <p>Before proceeding, please carefully review the information below.</p>
        </section>

        <section className={styles.section}>
          <h2>What Happens When You Delete Your Account?</h2>
          <ul>
            <li>Your profile information will be removed.</li>
            <li>Your login credentials will be deleted.</li>
            <li>Your saved addresses and preferences will be deleted.</li>
            <li>Your active sessions will be terminated.</li>
            <li>You will no longer be able to access the Movo platform using that account.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Data That May Be Retained</h2>
          <p>
            Certain information may be retained after account deletion where required by law,
            regulatory obligations, fraud prevention, dispute resolution, security investigations,
            or legitimate business purposes.
          </p>
          <p>Examples may include:</p>
          <ul>
            <li>Transaction records</li>
            <li>Payment records</li>
            <li>Delivery history</li>
            <li>Customer support communications</li>
            <li>Audit logs</li>
            <li>Security logs</li>
            <li>Records required for tax or accounting purposes</li>
          </ul>
          <p>Retention periods may vary depending on applicable legal requirements.</p>
        </section>

        <section className={styles.section}>
          <h2>Active Deliveries and Transactions</h2>
          <p>Before deleting your account:</p>
          <ul>
            <li>Ensure all deliveries have been completed.</li>
            <li>Resolve any outstanding disputes.</li>
            <li>Verify that no payments are pending.</li>
          </ul>
          <p>Accounts with active deliveries may not be eligible for immediate deletion.</p>
        </section>

        <section className={styles.section}>
          <h2>Deletion Timeline</h2>
          <p>
            Your deletion request may be processed immediately or within a reasonable period
            required to complete verification and data removal procedures.
          </p>
          <p>
            Some backup systems may retain encrypted copies of your information for a limited
            period before permanent removal.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Reversibility</h2>
          <p>Account deletion is permanent.</p>
          <p>Once completed your account cannot be recovered, your profile information cannot be restored.
            and access to historical account information may be permanently lost.
          </p>
          <p>Please ensure you wish to proceed before submitting this request.</p>
        </section>

        <section className={styles.section}>
          <h2>Identity Verification</h2>
          <p>
            To protect your privacy and prevent unauthorized requests, we may verify your identity
            before processing account deletion requests.
          </p>
          <p>Verification may include:</p>
          <ul>
            <li>Login authentication</li>
            <li>Email verification</li>
            <li>Phone number verification</li>
            <li>Additional security checks where necessary</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Third-Party Services</h2>
          <p>Movo may use third-party providers for:</p>
          <ul>
            <li>Payment processing</li>
            <li>Cloud hosting</li>
            <li>Analytics</li>
            <li>Notifications</li>
          </ul>
          <p>
            While we will request deletion of applicable personal data under our control, certain
            records maintained by third parties may be subject to their own legal and regulatory
            requirements.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Impact on Services</h2>
          <p>Deleting your account means you will lose access to:</p>
          <ul>
            <li>Package tracking history</li>
            <li>Delivery history</li>
            <li>Saved recipient information</li>
            <li>Saved addresses</li>
            <li>Account preferences</li>
            <li>Loyalty or rewards information (if applicable)</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Contact Support</h2>
          <p>If you experience issues with account deletion or have questions regarding your data, contact us:</p>
          <table className={styles.table}>
            <tbody>
              <tr>
                <th>Email</th>
                <td>
                  <a href="mailto:support@movo.co.zw">support@movo.co.zw</a>
                </td>
              </tr>
              <tr>
                <th>Website</th>
                <td>
                  <a href="https://movo.co.zw" target="_blank" rel="noopener noreferrer">
                    https://movo.co.zw
                  </a>
                </td>
              </tr>
            <tr>
                <th>Phone</th>
                <td>
                  <a href="tel:+263716633439">+263 716 633 439</a>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className={styles.section}>
          <h2>Privacy Policy</h2>
          <p>
            For information about how we collect, use, store, and protect your personal
            information, please review our{" "}
            <Link href="/privacy-policy">Privacy Policy</Link>.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Consent Statement</h2>
          <p>
            By selecting &quot;Delete My Account&quot; and submitting this request, you acknowledge
            that:
          </p>
          <ul>
            <li>You understand account deletion is permanent.</li>
            <li>You understand some information may be retained where legally required.</li>
            <li>You understand access to your account may not be recoverable after deletion.</li>
            <li>You have reviewed the Privacy Policy.</li>
          </ul>
        </section>

        <div className={styles.actions}>
          {error ? <div className={styles.errorMessage}>{error}</div> : null}
          {success ? (
            <div className={styles.successMessage}>
              Your account deletion request has been submitted successfully.
            </div>
          ) : null}

          {!success && !showConfirm ? (
            <button
              type="button"
              className={styles.deleteButton}
              disabled={!token}
              onClick={() => setShowConfirm(true)}
            >
              Delete My Account
            </button>
          ) : null}

          {!success && showConfirm ? (
            <div className={styles.confirmBox}>
              <p>
                Are you sure you want to permanently delete your account? This action cannot be
                undone.
              </p>
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.confirmDeleteButton}
                  onClick={handleConfirmDelete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Deleting..." : "Yes, Delete My Account"}
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowConfirm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}

export default function DeleteAccountPage() {
  return (
    <Suspense fallback={null}>
      <DeleteAccountContent />
    </Suspense>
  )
}
