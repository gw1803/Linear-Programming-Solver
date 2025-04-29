// src/components/Results.jsx
export default function Results({ result }) {
    if (!result) return null;
  
    const { feasiblePoints, optimalPoint, message } = result;
  
    return (
      <div style={{ marginTop: "2rem" }}>
        <h2>Resultado</h2>
        <p>{message}</p>
  
        {feasiblePoints.length > 0 && (
          <table border="1" cellPadding="8" style={{ marginTop: "1rem", width: "100%", textAlign: "center" }}>
            <thead>
              <tr>
                <th>x</th>
                <th>y</th>
                <th>Z</th>
                <th>Ótimo?</th>
              </tr>
            </thead>
            <tbody>
              {feasiblePoints.map((point, idx) => (
                <tr key={idx} style={point.z === optimalPoint.z ? { backgroundColor: "#d1ffd1", fontWeight: "bold" } : {}}>
                  <td>{point.x.toFixed(2)}</td>
                  <td>{point.y.toFixed(2)}</td>
                  <td>{point.z.toFixed(2)}</td>
                  <td>{point.z === optimalPoint.z ? "✔️" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }
  