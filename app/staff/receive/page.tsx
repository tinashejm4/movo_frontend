'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import styles from './styles.module.css'
import staffStyles from '../styles.module.css'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'

interface PackageDetails {
  package_code: string
  sender_name: string
  sender_phone: string
  receiver_name: string
  receiver_phone: string
  collection_point: string
  collection_point_id: number
  date_added: string
}

interface DimensionData {
  length: string
  width: string
  height: string
  weight: string
  description: string
}

interface PaymentData {
  is_pay_forward: boolean
  payment_method: 'cash' | 'ecocash'
  currency: 'usd' | 'zwl'
}

export default function ReceivePackage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [packageCode, setPackageCode] = useState('')
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null)
  const [dimensions, setDimensions] = useState<DimensionData>({
    length: '',
    width: '',
    height: '',
    weight: '',
    description: '',
  })
  const [payment, setPayment] = useState<PaymentData>({
    is_pay_forward: false,
    payment_method: 'cash',
    currency: 'usd',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [amountUsd, setAmountUsd] = useState<number | null>(null)
  const [amountZwl, setAmountZwl] = useState<number | null>(null)
  const [paymentPhone, setPaymentPhone] = useState<string>('')
  const [paymentRequestId, setPaymentRequestId] = useState<string | null>(null)
  const [paymentRequestStatus, setPaymentRequestStatus] = useState<string | null>(null)
  const [cashReceived, setCashReceived] = useState(false)

  const handleSearchPackage = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // ensure user is authenticated
    const token = typeof window !== 'undefined' ? window.sessionStorage.getItem('velori_access_token') : null
    if (!token) {
      setLoading(false)
      setError('Not authenticated — please sign in.')
      router.push('/staff/login')
      return
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/receive-package/?package_code=${packageCode}`,
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
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search package')
    } finally {
      setLoading(false)
    }
  }

  const handleDimensionsChange = (field: keyof DimensionData, value: string) => {
    setDimensions(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePaymentChange = (field: keyof PaymentData, value: any) => {
    setPayment(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault()

    if (!dimensions.length || !dimensions.width || !dimensions.height || !dimensions.weight) {
      setError('All dimension fields are required')
      return
    }

    setError('')

    // Request backend to compute amount for these dimensions
    const token = typeof window !== 'undefined' ? window.sessionStorage.getItem('velori_access_token') : null
    if (!token) {
      setError('Not authenticated — please sign in.')
      router.push('/staff/login')
      return
    }

    setLoading(true)
    fetch('http://localhost:8000/api/receive-package/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        package_code: packageCode,
        step: 'dimensions',
        length: parseFloat(dimensions.length),
        width: parseFloat(dimensions.width),
        height: parseFloat(dimensions.height),
        weight: parseFloat(dimensions.weight),
        description: dimensions.description,
      }),
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err?.error || 'Failed to validate dimensions')
        }
        return res.json()
      })
      .then(data => {
        setAmountUsd(data.amount_usd ?? null)
        setAmountZwl(data.amount_zwl ?? null)
        // default ecocash phone to receiver phone
        setPaymentPhone(packageDetails?.receiver_phone ?? '')
        setStep(3)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to compute price'))
      .finally(() => setLoading(false))
  }

  const handleFinalize = async (e: React.FormEvent) => {
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
      const response = await fetch(`${API_BASE}/api/receive-package/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          package_code: packageCode,
          step: 'payment',
          length: parseFloat(dimensions.length),
          width: parseFloat(dimensions.width),
          height: parseFloat(dimensions.height),
          weight: parseFloat(dimensions.weight),
          description: dimensions.description,
          is_pay_forward: payment.is_pay_forward,
          payment_method: payment.payment_method,
          currency: payment.currency,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to finalize package')
      }

      const data = await response.json()
      setSuccess(`Package received successfully! ID: ${data.package_name}`)
      
      // Reset form
      setTimeout(() => {
        setStep(1)
        setPackageCode('')
        setPackageDetails(null)
        setDimensions({ length: '', width: '', height: '', weight: '', description: '' })
        setPayment({ is_pay_forward: false, payment_method: 'cash', currency: 'usd' })
        setSuccess('')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to finalize package')
    } finally {
      setLoading(false)
    }
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
    if (!amountUsd) {
      setError('Amount not available')
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
          package_code: packageCode,
          amount: payment.payment_method === 'ecocash' ? (amountZwl ?? amountUsd) : amountUsd,
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
    setSuccess('Cash received')
  }

  return (
    <div className={styles.container}>
      <aside className={staffStyles.sidebar}>
        <div className={staffStyles.logo}>
          <Image src="/movo-logo.svg" alt="MOVO" width={168} height={40} className={staffStyles.logoImage} priority />
        </div>
        <p className={staffStyles.subtext}>Reliable & Efficient</p>

        <nav className={staffStyles.nav} aria-label="Staff navigation">
          <Link href="/staff" className={staffStyles.navItem} >
            <span className={staffStyles.navIcon}>📊</span>
            Dashboard
          </Link>
          <Link href="/staff/receive" className={staffStyles.navItem} aria-current="page">
            <span className={staffStyles.navIcon}>📥</span>
            Receiving
          </Link>
          <Link href="/staff/dispatch" className={staffStyles.navItem}>
            <span className={staffStyles.navIcon}>📦</span>
            Dispatch
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
          <h1>Receive Package</h1>
          <div className={styles.stepIndicator}>
            <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>1</div>
            <div className={`${styles.stepLine} ${step > 1 ? styles.active : ''}`}></div>
            <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>2</div>
            <div className={`${styles.stepLine} ${step > 2 ? styles.active : ''}`}></div>
            <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>3</div>
          </div>
          <p className={styles.stepLabel}>
            {step === 1 && 'Search Package'}
            {step === 2 && 'Enter Package Details'}
            {step === 3 && 'Payment Information'}
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        {/* Step 1: Search Package */}
        {step === 1 && (
          <form onSubmit={handleSearchPackage} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="packageCode">Package Code</label>
              <input
                id="packageCode"
                type="text"
                placeholder="Enter package code (e.g., AB123)"
                value={packageCode}
                onChange={e => setPackageCode(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Searching...' : 'Search Package'}
            </button>
          </form>
        )}

        {/* Step 2: Package Details Display & Dimensions */}
        {step === 2 && packageDetails && (
          <form onSubmit={handleContinueToPayment} className={styles.form}>
            <div className={styles.detailsSection}>
              <h2>Package Details</h2>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Sender Name:</span>
                  <span className={styles.value}>{packageDetails.sender_name}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Sender Phone:</span>
                  <span className={styles.value}>{packageDetails.sender_phone}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Receiver Name:</span>
                  <span className={styles.value}>{packageDetails.receiver_name}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Receiver Phone:</span>
                  <span className={styles.value}>{packageDetails.receiver_phone}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Collection Point:</span>
                  <span className={styles.value}>{packageDetails.collection_point}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Date Added:</span>
                  <span className={styles.value}>
                    {new Date(packageDetails.date_added).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.dimensionsSection}>
              <h2>Package Dimensions</h2>
              <div className={styles.dimensionsGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="length">Length (cm)</label>
                  <input
                    id="length"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={dimensions.length}
                    onChange={e => handleDimensionsChange('length', e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="width">Width (cm)</label>
                  <input
                    id="width"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={dimensions.width}
                    onChange={e => handleDimensionsChange('width', e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="height">Height (cm)</label>
                  <input
                    id="height"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={dimensions.height}
                    onChange={e => handleDimensionsChange('height', e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="weight">Weight (kg)</label>
                  <input
                    id="weight"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={dimensions.weight}
                    onChange={e => handleDimensionsChange('weight', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Package Description</label>
                <textarea
                  id="description"
                  placeholder="Enter a short description of the package contents"
                  value={dimensions.description}
                  onChange={e => handleDimensionsChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`${styles.button} ${styles.secondary}`}
              >
                Back
              </button>
              <button type="submit" disabled={loading} className={styles.button}>
                {loading ? 'Continuing...' : 'Continue to Payment'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Payment Information */}
        {step === 3 && (
          <form onSubmit={handleFinalize} className={styles.form}>
            <div className={styles.paymentSection}>
              <h2>Payment Information</h2>

              {(amountUsd !== null || amountZwl !== null) && (
                <div style={{marginBottom: 12}}>
                  {amountUsd !== null && (
                    <div className={styles.priceBig}>
                      {amountUsd} USD
                    </div>
                  )}
                  {amountZwl !== null && (
                    <div className={styles.priceBig}>
                      {amountZwl} ZWL
                    </div>
                  )}
                </div>
              )}

              <div className={styles.checkboxGroup}>
                <label htmlFor="payForward">
                  <input
                    id="payForward"
                    type="checkbox"
                    checked={payment.is_pay_forward}
                    onChange={e => handlePaymentChange('is_pay_forward', e.target.checked)}
                  />
                  <span>Pay Forward (Receiver pays on collection)</span>
                </label>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  value={payment.currency}
                  onChange={e => handlePaymentChange('currency', e.target.value)}
                  disabled={payment.is_pay_forward}
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
                  disabled={payment.is_pay_forward}
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
                    disabled={payment.is_pay_forward}
                  />
                  <div style={{display: 'flex', gap: 10, marginTop: 10}}>
                    <button type="button" className={styles.button} onClick={requestPayment} disabled={loading || payment.is_pay_forward}>
                      Request Payment
                    </button>
                    <button type="button" className={styles.button} onClick={checkPayment} disabled={loading || payment.is_pay_forward || !paymentRequestId}>
                      Check Payment Status
                    </button>
                  </div>
                  {paymentRequestId && <div style={{marginTop:8}}>Request ID: {paymentRequestId} — Status: {paymentRequestStatus}</div>}
                </div>
              )}

              {payment.payment_method === 'cash' && (
                <div className={styles.cashSection}>
                  <button type="button" onClick={markCashReceived} className={`${styles.button} ${styles.success}`} disabled={payment.is_pay_forward}>
                    Cash Received
                  </button>
                  {cashReceived && <div style={{marginTop:8}} className={styles.success}>Cash received</div>}
                </div>
              )}
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`${styles.button} ${styles.secondary}`}
              >
                Back
              </button>
              <button type="submit" disabled={loading || !payment.is_pay_forward && !cashReceived || !payment.is_pay_forward && paymentRequestStatus === 'success'} className={`${styles.button} ${styles.success}`} >
                {loading ? 'Finalizing...' : 'Save & Finalize'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
