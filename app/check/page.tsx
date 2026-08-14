"use client"

import React, { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import styles from "./styles.module.css"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

type PackageDetails = {
	package_id: number
	slug: string
	initiator_id: number
	sender_id: number
	sender_name: string
	sender_phone: string
	receiver_id: number
	receiver_name: string
	receiver_phone: string
	pickup_address: string
	dropoff_address: string
	city: string
	comments: string | null
	is_fast_delivery: boolean
	package_created_at: string
	driver_name: string | null
	driver_number: string | null
	invoice_amount: string
	invoice_amount_zig: string
	is_collected: boolean
	collected_at: string | null
	is_cancelled: boolean
	cancelled_at: string | null
	is_delivered: boolean
	delivered_at: string | null
}

type Step = "digits" | "otp" | "details"

function formatDate(value: string | null) {
	if (!value) return "-"
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return "-"
	return date.toLocaleString()
}

function getStatus(data: PackageDetails): { label: string; className: string } {
	if (data.is_cancelled) return { label: "Cancelled", className: styles.statusCancelled }
	if (data.is_delivered) return { label: "Delivered", className: styles.statusDelivered }
	if (data.is_collected) return { label: "In Transit", className: styles.statusCollected }
	return { label: "Pending", className: styles.statusPending }
}

function getInitiatorMessage(data: PackageDetails, statusLabel: string): string | null {
	if (statusLabel !== "Pending" && statusLabel !== "In Transit") return null

	const initiatorId = String(data.initiator_id)

	if (initiatorId === String(data.sender_id)) {
		return `${data.sender_name} sent you a package. Please be prepared to receive it.`
	}

	if (initiatorId === String(data.receiver_id)) {
		return `${data.receiver_name} has ordered a package to be collected from you. Please prepare the package for collection.`
	}

	return null
}

function CheckPageContent() {
	const searchParams = useSearchParams()
	const packageId = searchParams.get("p")

	const [step, setStep] = useState<Step>("digits")
	const [lastDigits, setLastDigits] = useState("")
	const [otp, setOtp] = useState("")
	const [phoneNumber, setPhoneNumber] = useState<string | null>(null)
	const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [info, setInfo] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [resendCooldown, setResendCooldown] = useState(0)

	useEffect(() => {
		if (resendCooldown <= 0) return

		const timer = window.setInterval(() => {
			setResendCooldown((seconds) => Math.max(seconds - 1, 0))
		}, 1000)

		return () => window.clearInterval(timer)
	}, [resendCooldown])

	async function sendOtp(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		setInfo(null)
		setIsSubmitting(true)

		try {
			const response = await fetch(`${API_BASE}/api/intracity/sender-receiver-login/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ package_id: Number(packageId), last_digits: lastDigits }),
			})

			const data = await response.json().catch(() => null)

			if (!response.ok) {
				setError(data?.detail || data?.error || "Could not send OTP for this package.")
				return
			}

			setPhoneNumber(data?.phone_number ?? null)
			setInfo("An OTP has been sent to your phone number.")
			setResendCooldown(30)
			setStep("otp")
		} catch {
			setError("Connection failed. Please check your network.")
		} finally {
			setIsSubmitting(false)
		}
	}

	async function verifyOtp(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		setIsSubmitting(true)

		try {
			const response = await fetch(`${API_BASE}/api/users/register-login/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ otp_code: otp, phone_number: phoneNumber }),
			})

			const data = await response.json().catch(() => null)

			if (!response.ok) {
				setError(data?.detail || data?.error || "Incorrect OTP. Please try again.")
				return
			}

			const token = data?.access
			if (!token) {
				setError("Login failed. Please try again.")
				return
			}

			await fetchPackage(token)
		} catch {
			setError("Connection failed. Please check your network.")
		} finally {
			setIsSubmitting(false)
		}
	}

	async function fetchPackage(token: string) {
		if (!packageId) {
			setError("Missing package id in the link.")
			return
		}

		try {
			const response = await fetch(
				`${API_BASE}/api/intracity/package/?package_id=${encodeURIComponent(packageId)}`,
				{
					method: "GET",
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			)

			const data = await response.json().catch(() => null)

			if (!response.ok) {
				setError(data?.detail || data?.error || "Could not find that package.")
				return
			}

			setPackageDetails(data)
			setStep("details")
		} catch {
			setError("Connection failed. Please check your network.")
		}
	}

	if (!packageId && step !== "details") {
		return (
			<main className={styles.container}>
				<div className={styles.cardWrapper}>
					<div className={styles.card}>
						<h1 className={styles.title}>Package not found</h1>
						<p className={styles.subtitle}>This link is missing a package id. Please use the link sent to you.</p>
					</div>
				</div>
			</main>
		)
	}

	return (
		<main className={styles.container}>
			<div className={styles.cardWrapper}>
				<div className={styles.brand}>
					<Image src="/movo-logo.svg" alt="MOVO" width={180} height={44} className={styles.brandLogo} priority />
				</div>

				<div className={styles.card}>
					{step === "digits" ? (
						<form onSubmit={sendOtp} aria-labelledby="digits-heading">
							<h1 id="digits-heading" className={styles.title}>Check your package</h1>
							<p className={styles.subtitle}>Enter the last 4 digits of the phone number on file for this package.</p>

							<label className={styles.field} htmlFor="lastDigits">
								<span className={styles.labelText}>Last 4 digits of phone number</span>
								<input
									id="lastDigits"
									className={styles.input}
									type="text"
									inputMode="numeric"
									maxLength={4}
									pattern="[0-9]{4}"
									value={lastDigits}
									onChange={(e) => setLastDigits(e.target.value.replace(/\D/g, "").slice(0, 4))}
									required
									disabled={isSubmitting}
								/>
							</label>

							{error ? (
								<div className={styles.errorMessage} role="alert" aria-live="polite">
									{error}
								</div>
							) : null}

							<button className={styles.button} type="submit" disabled={isSubmitting || lastDigits.length !== 4}>
								{isSubmitting ? "Sending..." : "Send OTP"}
							</button>
						</form>
					) : null}

					{step === "otp" ? (
						<form onSubmit={verifyOtp} aria-labelledby="otp-heading">
							<h1 id="otp-heading" className={styles.title}>Enter OTP</h1>
							<p className={styles.subtitle}>Enter the code sent to the phone number on file for this package.</p>

							<label className={styles.field} htmlFor="otp">
								<span className={styles.labelText}>OTP code</span>
								<input
									id="otp"
									className={styles.input}
									type="text"
									inputMode="numeric"
									value={otp}
									onChange={(e) => setOtp(e.target.value)}
									required
									autoComplete="one-time-code"
									disabled={isSubmitting}
								/>
							</label>

							{info ? <div className={styles.infoMessage}>{info}</div> : null}
							{error ? (
								<div className={styles.errorMessage} role="alert" aria-live="polite">
									{error}
								</div>
							) : null}

							<button className={styles.button} type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Verifying..." : "Verify & View Package"}
							</button>

							<button
								type="button"
								className={styles.linkButton}
								disabled={isSubmitting || resendCooldown > 0}
								onClick={() => {
									setOtp("")
									setError(null)
									setStep("digits")
								}}
							>
								{resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
							</button>
						</form>
					) : null}

					{step === "details" && packageDetails ? (
						<div className={styles.detailsCard}>
							<div className={styles.detailsLogoRow}>
								<Image src="/movo_logo.png" alt="MOVO" width={140} height={40} className={styles.detailsLogo} />
							</div>

							<Link href="/" className={styles.homeButton}>
								Home
							</Link>

							<Link href="/" className={styles.getAppButton}>
								Get the MOVO App
							</Link>

							<h1 className={styles.title}>Package #{packageDetails.package_id}</h1>
							<p className={styles.subtitle}>{packageDetails.slug}</p>

							{(() => {
								const status = getStatus(packageDetails)
								const initiatorMessage = getInitiatorMessage(packageDetails, status.label)
								return (
									<>
										{initiatorMessage ? <div className={styles.infoMessage}>{initiatorMessage}</div> : null}
										<span className={`${styles.statusBadge} ${status.className}`}>{status.label}</span>
									</>
								)
							})()}

							<div className={styles.detailsGrid}>
								<div className={styles.detailRow}>
									<span className={styles.detailLabel}>Sender</span>
									<span className={styles.detailValue}>{packageDetails.sender_name}</span>
								</div>
								<div className={styles.detailRow}>
									<span className={styles.detailLabel}>Sender phone</span>
									<span className={styles.detailValue}>0{packageDetails.sender_phone}</span>
								</div>
								<div className={styles.detailRow}>
									<span className={styles.detailLabel}>Receiver</span>
									<span className={styles.detailValue}>{packageDetails.receiver_name}</span>
								</div>
								<div className={styles.detailRow}>
									<span className={styles.detailLabel}>Receiver phone</span>
									<span className={styles.detailValue}>0{packageDetails.receiver_phone}</span>
								</div>
								<div className={styles.detailRow}>
									<span className={styles.detailLabel}>Pickup address</span>
									<span className={styles.detailValue}>{packageDetails.pickup_address}</span>
								</div>
								<div className={styles.detailRow}>
									<span className={styles.detailLabel}>Dropoff address</span>
									<span className={styles.detailValue}>{packageDetails.dropoff_address}</span>
								</div>
								<div className={styles.detailRow}>
									<span className={styles.detailLabel}>City</span>
									<span className={styles.detailValue}>{packageDetails.city}</span>
								</div>
								<div className={styles.detailRow}>
									<span className={styles.detailLabel}>Fast delivery</span>
									<span className={styles.detailValue}>{packageDetails.is_fast_delivery ? "Yes" : "No"}</span>
								</div>
								<div className={styles.detailRow}>
									<span className={styles.detailLabel}>Driver</span>
									<span className={styles.detailValue}>{packageDetails.driver_name || "Not assigned"}</span>
								</div>
								<div className={styles.detailRow}>
									<span className={styles.detailLabel}>Invoice amount</span>
									<span className={styles.detailValue}>
										${packageDetails.invoice_amount} (ZiG {packageDetails.invoice_amount_zig})
									</span>
								</div>
								<div className={styles.detailRow}>
									<span className={styles.detailLabel}>Created</span>
									<span className={styles.detailValue}>{formatDate(packageDetails.package_created_at)}</span>
								</div>
								<div className={styles.detailRow}>
									<span className={styles.detailLabel}>Delivered</span>
									<span className={styles.detailValue}>{formatDate(packageDetails.delivered_at)}</span>
								</div>
							</div>

							{packageDetails.comments ? (
								<div className={styles.comments}>
									<strong>Comments:</strong> {packageDetails.comments}
								</div>
							) : null}
						</div>
					) : null}
				</div>
			</div>
		</main>
	)
}

export default function CheckPage() {
	return (
		<Suspense fallback={null}>
			<CheckPageContent />
		</Suspense>
	)
}
