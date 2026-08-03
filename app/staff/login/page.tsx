
"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import styles from "./styles.module.css"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

export default function StaffLogin() {
	const router = useRouter()
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		setIsSubmitting(true)

		try {
			const response = await fetch(`${API_BASE}/api/users/login/`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			})

			const data = await response.json().catch(() => null)

			if (!response.ok) {
				const message = data?.detail || data?.error || "Wrong username or password."
				setError(message)
				setIsSubmitting(false)
				return
            }

            const accessToken = data?.access
            const refreshToken = data?.refresh
            

            if (!accessToken || !refreshToken) {
                setError("Incorrect Credentials. Please try again.")
                return
            }

            if (typeof window !== "undefined") {
                window.sessionStorage.setItem("velori_access_token", accessToken)
                window.sessionStorage.setItem("velori_refresh_token", refreshToken)
				window.sessionStorage.setItem("velori_staff_name", username)
            }

			setUsername("")
			setPassword("")
			setError(null)
			router.push("/staff")
		} catch (fetchError) {
			setError("Connection Failed. Please check your network.")
		} finally {
			setIsSubmitting(false)
		}
    }
	

	return (
		<main className={styles.container}>
			<div className={styles.cardWrapper}>
				<div className={styles.brand}>
					<Image src="/movo-logo.svg" alt="MOVO" width={180} height={44} className={styles.brandLogo} priority />
				</div>

				<form className={styles.card} onSubmit={handleSubmit} aria-labelledby="login-heading">
					<h1 id="login-heading" className={styles.title}>Staff Login</h1>

					<label className={styles.field} htmlFor="username">
						<span className={styles.labelText}>Username</span>
						<input
							id="username"
							className={styles.input}
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							autoComplete="username"
							disabled={isSubmitting}
						/>
					</label>

					<label className={styles.field} htmlFor="password">
						<span className={styles.labelText}>Password</span>
						<input
							id="password"
							className={styles.input}
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							autoComplete="current-password"
							disabled={isSubmitting}
						/>
					</label>

					{error ? (
						<div className={styles.errorMessage} role="alert" aria-live="polite">
							{error}
						</div>
					) : null}

					<button className={styles.button} type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Signing in..." : "Sign in"}
					</button>
				</form>
			</div>
		</main>
	)
}

