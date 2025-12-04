const request = require('supertest')
const express = require('express')
const { verifyUser } = require('../api/middleware/verifyUser')

// Mock Firebase admin
jest.mock('firebase-admin', () => ({
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn()
  }))
}))

const admin = require('firebase-admin')

describe('BiteBack API Integration Tests', () => {
  let app
  let verifyIdTokenMock

  beforeEach(() => {
    app = express()
    app.use(express.json())
    verifyIdTokenMock = admin.auth().verifyIdToken
    
    // Import routes after mocking
    const analyticsRoutes = require('../api/analyticsRoutes')
    app.use('/api/analytics', analyticsRoutes)
  })

  test('GET /api/analytics/biteback requires authentication', async () => {
    verifyIdTokenMock.mockRejectedValueOnce(new Error('Invalid token'))

    const response = await request(app)
      .get('/api/analytics/biteback')
      .set('Authorization', 'Bearer invalid-token')

    expect(response.status).toBe(403)
    expect(response.body.error).toContain('Unauthorized')
  })

  test('GET /api/analytics/biteback returns stats for authenticated user', async () => {
    const mockUser = { uid: 'test-user-123' }
    verifyIdTokenMock.mockResolvedValueOnce(mockUser)

    // Mock the database function
    const dbFunctions = require('../../sqlDB/dbFunctions')
    const mockStats = {
      year: 2024,
      totalEntries: 15,
      mostActiveMonth: { name: 'March', entry_count: 5 },
      favoriteCuisine: { name: 'Italian', count: 8 },
      topRatedRestaurant: { name: "Test Restaurant", rating: '4.5' },
      priceRange: { range: '$$', count: 10 },
      mostDinedLocation: { name: "Test Restaurant", visit_count: 4 }
    }

    dbFunctions.getBiteBackStats = jest.fn().mockResolvedValue(mockStats)

    const response = await request(app)
      .get('/api/analytics/biteback?year=2024')
      .set('Authorization', 'Bearer valid-token')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toEqual(mockStats)
    expect(dbFunctions.getBiteBackStats).toHaveBeenCalledWith('test-user-123', '2024')
  })

  test('GET /api/analytics/biteback handles year parameter', async () => {
    const mockUser = { uid: 'test-user-123' }
    verifyIdTokenMock.mockResolvedValueOnce(mockUser)

    const dbFunctions = require('../../sqlDB/dbFunctions')
    dbFunctions.getBiteBackStats = jest.fn().mockResolvedValue({ year: 2023 })

    const response = await request(app)
      .get('/api/analytics/biteback?year=2023')
      .set('Authorization', 'Bearer valid-token')

    expect(response.status).toBe(200)
    expect(dbFunctions.getBiteBackStats).toHaveBeenCalledWith('test-user-123', '2023')
  })

  test('GET /api/analytics/biteback handles database errors', async () => {
    const mockUser = { uid: 'test-user-123' }
    verifyIdTokenMock.mockResolvedValueOnce(mockUser)

    const dbFunctions = require('../../sqlDB/dbFunctions')
    dbFunctions.getBiteBackStats = jest.fn().mockRejectedValue(new Error('Database error'))

    const response = await request(app)
      .get('/api/analytics/biteback')
      .set('Authorization', 'Bearer valid-token')

    expect(response.status).toBe(500)
    expect(response.body.error).toContain('Failed to fetch BiteBack stats')
  })
})