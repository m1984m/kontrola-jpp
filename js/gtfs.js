/**
 * gtfs.js — GTFS data loading and lookup
 */
const GTFS = (() => {
  let routes = null;
  let trips = null;
  let stops = null;
  let stopTimesCache = {};  // route_id → {trip_id: [stops]}

  async function loadRoutes() {
    if (routes) return routes;
    const r = await fetch('data/routes.json');
    routes = await r.json();
    return routes;
  }

  async function loadTrips() {
    if (trips) return trips;
    const r = await fetch('data/trips.json');
    trips = await r.json();
    return trips;
  }

  async function loadStops() {
    if (stops) return stops;
    const r = await fetch('data/stops.json');
    stops = await r.json();
    return stops;
  }

  async function loadStopTimes(route_id) {
    if (stopTimesCache[route_id]) return stopTimesCache[route_id];
    const r = await fetch(`data/st_${route_id}.json`);
    const data = await r.json();
    stopTimesCache[route_id] = data;
    return data;
  }

  function getTripsForRoute(route_id, service_type) {
    if (!trips || !trips[route_id]) return [];
    return trips[route_id].filter(t => t.svc === service_type);
  }

  function getStopsForTrip(route_id, trip_id) {
    const data = stopTimesCache[route_id];
    if (!data) return [];
    return data[trip_id] || [];
  }

  function groupTripsByDirection(trip_list) {
    const dirs = {};
    for (const t of trip_list) {
      const key = t.dir;
      if (!dirs[key]) dirs[key] = { dir: key, headsign: t.headsign, trips: [] };
      dirs[key].trips.push(t);
    }
    return Object.values(dirs);
  }

  return {
    loadRoutes, loadTrips, loadStops, loadStopTimes,
    getTripsForRoute, getStopsForTrip, groupTripsByDirection,
  };
})();

window.GTFS = GTFS;
