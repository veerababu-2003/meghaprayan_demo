/**
 * Route scoring utilizing multi-factor Dijkstra-based graph cost formulation.
 * Combines physical distance, road duration, and weather risk penalties.
 * 
 * Road geometry is provided by the external routing engine (OSRM/ORS).
 * MeghaPrayan evaluates candidate route graphs where edge weights represent:
 * Cost = w_time * normalized_duration + w_dist * normalized_distance + w_weather * weather_risk_penalty
 */

class PriorityQueue {
  constructor() {
    this.values = [];
  }
  enqueue(val, priority) {
    this.values.push({ val, priority });
    this.sort();
  }
  dequeue() {
    return this.values.shift();
  }
  sort() {
    this.values.sort((a, b) => a.priority - b.priority);
  }
  isEmpty() {
    return this.values.length === 0;
  }
}

/**
 * Run Dijkstra over a graph of waypoints and segments
 * @param {Array} nodes - list of node ids
 * @param {Object} adjacencyList - { [nodeId]: [{ node, weight, distance, duration, weatherRisk }] }
 * @param {string} startNode
 * @param {string} endNode
 */
function dijkstraScoreGraph(nodes, adjacencyList, startNode, endNode) {
  const distances = {};
  const previous = {};
  const pq = new PriorityQueue();

  nodes.forEach(node => {
    if (node === startNode) {
      distances[node] = 0;
      pq.enqueue(node, 0);
    } else {
      distances[node] = Infinity;
      pq.enqueue(node, Infinity);
    }
    previous[node] = null;
  });

  while (!pq.isEmpty()) {
    const { val: smallest } = pq.dequeue();
    if (smallest === endNode) {
      break;
    }

    if (distances[smallest] !== Infinity && adjacencyList[smallest]) {
      for (const neighbor of adjacencyList[smallest]) {
        const candidateCost = distances[smallest] + neighbor.weight;
        if (candidateCost < distances[neighbor.node]) {
          distances[neighbor.node] = candidateCost;
          previous[neighbor.node] = smallest;
          pq.enqueue(neighbor.node, candidateCost);
        }
      }
    }
  }

  return {
    totalCost: distances[endNode],
    path: previous
  };
}

/**
 * Score and compare candidate routes fetched from routing APIs.
 * Generates transparent Dijkstra-weighted composite scoring and plain text explanations.
 */
function scoreCandidateRoutes(routes, mode = 'car') {
  if (!routes || routes.length === 0) return [];

  // Find baselines for normalization
  const minDistance = Math.min(...routes.map(r => r.distanceKm));
  const minDuration = Math.min(...routes.map(r => r.durationMinutes));

  // Mode-dependent weight factors
  const weights = {
    car: { time: 0.40, distance: 0.25, weather: 0.35 },
    bike: { time: 0.25, distance: 0.20, weather: 0.55 }, // Weather is far more critical for two-wheelers
    walking: { time: 0.20, distance: 0.20, weather: 0.60 }
  }[mode] || { time: 0.35, distance: 0.25, weather: 0.40 };

  const scoredRoutes = routes.map((route, idx) => {
    // Calculate average and peak weather risk across route segments
    let avgWeatherRisk = 0;
    let peakWeatherRisk = 0;
    const weatherPoints = route.weatherPoints || [];

    if (weatherPoints.length > 0) {
      const risks = weatherPoints.map(wp => wp.riskScore || 0);
      avgWeatherRisk = risks.reduce((a, b) => a + b, 0) / risks.length;
      peakWeatherRisk = Math.max(...risks);
    }

    // Compound weather risk (70% avg + 30% peak severity)
    const compositeWeatherRisk = (avgWeatherRisk * 0.7) + (peakWeatherRisk * 0.3);

    // Normalized factors (1.0 = baseline best)
    const normalizedTime = minDuration > 0 ? route.durationMinutes / minDuration : 1;
    const normalizedDist = minDistance > 0 ? route.distanceKm / minDistance : 1;

    // Build micro-graph for route segments to compute cumulative Dijkstra cost
    const segmentCount = Math.max(1, weatherPoints.length - 1);
    const nodes = [];
    for (let i = 0; i <= segmentCount; i++) nodes.push(`step_${i}`);
    
    const adjacencyList = {};
    for (let i = 0; i < segmentCount; i++) {
      const u = `step_${i}`;
      const v = `step_${i + 1}`;
      const segRisk = weatherPoints[i] ? (weatherPoints[i].riskScore || 0) : compositeWeatherRisk;
      
      const segTimeCost = (route.durationMinutes / segmentCount) / (minDuration || 1);
      const segDistCost = (route.distanceKm / segmentCount) / (minDistance || 1);
      const segWeatherCost = segRisk * 2.0; // Weather penalty multiplier

      const segmentWeight = (weights.time * segTimeCost) + 
                            (weights.distance * segDistCost) + 
                            (weights.weather * segWeatherCost);

      adjacencyList[u] = [{ node: v, weight: segmentWeight }];
    }

    const dijkstraResult = dijkstraScoreGraph(nodes, adjacencyList, 'step_0', `step_${segmentCount}`);
    
    // Overall score on 0 - 100 scale (100 = optimal, lower = high friction / weather hazard)
    const penaltyRatio = dijkstraResult.totalCost || 1.0;
    const finalScore = Math.max(10, Math.min(99, Math.round(100 / penaltyRatio)));

    // Generate clear, honest explanation
    const reasons = [];
    if (route.durationMinutes === minDuration) {
      reasons.push('Fastest travel duration');
    }
    if (route.distanceKm === minDistance) {
      reasons.push('Shortest physical route');
    }
    if (compositeWeatherRisk <= 0.15) {
      reasons.push('Minimal weather hazards & clear skies');
    } else if (compositeWeatherRisk >= 0.5) {
      reasons.push('Higher weather hazard (precipitation/wind) detected');
    }

    const explanation = `Route evaluated with Dijkstra multi-factor scoring (weight: ${(weights.weather * 100)}% weather, ${(weights.time * 100)}% travel time, ${(weights.distance * 100)}% distance). ${reasons.join(', ')}.`;

    return {
      ...route,
      routeIndex: idx,
      dijkstraScore: finalScore,
      compositeWeatherRisk: Number(compositeWeatherRisk.toFixed(2)),
      dijkstraExplanation: explanation
    };
  });

  // Label highest score as recommended, shortest time as fastest, lowest weather risk as safest
  let highestScoreIdx = 0;
  let fastestIdx = 0;
  let safestIdx = 0;
  let minRisk = Infinity;
  let minDur = Infinity;
  let maxScore = -1;

  scoredRoutes.forEach((r, idx) => {
    if (r.dijkstraScore > maxScore) {
      maxScore = r.dijkstraScore;
      highestScoreIdx = idx;
    }
    if (r.durationMinutes < minDur) {
      minDur = r.durationMinutes;
      fastestIdx = idx;
    }
    if (r.compositeWeatherRisk < minRisk) {
      minRisk = r.compositeWeatherRisk;
      safestIdx = idx;
    }
  });

  return scoredRoutes.map((r, idx) => ({
    ...r,
    isRecommended: idx === highestScoreIdx,
    isFastest: idx === fastestIdx,
    isSafest: idx === safestIdx
  }));
}

module.exports = {
  dijkstraScoreGraph,
  scoreCandidateRoutes
};
