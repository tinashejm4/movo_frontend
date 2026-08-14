'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import staffStyles from '../styles.module.css'
import styles from './styles.module.css'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

type AccountDaySummary = {
  account_id: number
  account_name: string
  currency: string
  date: string
  opening_balance: number
  current_balance: number
  total_expenditure: number
  total_sales: number
  is_closed_for_day: boolean
  end_of_day_balance_id: number | null
}

const fmt = (amount: number, currency: string) => {
  const safe = Number(amount || 0)
  return `${safe.toFixed(2)} ${currency.toUpperCase()}`
}

export default function AccountsPage() {
  const router = useRouter()
  const [rows, setRows] = useState<AccountDaySummary[]>([])
  const [actualAmounts, setActualAmounts] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)
  const [closingAccountId, setClosingAccountId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [staffName, setStaffName] = useState('Staff')
  const [showGoodbye, setShowGoodbye] = useState(false)

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const getToken = () => {
    if (typeof window === 'undefined') return null
    return window.sessionStorage.getItem('velori_access_token')
  }

  const authHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  })

  const clearSessionAndRedirect = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('velori_access_token')
      window.sessionStorage.removeItem('velori_refresh_token')
      window.sessionStorage.removeItem('velori_staff_name')
    }
    router.push('/staff/login')
  }, [router])

  const loadAccounts = async () => {
    const token = getToken()
    if (!token) {
      router.push('/staff/login')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/api/bookkeeping/accounts/daily-summary/?date=${today}`, {
        headers: authHeaders(token),
      })
      if (response.status === 401 || response.status === 403) {
        clearSessionAndRedirect()
        return
      }
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || 'Could not load accounts summary')
      }

      const data = (await response.json()) as AccountDaySummary[]
      setRows(data)
      setActualAmounts((prev) => {
        const next: Record<number, string> = {}
        for (const row of data) {
          next[row.account_id] = prev[row.account_id] ?? String(Number(row.current_balance || 0).toFixed(2))
        }
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts summary')
    } finally {
      setLoading(false)
    }
  }

  const closeDay = async (accountId: number) => {
    const token = getToken()
    if (!token) {
      router.push('/staff/login')
      return
    }

    const entered = (actualAmounts[accountId] ?? '').trim()
    if (!entered) {
      setError('Please enter actual amount before closing the account')
      return
    }

    const parsed = Number(entered)
    if (Number.isNaN(parsed)) {
      setError('Actual amount must be a valid number')
      return
    }

    setClosingAccountId(accountId)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_BASE}/api/bookkeeping/accounts/close-day/`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          account_id: accountId,
          date: today,
          actual_balance: parsed,
        }),
      })

      if (response.status === 401 || response.status === 403) {
        clearSessionAndRedirect()
        return
      }

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to close account for the day')
      }

      setSuccess('Account closed for the day')
      if (data?.user_locked_out || data?.all_closed_for_day) {
        setShowGoodbye(true)
        return
      }
      await loadAccounts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close account')
    } finally {
      setClosingAccountId(null)
    }
  }

  useEffect(() => {
    loadAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedName = window.sessionStorage.getItem('velori_staff_name')
    if (savedName?.trim()) {
      setStaffName(savedName.trim())
      return
    }

    const token = window.sessionStorage.getItem('velori_access_token')
    if (!token) return

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const guessedName = payload?.username || payload?.name || payload?.sub
      if (typeof guessedName === 'string' && guessedName.trim()) {
        setStaffName(guessedName.trim())
      }
    } catch {
      // Ignore malformed token payload; default name remains.
    }
  }, [])

  useEffect(() => {
    if (loading || showGoodbye) return
    if (!rows.length) return

    const allClosed = rows.every((row) => row.is_closed_for_day)
    if (!allClosed) return

    setShowGoodbye(true)
  }, [rows, loading, showGoodbye])

  useEffect(() => {
    if (!showGoodbye) return

    const timer = window.setTimeout(() => {
      clearSessionAndRedirect()
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [showGoodbye, clearSessionAndRedirect])

  return (
    <div className={styles.container}>
      <aside className={staffStyles.sidebar}>
        <div className={staffStyles.logo}>
          <Image src="/movo-logo.png" alt="MOVO" width={168} height={40} className={staffStyles.logoImage} priority />
        </div>
        <p className={staffStyles.subtext}>Reliable & Efficient</p>

        <nav className={staffStyles.nav} aria-label="Staff navigation">
          <Link href="/staff" className={staffStyles.navItem}>
            <span className={staffStyles.navIcon}>📊</span>
            Dashboard
          </Link>
          <Link href="/staff/receive" className={staffStyles.navItem}>
            <span className={staffStyles.navIcon}>📥</span>
            Receiving
          </Link>
          <Link href="/staff/dispatch" className={staffStyles.navItem}>
            <span className={staffStyles.navIcon}>📦</span>
            Dispatch
          </Link>
          <Link href="/staff/batches" className={staffStyles.navItem}>
            <span className={staffStyles.navIcon}>📋</span>
            Batches
          </Link>
          <Link href="/staff/expenses" className={staffStyles.navItem}>
            <span className={staffStyles.navIcon}>🧾</span>
            Expenses
          </Link>
          <Link href="/staff/accounts" className={staffStyles.navItem} aria-current="page">
            <span className={staffStyles.navIcon}>🏦</span>
            Accounts
          </Link>
        </nav>

        <div className={staffStyles.footerLinks}>
          <Link href="#settings" className={staffStyles.footerLink}>Settings</Link>
          <Link href="/staff/login" className={staffStyles.footerLink}>Logout</Link>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <p className={styles.kicker}>Branch Accounts</p>
          <h1>Daily Account Balances</h1>
          <p className={styles.sub}>Date: {today}</p>
        </header>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        {loading && <div className={styles.info}>Loading account balances...</div>}

        {!loading && !rows.length && <div className={styles.info}>No accounts found for this branch.</div>}

        <section className={styles.grid}>
          {rows.map((row) => (
            <article key={row.account_id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>{row.account_name}</h2>
                <span className={styles.currencyBadge}>{row.currency.toUpperCase()}</span>
              </div>

              <div className={styles.metrics}>
                <div className={styles.metricItem}>
                  <span>Opening Balance</span>
                  <strong>{fmt(row.opening_balance, row.currency)}</strong>
                </div>
                <div className={styles.metricItem}>
                  <span>Current Balance</span>
                  <strong>{fmt(row.current_balance, row.currency)}</strong>
                </div>
                <div className={styles.metricItem}>
                  <span>Total Expenditure (Today)</span>
                  <strong>{fmt(row.total_expenditure, row.currency)}</strong>
                </div>
                <div className={styles.metricItem}>
                  <span>Total Sales (Today)</span>
                  <strong>{fmt(row.total_sales, row.currency)}</strong>
                </div>
              </div>

              <div className={styles.inputRow}>
                <label htmlFor={`actual-amount-${row.account_id}`}>Actual Amount</label>
                <input
                  id={`actual-amount-${row.account_id}`}
                  type="number"
                  step="0.01"
                  value={actualAmounts[row.account_id] ?? ''}
                  onChange={(e) =>
                    setActualAmounts((prev) => ({
                      ...prev,
                      [row.account_id]: e.target.value,
                    }))
                  }
                  disabled={row.is_closed_for_day || closingAccountId === row.account_id}
                  placeholder={`Enter amount in ${row.currency.toUpperCase()}`}
                />
              </div>

              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.closeButton}
                  disabled={row.is_closed_for_day || closingAccountId === row.account_id}
                  onClick={() => closeDay(row.account_id)}
                >
                  {row.is_closed_for_day
                    ? 'Closed for Today'
                    : closingAccountId === row.account_id
                    ? 'Closing...'
                    : 'Close Account'}
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>

      {showGoodbye && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="goodbye-title">
            <h2 id="goodbye-title">Good bye, {staffName}.</h2>
            <p>All accounts are closed for today. Logging out...</p>
          </div>
        </div>
      )}
    </div>
  )
}
