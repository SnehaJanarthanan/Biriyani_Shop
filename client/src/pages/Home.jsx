import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import RestaurantCard from '../components/RestaurantCard'
import FilterSidebar from '../components/FilterSidebar'
import { HYDERABAD_DEFAULT } from '../constants'

function persistCoords(lat, lng) {
  sessionStorage.setItem('finder_lat', String(lat))
  sessionStorage.setItem('finder_lng', String(lng))
}

export default function Home() {
  const [coords, setCoords] = useState(null)
  const [geoNote, setGeoNote] = useState('')
  const [loadingGeo, setLoadingGeo] = useState(true)
  const [restaurants, setRestaurants] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    maxKm: '',
    vegType: '',
    priceMin: '',
    priceMax: '',
    minRating: '',
    hasDiscount: false,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setCoords(HYDERABAD_DEFAULT)
      persistCoords(HYDERABAD_DEFAULT.lat, HYDERABAD_DEFAULT.lng)
      setGeoNote('Geolocation not supported — showing distances from Charminar.')
      setLoadingGeo(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        persistCoords(lat, lng)
        setCoords({ lat, lng })
        setGeoNote('')
        setLoadingGeo(false)
      },
      () => {
        persistCoords(HYDERABAD_DEFAULT.lat, HYDERABAD_DEFAULT.lng)
        setCoords(HYDERABAD_DEFAULT)
        setGeoNote('Location denied — using Hyderabad centre for distance.')
        setLoadingGeo(false)
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
    )
  }, [])

  const queryParams = useMemo(() => {
    const p = new URLSearchParams()
    if (!coords) return p
    p.set('lat', String(coords.lat))
    p.set('lng', String(coords.lng))
    if (filters.maxKm) p.set('maxKm', filters.maxKm)
    if (filters.vegType) p.set('vegType', filters.vegType)
    if (filters.priceMin) p.set('priceMin', filters.priceMin)
    if (filters.priceMax) p.set('priceMax', filters.priceMax)
    if (filters.minRating) p.set('minRating', filters.minRating)
    if (filters.hasDiscount) p.set('hasDiscount', 'true')
    return p
  }, [coords, filters])

  const fetchRestaurants = useCallback(async () => {
    if (!coords) return
    setLoadingList(true)
    setError('')
    try {
      const { data } = await api.get(`/restaurants?${queryParams.toString()}`)
      setRestaurants(data.restaurants || [])
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load restaurants')
      setRestaurants([])
    } finally {
      setLoadingList(false)
    }
  }, [coords, queryParams])

  useEffect(() => {
    fetchRestaurants()
  }, [fetchRestaurants])

  return (
    <div className="page home-page">
      <section className="hero panel">
        <div>
          <h1>Biriyani near you in Hyderabad</h1>
          <p className="lede">
            Distances use the Haversine formula on the server; ETA assumes typical city driving.
            Service area is limited to Hyderabad boundaries.
          </p>
          {geoNote ? <p className="banner-note">{geoNote}</p> : null}
          {loadingGeo ? <p className="muted">Detecting your location…</p> : null}
        </div>
        <button type="button" className="btn btn-secondary" disabled={loadingGeo} onClick={fetchRestaurants}>
          Refresh list
        </button>
      </section>

      <div className="home-layout">
        <FilterSidebar filters={filters} onChange={setFilters} />
        <div className="results">
          {error ? <p className="error-banner">{error}</p> : null}
          {loadingList ? <p className="muted">Loading restaurants…</p> : null}
          {!loadingList && !error && restaurants.length === 0 ? (
            <p className="muted">No restaurants match your filters.</p>
          ) : null}
          <div className="grid-cards">
            {restaurants.map((r) => (
              <RestaurantCard key={r._id} restaurant={r} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
