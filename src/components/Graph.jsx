import React from 'react';
import {
  ResponsiveContainer, ComposedChart, Area, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip} from 'recharts';

export default function Graph({ points, optimal, lines, bounds }) {
  // Ordena pontos para formar polígono viável
  const sorted = [...points].sort(
    (a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x)
  );
  const areaData = sorted.concat(sorted[0]); // fecha polígono

  return (
    <div style={{ width: '100%', height: 300, marginTop: '2rem' }}>
      <ResponsiveContainer>
        <ComposedChart data={areaData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid />
          <XAxis dataKey="x" type="number" domain={[0, bounds.maxX]} />
          <YAxis dataKey="y" type="number" domain={[0, bounds.maxY]} />
          <Tooltip />

          {/* Região viável */}
          <Area
            type="linear"
            dataKey="y"
            baseValue={0}
            isAnimationActive={false}
            dot={false}
            strokeOpacity={0}
            fillOpacity={0.3}
          />

          {/* Linhas de restrição */}
          {lines.map((ln, idx) => (
            <Line
              key={idx}
              type="linear"
              data={[{ x: ln.x1, y: ln.y1 }, { x: ln.x2, y: ln.y2 }]}
              dataKey="y"
              dot={false}
              strokeOpacity={0.6}
            />
          ))}

          {/* Pontos viáveis */}
          <Scatter data={points} fill="#8884d8" />

          {/* Ponto ótimo */}
          <Scatter data={[optimal]} fill="#82ca9d" shape="star" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
