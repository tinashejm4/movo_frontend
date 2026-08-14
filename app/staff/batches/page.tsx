'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import styles from './styles.module.css'
import staffStyles from '../styles.module.css'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'

interface Batch {
  id: number
  sent_from: string
  sent_from_id: number
  sent_to: string
  sent_to_id: number
  is_available: boolean
  added_at: string
  package_count: number
}

interface Package {
  id: number
  package_code: string
  creation_code: string
  sender_name: string
  sender_phone: string
  receiver_name: string
  receiver_phone: string
  amount_usd: number
  amount_zwl: number | null
  payment_method: 'cash' | 'ecocash'
  currency: 'usd' | 'zwl'
  is_collected: boolean
  collected_at: string | null
  description: string
  size: string | null
}

interface BatchDetail extends Batch {
  packages: Package[]
}

export default function BatchesPage() {
  const router = useRouter()
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedBatch, setSelectedBatch] = useState<BatchDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    setLoading(true)
    setError('')

    const token = typeof window !== 'undefined' ? window.sessionStorage.getItem('velori_access_token') : null
    if (!token) {
      setError('Not authenticated — please sign in.')
      router.push('/staff/login')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/api/batches/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch batches')
      }

      const data = await response.json()
      setBatches(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load batches')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectBatch = async (batchId: number) => {
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
      const response = await fetch(`${API_BASE}/api/batches/${batchId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch batch details')
      }

      const data = await response.json()
      setSelectedBatch(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load batch details')
    } finally {
      setLoading(false)
    }
  }

  const filteredBatches = batches.filter(batch =>
    batch.sent_from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.sent_to.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={styles.container}>
      <aside className={staffStyles.sidebar}>
        <div className={staffStyles.logo}>
          <Image src="/movo_logo.png" alt="MOVO" width={168} height={40} className={staffStyles.logoImage} priority />
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
          <Link href="/staff/batches" className={staffStyles.navItem} aria-current="page">
            <span className={staffStyles.navIcon}>📋</span>
            Batches
          </Link>
          <Link href="/staff/expenses" className={staffStyles.navItem}>
            <span className={staffStyles.navIcon}>🧾</span>
            Expenses
          </Link>
          <Link href="/staff/accounts" className={staffStyles.navItem}>
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
          <h1>Batch Management</h1>
          <p className={styles.subtitle}>Track branch batches and package details.</p>
        </header>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.mainContent}>
          <section className={styles.batchListPanel}>
            <div className={styles.panelHeader}>
              <h2>Available Batches</h2>
            </div>

            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search by location..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {loading && batches.length === 0 ? (
              <div className={styles.loadingMessage}>Loading batches...</div>
            ) : error && batches.length === 0 ? (
              <div className={styles.errorMessage}>{error}</div>
            ) : filteredBatches.length === 0 ? (
              <div className={styles.emptyMessage}>No batches found</div>
            ) : (
              <div className={styles.batchList}>
                {filteredBatches.map(batch => (
                  <button
                    key={batch.id}
                    type="button"
                    className={`${styles.batchItem} ${selectedBatch?.id === batch.id ? styles.selected : ''}`}
                    onClick={() => handleSelectBatch(batch.id)}
                  >
                    <div className={styles.batchItemHeader}>
                      <strong>Batch #{batch.id.toString().padStart(4, '0')}</strong>
                      <span className={styles.packageCount}>{batch.package_count} packages</span>
                    </div>
                    <div className={styles.batchItemDetails}>
                      <div>From: {batch.sent_from}</div>
                      <div>To: {batch.sent_to}</div>
                    </div>
                    <div className={styles.batchItemStatus}>
                      {batch.is_available ? (
                        <span className={styles.statusAvailable}>Available</span>
                      ) : (
                        <span className={styles.statusUnavailable}>Closed</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className={styles.detailsPanel}>
            {selectedBatch ? (
              <>
                <div className={styles.batchHeader}>
                  <h2>Batch Details</h2>
                  <div className={styles.batchInfo}>
                    <div className={styles.infoPair}>
                      <span className={styles.label}>Batch ID</span>
                      <span className={styles.value}>#{selectedBatch.id.toString().padStart(4, '0')}</span>
                    </div>
                    <div className={styles.infoPair}>
                      <span className={styles.label}>From</span>
                      <span className={styles.value}>{selectedBatch.sent_from}</span>
                    </div>
                    <div className={styles.infoPair}>
                      <span className={styles.label}>To</span>
                      <span className={styles.value}>{selectedBatch.sent_to}</span>
                    </div>
                    <div className={styles.infoPair}>
                      <span className={styles.label}>Status</span>
                      <span className={styles.value}>
                        {selectedBatch.is_available ? (
                          <span className={styles.statusAvailable}>Available</span>
                        ) : (
                          <span className={styles.statusUnavailable}>Closed</span>
                        )}
                      </span>
                    </div>
                    <div className={styles.infoPair}>
                      <span className={styles.label}>Created</span>
                      <span className={styles.value}>{new Date(selectedBatch.added_at).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.infoPair}>
                      <span className={styles.label}>Total Packages</span>
                      <span className={styles.value}>{selectedBatch.package_count}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.packagesSection}>
                  <h3>Packages in Batch</h3>

                  {selectedBatch.packages.length === 0 ? (
                    <div className={styles.emptyMessage}>No packages in this batch</div>
                  ) : (
                    <div className={styles.packagesList}>
                      {selectedBatch.packages.map(pkg => (
                        <div key={pkg.id} className={styles.packageCard}>
                          <div className={styles.packageHeader}>
                            <div>
                              <strong>{pkg.package_code}</strong>
                              <span className={styles.prepackageCode}>Code: {pkg.creation_code}</span>
                            </div>
                            <div>
                              {pkg.is_collected ? (
                                <span className={styles.collectedBadge}>Collected</span>
                              ) : (
                                <span className={styles.pendingBadge}>Pending</span>
                              )}
                            </div>
                          </div>

                          <div className={styles.packageDetails}>
                            <div className={styles.detailRow}>
                              <span className={styles.label}>From:</span>
                              <span>{pkg.sender_name} ({pkg.sender_phone})</span>
                            </div>
                            <div className={styles.detailRow}>
                              <span className={styles.label}>To:</span>
                              <span>{pkg.receiver_name} ({pkg.receiver_phone})</span>
                            </div>

                            <div className={styles.detailRow}>
                              <span className={styles.label}>Size:</span>
                              <span>{pkg.size || 'N/A'}</span>
                            </div>

                            <div className={styles.detailRow}>
                              <span className={styles.label}>Amount:</span>
                              <span>
                                {pkg.currency === 'usd' ? `$${pkg.amount_usd}` : `ZWL ${pkg.amount_zwl}`}
                              </span>
                            </div>

                            <div className={styles.detailRow}>
                              <span className={styles.label}>Payment:</span>
                              <span>{pkg.payment_method === 'cash' ? 'Cash' : 'EcoCash'}</span>
                            </div>

                            {pkg.description && (
                              <div className={styles.detailRow}>
                                <span className={styles.label}>Description:</span>
                                <span>{pkg.description}</span>
                              </div>
                            )}

                            {pkg.collected_at && (
                              <div className={styles.detailRow}>
                                <span className={styles.label}>Collected:</span>
                                <span>{new Date(pkg.collected_at).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <p>Select a batch to view details and packages</p>
              </div>
            )}
          </section>
          </div>
      </main>
    </div>
  )
}
