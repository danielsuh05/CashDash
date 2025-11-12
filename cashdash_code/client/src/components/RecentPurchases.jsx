import React, { useState, useEffect, useRef } from 'react'
import { useCurrency } from '../contexts/CurrencyContext.jsx'
import './RecentPurchases.css'

// Sample color palette for purchase categories
const PURCHASE_COLORS = [
  '#16A34A', // green
  '#9333EA', // purple
  '#EA580C', // orange
  '#DC2626', // red
  '#2563EB', // blue
  '#CA8A04', // yellow
]

/**
 * RecentPurchases - A carousel component displaying recent purchases grouped by day
 * 
 * @param {Object} props
 * @param {Array} props.purchases - Array of purchase objects with { id, name, amount, date, category }
 */
export default function RecentPurchases({ purchases = [] }) {
  const { formatCurrency } = useCurrency()
  const carouselRef = useRef(null)

  // Group purchases by date
  const purchasesByDate = React.useMemo(() => {
    const grouped = {}
    purchases.forEach((purchase) => {
      const date = new Date(purchase.date || purchase.created_at)
      const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(purchase)
    })
    
    // Sort dates in ascending order (oldest first, newest last - newest appears on right)
    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b))
    
    return sortedDates.map((date) => ({
      date,
      purchases: grouped[date],
    }))
  }, [purchases])

  // Generate sample data if no purchases provided
  const displayData = purchasesByDate.length > 0 
    ? purchasesByDate 
    : generateSampleData()

  const maxIndex = Math.max(0, displayData.length - 3)
  // Start at the end to show newest dates on the right
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Initialize to show newest dates on the right when data loads
  useEffect(() => {
    if (displayData.length > 0) {
      setCurrentIndex(Math.max(0, maxIndex))
    }
  }, [displayData.length, maxIndex])
  
  const canScrollLeft = currentIndex > 0
  const canScrollRight = currentIndex < maxIndex

  const handlePrevious = () => {
    if (canScrollLeft) {
      setCurrentIndex((prev) => Math.max(0, prev - 1))
    }
  }

  const handleNext = () => {
    if (canScrollRight) {
      setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
    }
  }

  // Scroll carousel when index changes
  useEffect(() => {
    if (carouselRef.current) {
      const firstCard = carouselRef.current.querySelector('.purchase-card')
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth
        const gap = 16 // gap-4 = 16px
        const scrollPosition = currentIndex * (cardWidth + gap)
        carouselRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth',
        })
      }
    }
  }, [currentIndex])

  return (
    <div className="recent-purchases-container">
      <h2 className="recent-purchases-title">Recent Purchases</h2>
      
      <div className="recent-purchases-carousel-wrapper">
        <button
          className={`recent-purchases-arrow recent-purchases-arrow-left ${!canScrollLeft ? 'disabled' : ''}`}
          onClick={handlePrevious}
          disabled={!canScrollLeft}
          aria-label="Previous day"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div className="recent-purchases-carousel" ref={carouselRef}>
          {displayData.map((dayData, index) => (
            <PurchaseDayCard
              key={dayData.date}
              date={dayData.date}
              purchases={dayData.purchases}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>

        <button
          className={`recent-purchases-arrow recent-purchases-arrow-right ${!canScrollRight ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={!canScrollRight}
          aria-label="Next day"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function PurchaseDayCard({ date, purchases, formatCurrency }) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="purchase-card">
      <div className="purchase-card-date">{formattedDate}</div>
      <div className="purchase-card-list">
        {purchases.map((purchase, index) => {
          const color = PURCHASE_COLORS[index % PURCHASE_COLORS.length]
          return (
            <div key={purchase.id || index} className="purchase-item">
              <div className="purchase-item-dot" style={{ backgroundColor: color }} />
              <span className="purchase-item-name">{purchase.name || purchase.description || 'Purchase'}</span>
              <span className="purchase-item-amount">
                {formatCurrency(purchase.amount || 0)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Generate sample data for demonstration
function generateSampleData() {
  const today = new Date()
  const dates = []
  
  // Generate dates from oldest to newest (oldest first, newest last)
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push({
      date: date.toISOString().split('T')[0],
      purchases: [
        { id: `sample-${i}-1`, name: 'Rent', amount: 2500 },
        { id: `sample-${i}-2`, name: 'Whole Foods', amount: 24.12 },
        { id: `sample-${i}-3`, name: 'Rent', amount: 2500 },
        { id: `sample-${i}-4`, name: 'Whole Foods', amount: 24.12 },
      ],
    })
  }
  
  return dates
}

