'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import staffStyles from '../styles.module.css'
import styles from './styles.module.css'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

type Account = {
  id: number
  name: string
  currency: string
}

type ExpenseType = {
  id: number
  name: string
}

type ExpenseRow = {
  id: number
  account_id: number
  expense_type_id: number
  expense_type: string
  amount: number
  comment: string
  added_by: string | null
  added_at: string
}

type BranchProfile = {
  id: number
  name: string
}

type BatchOption = {
  id: number
  label: string
}

type ModalMode = 'expense' | 'transport'

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function ExpensesPage() {
  const router = useRouter()

  const [branch, setBranch] = useState<BranchProfile | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([])
  const [expenses, setExpenses] = useState<ExpenseRow[]>([])

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const today = useMemo(() => new Date(), [])
  const [fromDate, setFromDate] = useState<string>(toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1)))
  const [toDate, setToDate] = useState<string>(toDateInputValue(today))
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all')
  const [selectedExpenseTypeId, setSelectedExpenseTypeId] = useState<string>('all')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('expense')
  const [newAccountId, setNewAccountId] = useState('')
  const [newExpenseTypeId, setNewExpenseTypeId] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newComment, setNewComment] = useState('')
  const [newBatchId, setNewBatchId] = useState('')
  const [newTransportCategory, setNewTransportCategory] = useState('fuel')
  const [availableBatches, setAvailableBatches] = useState<BatchOption[]>([])
  const [loadingBatches, setLoadingBatches] = useState(false)

  const getToken = () => {
    if (typeof window === 'undefined') return null
    return window.sessionStorage.getItem('velori_access_token')
  }

  const authHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  })

  const fetchBranchProfile = async (token: string) => {
    const response = await fetch(`${API_BASE}/api/users/staff/profile/`, {
      headers: authHeaders(token),
    })
    if (response.status === 404) {
      setBranch({ id: 0, name: 'Current staff branch' })
      return 0
    }
    if (!response.ok) {
      throw new Error('Could not load staff profile for branch mapping')
    }
    const data = await response.json()
    setBranch({ id: data.branch_id, name: data.branch_name })
    return data.branch_id as number
  }

  const fetchAvailableBatches = async (token: string) => {
    setLoadingBatches(true)
    try {
      const response = await fetch(`${API_BASE}/api/bookkeeping/available-batches/`, {
        headers: authHeaders(token),
      })
      if (!response.ok) {
        throw new Error('Could not load available batches')
      }
      const data = (await response.json()) as Array<{ id: number; label: string }>
      setAvailableBatches(data.map((row) => ({ id: row.id, label: row.label })))
      setNewBatchId(data.length ? String(data[0].id) : '')
    } catch (err) {
      setAvailableBatches([])
      setNewBatchId('')
      setError(err instanceof Error ? err.message : 'Failed to load batches')
    } finally {
      setLoadingBatches(false)
    }
  }

  const fetchAccounts = async (token: string, branchId: number) => {
    const response = await fetch(`${API_BASE}/api/bookkeeping/accounts/`, {
      headers: authHeaders(token),
    })
    if (!response.ok) {
      throw new Error('Could not load accounts')
    }
    const data = (await response.json()) as Array<{ id: number; name: string; currency: string }>

    const branchAccounts = data.map((row) => ({
      id: row.id,
      name: row.name,
      currency: row.currency,
    }))

    if (!branchAccounts.length) {
      throw new Error(`No accounts found for branch ${branchId}`)
    }

    setAccounts(branchAccounts)
    if (!newAccountId) {
      setNewAccountId(String(branchAccounts[0].id))
    }
  }

  const fetchExpenseTypes = async (token: string) => {
    const response = await fetch(`${API_BASE}/api/bookkeeping/expense-types/`, {
      headers: authHeaders(token),
    })

    if (!response.ok) {
      throw new Error('Could not load expense types')
    }

    const data = (await response.json()) as ExpenseType[]
    setExpenseTypes(data)
    if (data.length && !newExpenseTypeId) {
      setNewExpenseTypeId(String(data[0].id))
    }
  }

  const loadExpenses = async () => {
    const token = getToken()
    if (!token) {
      router.push('/staff/login')
      return
    }

    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      if (fromDate) params.set('from_date', fromDate)
      if (toDate) params.set('to_date', toDate)
      if (selectedAccountId !== 'all') params.set('account_id', selectedAccountId)

      const response = await fetch(`${API_BASE}/api/bookkeeping/expenses/?${params.toString()}`, {
        headers: authHeaders(token),
      })
      if (!response.ok) {
        throw new Error('Could not load expenses')
      }

      let data = (await response.json()) as ExpenseRow[]
      if (selectedExpenseTypeId !== 'all') {
        data = data.filter((row) => String(row.expense_type_id) === selectedExpenseTypeId)
      }

      setExpenses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  const loadInitialData = async () => {
    const token = getToken()
    if (!token) {
      router.push('/staff/login')
      return
    }

    setLoading(true)
    setError('')

    try {
      const branchId = await fetchBranchProfile(token)
      await fetchAccounts(token, branchId)
      await fetchExpenseTypes(token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize expenses page')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (accounts.length) {
      loadExpenses()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, selectedAccountId, selectedExpenseTypeId, accounts.length])

  const openModal = (mode: ModalMode) => {
    setError('')
    setSuccess('')
    setModalMode(mode)
    setIsModalOpen(true)

    if (mode === 'transport') {
      const token = getToken()
      if (!token) {
        router.push('/staff/login')
        return
      }
      void fetchAvailableBatches(token)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setNewAmount('')
    setNewComment('')
    setNewBatchId('')
    setNewTransportCategory('fuel')
    setAvailableBatches([])
    setModalMode('expense')
  }

  const handleCreateEntry = async (event: React.FormEvent) => {
    event.preventDefault()

    const token = getToken()
    if (!token) {
      router.push('/staff/login')
      return
    }

    if (!newAccountId || !newAmount) {
      setError('Account and amount are required')
      return
    }

    if (modalMode === 'transport' && (!newBatchId || !newTransportCategory.trim())) {
      setError('Batch and transport category are required for transport expenses')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const endpoint =
        modalMode === 'transport'
          ? `${API_BASE}/api/bookkeeping/transport-expenses/`
          : `${API_BASE}/api/bookkeeping/expenses/`

      const payload: Record<string, number | string> = {
        account_id: Number(newAccountId),
        expense_type_id: modalMode === 'transport' ? 1 : Number(newExpenseTypeId),
        amount: Number(newAmount),
        comment: newComment,
      }

      if (modalMode === 'transport') {
        payload.batch_id = Number(newBatchId)
        payload.transport_category = newTransportCategory.trim()
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Could not save expense')
      }

      setSuccess(modalMode === 'transport' ? 'Transport expense saved successfully' : 'Expense saved successfully')
      closeModal()
      await loadExpenses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry')
    } finally {
      setSaving(false)
    }
  }

  const totalFilteredAmount = expenses.reduce((acc, row) => acc + Number(row.amount || 0), 0)

  return (
    <div className={styles.container}>
      <aside className={staffStyles.sidebar}>
        <div className={staffStyles.logo}>
          <Image src="/movo-logo.svg" alt="MOVO" width={168} height={40} className={staffStyles.logoImage} priority />
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
          <Link href="/staff/expenses" className={staffStyles.navItem} aria-current="page">
            <span className={staffStyles.navIcon}>🧾</span>
            Expenses
          </Link>
        </nav>

        <div className={staffStyles.footerLinks}>
          <Link href="#settings" className={staffStyles.footerLink}>Settings</Link>
          <Link href="/staff/login" className={staffStyles.footerLink}>Logout</Link>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Branch Expenses</p>
            <h1>Expense Journal</h1>
            <p className={styles.branchLabel}>{branch ? `Branch: ${branch.name}` : 'Loading branch...'}</p>
          </div>
          <div className={styles.headerActions}>
            <button type="button" className={styles.secondaryButton} onClick={() => openModal('transport')}>
              Add Transport Expense
            </button>
            <button type="button" className={styles.primaryButton} onClick={() => openModal('expense')}>
              Add Expense
            </button>
          </div>
        </header>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <section className={styles.filterCard}>
          <div className={styles.filterGrid}>
            <div className={styles.field}>
              <label htmlFor="fromDate">From Date</label>
              <input id="fromDate" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>

            <div className={styles.field}>
              <label htmlFor="toDate">To Date</label>
              <input id="toDate" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>

            <div className={styles.field}>
              <label htmlFor="account">Account</label>
              <select id="account" value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)}>
                <option value="all">All Accounts</option>
                {accounts.map((account) => (
                  <option key={account.id} value={String(account.id)}>
                    {account.name} ({account.currency})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="expenseType">Expense Type</label>
              <select
                id="expenseType"
                value={selectedExpenseTypeId}
                onChange={(e) => setSelectedExpenseTypeId(e.target.value)}
                disabled={!expenseTypes.length}
              >
                <option value="all">All Types</option>
                {expenseTypes.map((type) => (
                  <option key={type.id} value={String(type.id)}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.summaryRow}>
            <span>{loading ? 'Loading expenses...' : `${expenses.length} record(s)`}</span>
            <strong>Total: {totalFilteredAmount.toFixed(2)}</strong>
          </div>
        </section>

        <section className={styles.tableCard}>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Account</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Comment</th>
                  <th>Added By</th>
                </tr>
              </thead>
              <tbody>
                {!expenses.length && !loading && (
                  <tr>
                    <td colSpan={6} className={styles.emptyCell}>No expenses found for this filter set.</td>
                  </tr>
                )}
                {expenses.map((row) => {
                  const account = accounts.find((item) => item.id === row.account_id)
                  return (
                    <tr key={row.id}>
                      <td>{new Date(row.added_at).toLocaleDateString()}</td>
                      <td>{account ? account.name : `Account #${row.account_id}`}</td>
                      <td>{row.expense_type}</td>
                      <td>{Number(row.amount).toFixed(2)}</td>
                      <td>{row.comment || '-'}</td>
                      <td>{row.added_by || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {isModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="add-expense-title">
            <div className={styles.modalHeader}>
              <h2 id="add-expense-title">{modalMode === 'transport' ? 'Add Transport Expense' : 'Add Expense'}</h2>
              <button type="button" className={styles.closeButton} onClick={closeModal}>Close</button>
            </div>

            <form onSubmit={handleCreateEntry} className={styles.modalForm}>
              <div className={styles.field}>
                <label htmlFor="newAccount">Account</label>
                <select
                  id="newAccount"
                  value={newAccountId}
                  onChange={(e) => setNewAccountId(e.target.value)}
                  required
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={String(account.id)}>
                      {account.name} ({account.currency})
                    </option>
                  ))}
                </select>
              </div>

              {modalMode === 'expense' && (
                <div className={styles.field}>
                  <label htmlFor="newExpenseType">Expense Type</label>
                  <select
                    id="newExpenseType"
                    value={newExpenseTypeId}
                    onChange={(e) => setNewExpenseTypeId(e.target.value)}
                    required
                    disabled={!expenseTypes.length}
                  >
                    {expenseTypes.map((type) => (
                      <option key={type.id} value={String(type.id)}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.field}>
                <label htmlFor="newAmount">Amount</label>
                <input
                  id="newAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              {modalMode === 'transport' && (
                <div className={styles.field}>
                  <label htmlFor="newTransportCategory">Transport Category</label>
                  <select
                    id="newTransportCategory"
                    value={newTransportCategory}
                    onChange={(e) => setNewTransportCategory(e.target.value)}
                    required
                  >
                    <option value="fuel">Fuel</option>
                    <option value="tolls">Tolls</option>
                  </select>
                </div>
              )}

              {modalMode === 'transport' && (
                <div className={styles.field}>
                  <label htmlFor="newBatchId">Batch</label>
                  <select
                    id="newBatchId"
                    value={newBatchId}
                    onChange={(e) => setNewBatchId(e.target.value)}
                    required
                    disabled={loadingBatches || !availableBatches.length}
                  >
                    {!availableBatches.length ? (
                      <option value="">No available batches in this branch</option>
                    ) : (
                      availableBatches.map((batch) => (
                        <option key={batch.id} value={String(batch.id)}>
                          {batch.label}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              <div className={styles.field}>
                <label htmlFor="newComment">Comment</label>
                <textarea
                  id="newComment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Optional note"
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryButton} onClick={closeModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={
                    saving ||
                    (modalMode === 'expense' && !expenseTypes.length) ||
                    (modalMode === 'transport' && (loadingBatches || !availableBatches.length))
                  }
                >
                  {saving
                    ? 'Saving...'
                    : modalMode === 'transport'
                    ? 'Save Transport Expense'
                    : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
