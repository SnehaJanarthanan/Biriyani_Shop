export default function FilterSidebar({ filters, onChange }) {
  return (
    <aside className="sidebar card pad">
      <h2 className="sidebar-title">Filters</h2>

      <label className="field">
        <span>Distance cap (needs location)</span>
        <select
          value={filters.maxKm}
          onChange={(e) => onChange({ ...filters, maxKm: e.target.value })}
        >
          <option value="">Any</option>
          <option value="3">Within 3 km</option>
          <option value="5">Within 5 km</option>
          <option value="10">Within 10 km</option>
          <option value="15">Within 15 km</option>
        </select>
      </label>

      <label className="field">
        <span>Restaurant type</span>
        <select
          value={filters.vegType}
          onChange={(e) => onChange({ ...filters, vegType: e.target.value })}
        >
          <option value="">Any</option>
          <option value="veg">Veg-friendly</option>
          <option value="nonveg">Non-veg</option>
          <option value="both">Both-only listings</option>
        </select>
      </label>

      <div className="field-row">
        <label className="field">
          <span>Min ₹</span>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={filters.priceMin}
            onChange={(e) => onChange({ ...filters, priceMin: e.target.value })}
          />
        </label>
        <label className="field">
          <span>Max ₹</span>
          <input
            type="number"
            min="0"
            placeholder="∞"
            value={filters.priceMax}
            onChange={(e) => onChange({ ...filters, priceMax: e.target.value })}
          />
        </label>
      </div>

      <label className="field">
        <span>Minimum rating</span>
        <select
          value={filters.minRating}
          onChange={(e) => onChange({ ...filters, minRating: e.target.value })}
        >
          <option value="">Any</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="4.5">4.5+</option>
        </select>
      </label>

      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={filters.hasDiscount}
          onChange={(e) => onChange({ ...filters, hasDiscount: e.target.checked })}
        />
        <span>Has active discount</span>
      </label>
    </aside>
  )
}
