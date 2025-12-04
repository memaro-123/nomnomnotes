import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { toast } from 'react-hot-toast'
import BiteBack from '../components/dashboard/BiteBack'
import { auth } from '../firebase'

// Mock dependencies
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  }
}))

vi.mock('../firebase', () => ({
  auth: {
    currentUser: {
      getIdToken: vi.fn(() => Promise.resolve('mock-token-123'))
    }
  }
}))

// Mock fetch globally
global.fetch = vi.fn()

describe('BiteBack Component', () => {
  const mockStats = {
    year: 2024,
    totalEntries: 15,
    mostActiveMonth: {
      name: 'March',
      entry_count: 5
    },
    favoriteCuisine: {
      name: 'Italian',
      count: 8
    },
    topRatedRestaurant: {
      name: "Mario's Pizzeria",
      rating: '4.8'
    },
    priceRange: {
      range: '$$',
      count: 10
    },
    mostDinedLocation: {
      name: "Mario's Pizzeria",
      visit_count: 4
    }
  }

  const mockEmptyStats = {
    year: 2024,
    totalEntries: 0,
    mostActiveMonth: {
      name: 'N/A',
      entry_count: 0
    },
    favoriteCuisine: {
      name: 'N/A',
      count: 0
    },
    topRatedRestaurant: {
      name: 'N/A',
      rating: 'N/A'
    },
    priceRange: {
      range: 'N/A',
      count: 0
    },
    mostDinedLocation: {
      name: 'N/A',
      visit_count: 0
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders loading spinner initially', () => {
    render(<BiteBack />)
    expect(screen.getByText(/Crunching your food data/i)).toBeInTheDocument()
  })

  test('fetches and displays BiteBack stats successfully', async () => {
    // Mock successful API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockStats })
    })

    render(<BiteBack />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText(/BiteBack 2024/i)).toBeInTheDocument()
    })

    // Verify all stats are displayed
    expect(screen.getByText(/15 food adventures/i)).toBeInTheDocument()
    expect(screen.getByText('March')).toBeInTheDocument()
    expect(screen.getByText('Italian')).toBeInTheDocument()
    expect(screen.getByText("Mario's Pizzeria")).toBeInTheDocument()
    expect(screen.getByText('$$')).toBeInTheDocument()
  })

  test('handles empty state when no entries exist', async () => {
    // Mock API response with no data
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockEmptyStats })
    })

    render(<BiteBack />)

    await waitFor(() => {
      expect(screen.getByText(/No BiteBack Data Yet!/i)).toBeInTheDocument()
    })

    // Should show message about adding diary entries
    expect(screen.getByText(/Start adding diary entries/i)).toBeInTheDocument()
  })

  test('handles API error gracefully', async () => {
    // Mock API error
    fetch.mockRejectedValueOnce(new Error('Network error'))

    render(<BiteBack />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load your BiteBack')
    })

    // Should show empty state after error
    expect(screen.getByText(/No BiteBack Data Yet!/i)).toBeInTheDocument()
  })

  test('allows changing years', async () => {
    // Mock initial API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockStats })
    })

    render(<BiteBack />)

    await waitFor(() => {
      expect(screen.getByText(/BiteBack 2024/i)).toBeInTheDocument()
    })

    // Find year buttons (2024, 2023, 2022)
    const yearButtons = screen.getAllByRole('button', { name: /202[2-4]/ })
    expect(yearButtons).toHaveLength(3)

    // Mock API response for 2023
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: true, 
        data: { ...mockStats, year: 2023, totalEntries: 10 }
      })
    })

    // Click 2023 button
    fireEvent.click(yearButtons[1]) // 2023 button

    await waitFor(() => {
      expect(screen.getByText(/BiteBack 2023/i)).toBeInTheDocument()
    })

    // Should show 2023 data
    expect(screen.getByText(/10 food adventures/i)).toBeInTheDocument()
  })

  test('SummaryCard component renders correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockStats })
    })

    render(<BiteBack />)

    await waitFor(() => {
      // Check each summary card
      expect(screen.getByText('Most Active Month')).toBeInTheDocument()
      expect(screen.getByText('Favorite Cuisine')).toBeInTheDocument()
      expect(screen.getByText('Top Rated')).toBeInTheDocument()
      expect(screen.getByText('Go-To Price')).toBeInTheDocument()
      expect(screen.getByText('Most Visited')).toBeInTheDocument()
    })

    // Verify values
    expect(screen.getByText('March')).toBeInTheDocument()
    expect(screen.getByText('Italian')).toBeInTheDocument()
    expect(screen.getByText("Mario's Pizzeria")).toBeInTheDocument()
    expect(screen.getByText('$$')).toBeInTheDocument()
  })
})

// Test helper components
describe('BiteBack Helper Components', () => {
  test('LoadingSpinner renders correctly', () => {
    const { LoadingSpinner } = require('../components/dashboard/BiteBack')
    render(<LoadingSpinner />)
    expect(screen.getByText(/Crunching your food data/i)).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  test('EmptyState renders with year buttons', () => {
    const { EmptyState } = require('../components/dashboard/BiteBack')
    const setSelectedYear = vi.fn()
    
    render(<EmptyState year={2024} setSelectedYear={setSelectedYear} />)
    
    expect(screen.getByText(/No BiteBack Data Yet!/i)).toBeInTheDocument()
    expect(screen.getByText(/Start adding diary entries/i)).toBeInTheDocument()
    
    // Should have year buttons
    expect(screen.getByText('2024')).toBeInTheDocument()
    expect(screen.getByText('2023')).toBeInTheDocument()
    expect(screen.getByText('2022')).toBeInTheDocument()
  })
})