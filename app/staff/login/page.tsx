
"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./styles.module.css"

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
			const response = await fetch("http://127.0.0.1:8000/api/users/login/", {
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
            }

            const accessToken = data?.access
            const refreshToken = data?.refresh
            

            if (!accessToken || !refreshToken) {
                setError("Login succeeded but tokens were not returned.")
                return
            }

            if (typeof window !== "undefined") {
                window.sessionStorage.setItem("velori_access_token", accessToken)
                window.sessionStorage.setItem("velori_refresh_token", refreshToken)
            }

			setUsername("")
			setPassword("")
			setError(null)
			router.push("/staff")
		} catch (fetchError) {
			setError("Unable to connect to the login server. Please check your network.")
		} finally {
			setIsSubmitting(false)
		}
    }
	

	return (
		<main className={styles.container}>
			<div className={styles.cardWrapper}>
				<div className={styles.brand}>VELORI</div>

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

