'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './styles.module.css'
import staffStyles from '../styles.module.css'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'

interface PackageDetails {
  receiver_name: string
  package_code: string
  sender_phone: string
  receiver_phone: string
  is_pay_forward: boolean
  amount_usd: number
  amount_zwl: number
  payment_method: 'cash' | 'ecocash'
  currency: 'usd' | 'zwl'
}

interface PaymentData {
  payment_method: 'cash' | 'ecocash'
  currency: 'usd' | 'zwl'
}

export default function DispatchPackage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [receiverCode, setReceiverCode] = useState('')
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null)
  const [payment, setPayment] = useState<PaymentData>({
    payment_method: 'cash',
    currency: 'usd',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [paymentPhone, setPaymentPhone] = useState<string>('')
  const [paymentRequestId, setPaymentRequestId] = useState<string | null>(null)
  const [paymentRequestStatus, setPaymentRequestStatus] = useState<string | null>(null)
  const [cashReceived, setCashReceived] = useState(false)

  const handleSearchPackage = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const token = typeof window !== 'undefined' ? window.sessionStorage.getItem('velori_access_token') : null
    if (!token) {
      setLoading(false)
      setError('Not authenticated — please sign in.')
      router.push('/staff/login')
      return
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/dispatch-package/?receiver_code=${receiverCode}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Package not found')
      }

      const data = await response.json()
      setPackageDetails(data)
      setPayment({
        payment_method: data.payment_method || 'cash',
        currency: data.currency || 'usd',
      })
      setPaymentPhone(data.receiver_phone || '')
      
      // If pay forward, go to payment step; otherwise go straight to collection
      if (data.is_pay_forward) {
        setStep(2)
      } else {
        setSuccess('Package ready for collection')
        setTimeout(() => {
          setStep(1)
          setReceiverCode('')
          setPackageDetails(null)
          setSuccess('')
        }, 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search package')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentChange = (field: keyof PaymentData, value: any) => {
    setPayment(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const requestPayment = async () => {
    setError('')
    setPaymentRequestStatus(null)
    const token = typeof window !== 'undefined' ? window.sessionStorage.getItem('velori_access_token') : null
    if (!token) {
      setError('Not authenticated — please sign in.')
      router.push('/staff/login')
      return
    }
    if (!packageDetails) {
      setError('No package loaded')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/request-payment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          package_code: packageDetails.package_code,
          amount: payment.payment_method === 'ecocash' ? (packageDetails.amount_zwl ?? packageDetails.amount_usd) : packageDetails.amount_usd,
          method: payment.payment_method,
          phone_number: paymentPhone,
          currency: payment.payment_method === 'ecocash' ? 'zwl' : 'usd',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to request payment')
      setPaymentRequestId(data.external_id)
      setPaymentRequestStatus(data.status)
      setSuccess('Payment request sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request payment')
    } finally {
      setLoading(false)
    }
  }

  const checkPayment = async () => {
    setError('')
    if (!paymentRequestId) {
      setError('No payment request to check')
      return
    }
    const token = typeof window !== 'undefined' ? window.sessionStorage.getItem('velori_access_token') : null
    if (!token) {
      setError('Not authenticated — please sign in.')
      router.push('/staff/login')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/check-payment/?external_id=${paymentRequestId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to check payment')
      setPaymentRequestStatus(data.status)
      if (data.status === 'paid') setSuccess('Payment received')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check payment')
    } finally {
      setLoading(false)
    }
  }

  const markCashReceived = () => {
    setCashReceived(true)
    setSuccess('Cash received - ready for collection')
  }

  const handleCollectionComplete = async () => {
    setLoading(true)
    setError('')
    const token = typeof window !== 'undefined' ? window.sessionStorage.getItem('velori_access_token') : null
    if (!token) {
      setLoading(false)
      setError('Not authenticated — please sign in.')
      router.push('/staff/login')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/api/dispatch-package/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver_code: receiverCode,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to complete collection')
      }

      const data = await response.json()
      setSuccess(`Package collected successfully! ID: ${data.package_name}`)
      
      setTimeout(() => {
        setStep(1)
        setReceiverCode('')
        setPackageDetails(null)
        setSuccess('')
        setCashReceived(false)
        setPaymentRequestId(null)
        setPaymentRequestStatus(null)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete collection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <aside className={staffStyles.sidebar}>
        <div className={staffStyles.logo}>VELORI</div>
        <p className={staffStyles.subtext}>Reliable & Efficient</p>

        <nav className={staffStyles.nav} aria-label="Staff navigation">
          <Link href="/staff" className={staffStyles.navItem} aria-current="page">
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
        </nav>

        <div className={staffStyles.footerLinks}>
          <Link href="#settings" className={staffStyles.footerLink}>Settings</Link>
          <Link href="/staff/login" className={staffStyles.footerLink}>Logout</Link>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Dispatch Package</h1>
          <div className={styles.stepIndicator}>
            <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>1</div>
            <div className={`${styles.stepLine} ${step > 1 ? styles.active : ''}`}></div>
            <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>2</div>
          </div>
          <p className={styles.stepLabel}>
            {step === 1 && 'Enter Receiver Code'}
            {step === 2 && 'Process Payment (if required)'}
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        {/* Step 1: Receiver Code Search */}
        {step === 1 && (
          <form onSubmit={handleSearchPackage} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="receiverCode">Receiver OTP Code</label>
              <input
                id="receiverCode"
                type="text"
                placeholder="Enter receiver code"
                value={receiverCode}
                onChange={e => setReceiverCode(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Searching...' : 'Search Package'}
            </button>
          </form>
        )}

        {/* Step 2: Payment Processing (if pay forward) */}
        {step === 2 && packageDetails && (
          <div className={styles.container2}>
            <form onSubmit={e => { e.preventDefault(); handleCollectionComplete() }} className={styles.form}>
              <div className={styles.detailsSection}>
                <h2>Package Details</h2>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Receiver Name:</span>
                    <span className={styles.value}>{packageDetails.receiver_name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Pre-Package Code:</span>
                    <span className={styles.value}>{packageDetails.package_code}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Sender Phone:</span>
                    <span className={styles.value}>{packageDetails.sender_phone}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Receiver Phone:</span>
                    <span className={styles.value}>{packageDetails.receiver_phone}</span>
                  </div>
                </div>
              </div>

              {packageDetails.is_pay_forward && (
                <div className={styles.paymentSection}>
                  <h2>Payment Information</h2>

                  {(packageDetails.amount_usd !== null || packageDetails.amount_zwl !== null) && (
                    <div style={{marginBottom: 12}}>
                      {packageDetails.amount_usd !== null && (
                        <div className={styles.priceBig}>
                          {packageDetails.amount_usd} USD
                        </div>
                      )}
                      {packageDetails.amount_zwl !== null && (
                        <div className={styles.priceBig}>
                          {packageDetails.amount_zwl} ZWL
                        </div>
                      )}
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label htmlFor="currency">Currency</label>
                    <select
                      id="currency"
                      value={payment.currency}
                      onChange={e => handlePaymentChange('currency', e.target.value)}
                    >
                      <option value="usd">USD ($)</option>
                      <option value="zwl">ZWL (ZWL$)</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="paymentMethod">Payment Method</label>
                    <select
                      id="paymentMethod"
                      value={payment.payment_method}
                      onChange={e => handlePaymentChange('payment_method', e.target.value)}
                    >
                      <option value="cash">Cash</option>
                      <option value="ecocash">EcoCash</option>
                    </select>
                  </div>

                  {payment.payment_method === 'ecocash' && (
                    <div className={styles.formGroup}>
                      <label htmlFor="ecocashPhone">EcoCash Phone Number</label>
                      <input
                        id="ecocashPhone"
                        type="tel"
                        value={paymentPhone}
                        onChange={e => setPaymentPhone(e.target.value)}
                        placeholder={packageDetails?.receiver_phone || ''}
                      />
                      <div style={{display: 'flex', gap: 10, marginTop: 10}}>
                        <button type="button" className={styles.button} onClick={requestPayment} disabled={loading}>
                          Request Payment
                        </button>
                        <button type="button" className={styles.button} onClick={checkPayment} disabled={loading || !paymentRequestId}>
                          Check Payment Status
                        </button>
                      </div>
                      {paymentRequestId && <div style={{marginTop:8}}>Request ID: {paymentRequestId} — Status: {paymentRequestStatus}</div>}
                    </div>
                  )}

                  {payment.payment_method === 'cash' && (
                    <div className={styles.cashSection}>
                      <button type="button" onClick={markCashReceived} className={`${styles.button} ${styles.success}`}>
                        Cash Received
                      </button>
                      {cashReceived && <div style={{marginTop:8}} className={styles.success}>Cash received - ready for collection</div>}
                    </div>
                  )}
                </div>
              )}

              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`${styles.button} ${styles.secondary}`}
                >
                  Back
                </button>
                <button type="submit" disabled={loading || (packageDetails.is_pay_forward && !cashReceived && paymentRequestStatus !== 'paid')} className={`${styles.button} ${styles.success}`}>
                  {loading ? 'Processing...' : 'Complete Collection'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
