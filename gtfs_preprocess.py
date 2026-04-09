#!/usr/bin/env python3
"""GTFS → optimizirani JSON za Kontrola JPP PWA."""
import json, csv, os
from collections import defaultdict

GTFS = 'gtfs_raw'
OUT  = 'data'
os.makedirs(OUT, exist_ok=True)

# ── 1. Routes ────────────────────────────────────────────────
routes = {}
with open(f'{GTFS}/routes.txt', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        routes[r['route_id']] = {'id': r['route_id'], 'short': r['route_short_name'], 'long': r['route_long_name']}
with open(f'{OUT}/routes.json', 'w', encoding='utf-8') as f:
    json.dump(sorted(routes.values(), key=lambda x: x['short']), f, ensure_ascii=False)
print(f'Routes: {len(routes)}')

# ── 2. Stops ─────────────────────────────────────────────────
stops = {}
with open(f'{GTFS}/stops.txt', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        stops[r['stop_id']] = {'name': r['stop_name'], 'lat': float(r['stop_lat']), 'lon': float(r['stop_lon'])}
with open(f'{OUT}/stops.json', 'w', encoding='utf-8') as f:
    json.dump(stops, f, ensure_ascii=False)
print(f'Stops: {len(stops)}')

# ── 3. Calendar ───────────────────────────────────────────────
calendar = {}
with open(f'{GTFS}/calendar.txt', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        days = [r[d] for d in ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']]
        mon_fri = all(days[i]=='1' for i in range(5)) and days[5]=='0' and days[6]=='0'
        sat_only = days[5]=='1' and days[6]=='0' and all(days[i]=='0' for i in range(5))
        sun_only = days[6]=='1' and days[5]=='0' and all(days[i]=='0' for i in range(5))
        calendar[r['service_id']] = 'S' if sat_only else 'N' if sun_only else 'D'
print(f'Calendar: {dict(list(calendar.items())[:5])}')

# ── 4. Stop times per trip ────────────────────────────────────
print('Processing stop_times...')
trip_stops = defaultdict(list)
with open(f'{GTFS}/stop_times.txt', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        trip_stops[r['trip_id']].append({
            'seq': int(r['stop_sequence']),
            'sid': r['stop_id'],
            'name': stops.get(r['stop_id'], {}).get('name', '?'),
            'arr': r['arrival_time'],
            'dep': r['departure_time'],
        })
for tid in trip_stops:
    trip_stops[tid].sort(key=lambda s: s['seq'])

# ── 5. Trips grouped by route ──────────────────────────────────
trips_by_route = defaultdict(list)
with open(f'{GTFS}/trips.txt', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        tid = r['trip_id']
        st = trip_stops.get(tid, [])
        trips_by_route[r['route_id']].append({
            'id': tid,
            'headsign': r['trip_headsign'],
            'dir': int(r['direction_id']),
            'svc': calendar.get(r['service_id'], 'D'),
            'dep': st[0]['dep'] if st else '00:00:00',
            'n_stops': len(st),
        })
for rid in trips_by_route:
    trips_by_route[rid].sort(key=lambda t: t['dep'])

with open(f'{OUT}/trips.json', 'w', encoding='utf-8') as f:
    json.dump(dict(trips_by_route), f, ensure_ascii=False)
total_trips = sum(len(v) for v in trips_by_route.values())
print(f'Trips: {total_trips} across {len(trips_by_route)} routes')

# ── 6. Stop times — split per route ──────────────────────────
# data/st_{route_id}.json — lazy loaded po izbiri linije
total_size = 0
for rid, trips_list in trips_by_route.items():
    route_stops = {t['id']: trip_stops[t['id']] for t in trips_list if t['id'] in trip_stops}
    fname = f'{OUT}/st_{rid}.json'
    with open(fname, 'w', encoding='utf-8') as f:
        json.dump(route_stops, f, ensure_ascii=False)
    total_size += os.path.getsize(fname)

print(f'Stop times: split into {len(trips_by_route)} files, total {total_size//1024} KB')
print('✓ Done — data/ files ready.')
