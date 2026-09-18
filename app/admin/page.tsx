"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import styles from "./styles.module.css"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

type MetricPoint = { date: string; value: number }
type MetricKey = "delivery_orders_added" | "delivery_orders_assigned" | "delivery_orders_completed" | "delivery_orders_cancelled"
type DeliveryMetrics = Record<MetricKey, MetricPoint[]>
type ChartDay = { date: string } & Record<MetricKey, number>

const metricDefinitions: { key: MetricKey; label: string; color: string }[] = [
  { key: "delivery_orders_added", label: "Added", color: "#2563eb" },
  { key: "delivery_orders_assigned", label: "Assigned", color: "#f59e0b" },
  { key: "delivery_orders_completed", label: "Completed", color: "#16a34a" },
  { key: "delivery_orders_cancelled", label: "Cancelled", color: "#dc2626" },
]

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function defaultStartDate() {
  const date = new Date()
  date.setDate(date.getDate() - 29)
  return formatDate(date)
}

function buildChartDays(metrics: DeliveryMetrics): ChartDay[] {
  const valuesByDate = new Map<string, ChartDay>()

  for (const definition of metricDefinitions) {
    for (const point of metrics[definition.key]) {
      const day = valuesByDate.get(point.date) ?? {
        date: point.date,
        delivery_orders_added: 0,
        delivery_orders_assigned: 0,
        delivery_orders_completed: 0,
        delivery_orders_cancelled: 0,
      }
      day[definition.key] = Number(point.value) || 0
      valuesByDate.set(point.date, day)
    }
  }

  return Array.from(valuesByDate.values()).sort((first, second) => first.date.localeCompare(second.date))
}

export default function AdminPage() {
  const router = useRouter()
  const [startDate, setStartDate] = useState(defaultStartDate)
  const [endDate, setEndDate] = useState(() => formatDate(new Date()))
  const [metrics, setMetrics] = useState<DeliveryMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!window.sessionStorage.getItem("movo_access_token")) router.replace("/adminportal/login")
  }, [router])

  async function loadMetrics() {
    const accessToken = window.sessionStorage.getItem("movo_access_token")
    if (!accessToken) return

    setLoading(true)
    setError("")
    try {
      const query = new URLSearchParams({ start_date: startDate, end_date: endDate })
      const response = await fetch(`${API_BASE}/api/adminportal/delivery_metrics?${query}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const data = await response.json().catch(() => null)
      console.log(data)
      if (!response.ok) throw new Error(data?.detail || data?.error || "Unable to load delivery metrics.")
        
      setMetrics({
        delivery_orders_added: Array.isArray(data?.delivery_orders_added) ? data.delivery_orders_added : [],
        delivery_orders_assigned: Array.isArray(data?.delivery_orders_assigned) ? data.delivery_orders_assigned : [],
        delivery_orders_completed: Array.isArray(data?.delivery_orders_completed) ? data.delivery_orders_completed : [],
        delivery_orders_cancelled: Array.isArray(data?.delivery_orders_cancelled) ? data.delivery_orders_cancelled : [],
      })
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load delivery metrics.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadMetrics() }, [])

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void loadMetrics()
  }

  const chartDays = metrics ? buildChartDays(metrics) : []
  const largestTotal = Math.max(1, ...chartDays.map((day) => metricDefinitions.reduce((total, definition) => total + day[definition.key], 0)))

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>Movo administration</p><h1>Delivery metrics</h1><div><Link href="/admin/suburbs">Manage suburbs</Link> <Link href="/admin/bikers">Manage bikers</Link></div></div>
        <form className={styles.filters} onSubmit={handleFilterSubmit}>
          <label>Start date<input type="date" value={startDate} max={endDate} onChange={(event) => setStartDate(event.target.value)} required /></label>
          <label>End date<input type="date" value={endDate} min={startDate} max={formatDate(new Date())} onChange={(event) => setEndDate(event.target.value)} required /></label>
          <button type="submit" disabled={loading}>Apply</button>
        </form>
      </header>
      <section className={styles.chartPanel} aria-labelledby="delivery-chart-heading">
        <div className={styles.chartHeader}>
          <h2 id="delivery-chart-heading">Orders by day</h2>
          <div className={styles.legend}>{metricDefinitions.map((definition) => <span key={definition.key}><i style={{ backgroundColor: definition.color }} />{definition.label}</span>)}</div>
        </div>
        {loading && <p className={styles.status}>Loading delivery metrics...</p>}
        {!loading && error && <p className={`${styles.status} ${styles.error}`} role="alert">{error}</p>}
        {!loading && !error && chartDays.length === 0 && <p className={styles.status}>No delivery orders found for this date range.</p>}
        {!loading && !error && chartDays.length > 0 && <div className={styles.chartScroll}><div className={styles.chart} style={{ minWidth: `${Math.max(620, chartDays.length * 44)}px` }}>
          {chartDays.map((day) => <div className={styles.barColumn} key={day.date}><div className={styles.bar}>
            {metricDefinitions.map((definition) => day[definition.key] > 0 && <span key={definition.key} title={`${definition.label}: ${day[definition.key]}`} style={{ height: `${(day[definition.key] / largestTotal) * 100}%`, backgroundColor: definition.color }} />)}
          </div><time dateTime={day.date}>{day.date.slice(5)}</time></div>)}
        </div></div>}
      </section>
    </main>
  )
}