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
