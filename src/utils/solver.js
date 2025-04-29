import { create, all } from 'mathjs';

const math = create(all);

/**
 * Resolve o problema de PL pelo método matemático (vértices).
 * @param {Object} data
 * @param {Object} data.objective - { x: number, y: number }
 * @param {Array} data.constraints - [{ x, y, sign, value }]
 * @param {string} type - "max" ou "min" (por enquanto assumiremos max)
 * @returns {Object} resultado
 */
export function solveByMath(data, type = 'max') {
  const { objective, constraints } = data;

  // 1. Gerar todas as combinações de 2 restrições
  const intersections = [];

  for (let i = 0; i < constraints.length; i++) {
    for (let j = i + 1; j < constraints.length; j++) {
      const c1 = constraints[i];
      const c2 = constraints[j];
      const A = math.matrix([
        [parseFloat(c1.x), parseFloat(c1.y)],
        [parseFloat(c2.x), parseFloat(c2.y)],
      ]);

      const B = math.matrix([
        parseFloat(c1.value),
        parseFloat(c2.value),
      ]);

      try {
        const result = math.lusolve(A, B).toArray();
        const x = math.round(result[0][0], 6);
        const y = math.round(result[1][0], 6);
        
        // Só considera pontos com valores reais e finitos
        if (Number.isFinite(x) && Number.isFinite(y)) {
          intersections.push({ x, y });
          
        }
      } catch (error) {
        // Sistemas sem solução ou degenerados são ignorados
        continue;
      }
    }
  }
  // 2. Adicionar interseções com eixos x = 0 e y = 0 (restrições não-negativas)
  for (const c of constraints) {
    if (parseFloat(c.y) !== 0) {
      // x = 0
      intersections.push({
        x: 0,
        y: parseFloat(c.value) / parseFloat(c.y),
      });
    }
    if (parseFloat(c.x) !== 0) {
      // y = 0
      intersections.push({
        x: parseFloat(c.value) / parseFloat(c.x),
        y: 0,
      });
    }
  }

  // 3. Verifica quais interseções satisfazem todas as restrições
  const feasiblePoints = intersections.filter((p) => {
    return constraints.every((c) => {
      const val = p.x * parseFloat(c.x) + p.y * parseFloat(c.y);
      const rhs = parseFloat(c.value);
      switch (c.sign) {
        case '<=': return val <= rhs + 1e-6;
        case '>=': return val >= rhs - 1e-6;
        case '=': return Math.abs(val - rhs) <= 1e-6;
        default: return false;
      }
    }) && p.x >= -1e-6 && p.y >= -1e-6; // não-negatividade
  });

  // 4. Calcula Z = ax + by para cada ponto viável
  const results = feasiblePoints.map((p) => {
    const z = p.x * parseFloat(objective.x) + p.y * parseFloat(objective.y);
    return { ...p, z: math.round(z, 6) };
  });

  // 5. Determina máximo ou mínimo
  let optimalPoint = null;
  if (type === 'max') {
    optimalPoint = results.reduce((acc, curr) => (curr.z > acc.z ? curr : acc), results[0]);
  } else {
    optimalPoint = results.reduce((acc, curr) => (curr.z < acc.z ? curr : acc), results[0]);
  }

  return {
    feasiblePoints: results,
    optimalPoint,
    message: results.length > 0
      ? `Solução ${type === 'max' ? 'máxima' : 'mínima'} encontrada.`
      : 'Não há região viável.',
  };

}

export function solveByGraph(data, type = 'max') {
  const { objective, constraints } = data;

  // Calcula interseções de pares de restrições
  const intersections = [];
  for (let i = 0; i < constraints.length; i++) {
    for (let j = i + 1; j < constraints.length; j++) {
      const c1 = constraints[i];
      const c2 = constraints[j];
      const A = math.matrix([
        [parseFloat(c1.x), parseFloat(c1.y)],
        [parseFloat(c2.x), parseFloat(c2.y)],
      ]);
      const B = math.matrix([
        parseFloat(c1.value),
        parseFloat(c2.value),
      ]);
      try {
        const [x, y] = math.lusolve(A, B).toArray().map(arr => arr[0]);
        intersections.push({ x: math.round(x,6), y: math.round(y,6) });
      } catch {
        // ignora sistemas sem solução
      }
    }
  }

  // Interceptos com eixos
  const axesPoints = constraints.flatMap(c => {
    const pts = [];
    const a = parseFloat(c.x), b = parseFloat(c.y), v = parseFloat(c.value);
    if (a !== 0) pts.push({ x: +math.round(v/a,6), y: 0 });
    if (b !== 0) pts.push({ x: 0, y: +math.round(v/b,6) });
    return pts;
  });
  intersections.push(...axesPoints);

  // Filtra região viável
  const feasible = intersections.filter(p => {
    return constraints.every(c => {
      const lhs = p.x * parseFloat(c.x) + p.y * parseFloat(c.y);
      const rhs = parseFloat(c.value);
      if (c.sign === '<=') return lhs <= rhs + 1e-6;
      if (c.sign === '>=') return lhs >= rhs - 1e-6;
      return Math.abs(lhs - rhs) <= 1e-6;
    }) && p.x >= -1e-6 && p.y >= -1e-6;
  });

  // Remove duplicados aproximados
  const uniq = [];
  feasible.forEach(pt => {
    if (!uniq.some(u => Math.hypot(u.x - pt.x, u.y - pt.y) < 1e-4)) {
      uniq.push(pt);
    }
  });

  // Avalia Z
  const points = uniq.map(p => ({
    ...p,
    z: math.round(p.x * parseFloat(objective.x) + p.y * parseFloat(objective.y),6)
  }));

  // Encontra ótimo
  const optimal = points.reduce((acc,c) =>
    type === 'max' ? (c.z > acc.z ? c : acc)
                  : (c.z < acc.z ? c : acc)
  , points[0] || { z: 0 });

  // Limites do gráfico
  const maxX = Math.max(...axesPoints.map(p=>p.x), ...uniq.map(p=>p.x)) * 1.1;
  const maxY = Math.max(...axesPoints.map(p=>p.y), ...uniq.map(p=>p.y)) * 1.1;

  // Linhas para cada restrição (pontos de extremidade)
  const lines = constraints.map(c => {
    const a = parseFloat(c.x), b = parseFloat(c.y), v = parseFloat(c.value);
    const p1 = { x: 0, y: b !== 0 ? v/b : maxY };
    const p2 = { x: a !== 0 ? v/a : maxX, y: 0 };
    return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, sign: c.sign };
  });

  return { points, optimal, lines, bounds: { maxX, maxY } };
}
