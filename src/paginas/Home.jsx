import { useState } from "react";
import { solveByMath, solveByGraph } from '../utils/solver';
import Results from "../components/Results";
import Graph from "../components/Graph";


export default function Home(){
    const [result, setResult] = useState(null);
    const [graphData, setGraphData] = useState(null);
    const [objective, setObjective] = useState({ x: "", y: "" });
    const [type, setType] = useState('max')
    const [constraints, setConstraints] = useState([
      { x: "", y: "", sign: "<=", value: "" },
    ]);
    const [method, setMethod] = useState("math");
  
    const handleObjectiveChange = (e) => {
      setObjective({ ...objective, [e.target.name]: e.target.value });
    };
  
    const handleConstraintChange = (index, e) => {
      const newConstraints = [...constraints];
      newConstraints[index][e.target.name] = e.target.value;
      setConstraints(newConstraints);
    };

    const handleTypeChange = (e) => {
        setType(e.target.value);
    };
  
    const addConstraint = () => {
      setConstraints([...constraints, { x: "", y: "", sign: "<=", value: "" }]);
    };

    const removeLastConstraint = () => {
        if (constraints.length > 1) {
          setConstraints(constraints.slice(0, -1));
        }
      };
  
      const handleSubmit = e => {
        e.preventDefault();
        const data = { objective, constraints, type, method};
        if (method === 'math') {
          setGraphData(null);
          setResult(solveByMath(data));
        } else {
          const graphRes = solveByGraph(data);
          setResult({ ...graphRes, feasiblePoints: graphRes.points, optimalPoint: graphRes.optimal, message: 'Método gráfico result.' });
          setGraphData(graphRes);
        }
      };

    return(
        
        <div style={{ maxWidth: 600, margin: "0 auto"}}>
  
        <form onSubmit={handleSubmit}>
          <h2>Função Objetivo</h2>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            F = 
            <input
              type="number"
              name="x"
              placeholder="Coeficiente de x"
              value={objective.x}
              onChange={handleObjectiveChange}
              required
            /> x + 
            <input
              type="number"
              name="y"
              placeholder="Coeficiente de y"
              value={objective.y}
              onChange={handleObjectiveChange}
              required
            /> y 
          </div>

          <select
            name="type"
            value={type}
            onChange={(e) => handleTypeChange(e)}
            >
            <option value="max">{"Maximizar"}</option>
            <option value="min">{"Minimizar"}</option>
        </select>
  
          <h2>Restrições</h2>
          {constraints.map((constraint, index) => (
            <div
              key={index}
              style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}
            >
              <input
                type="number"
                name="x"
                placeholder="x"
                value={constraint.x}
                onChange={(e) => handleConstraintChange(index, e)}
                required
              />
              <input
                type="number"
                name="y"
                placeholder="y"
                value={constraint.y}
                onChange={(e) => handleConstraintChange(index, e)}
                required
              />
              <select
                name="sign"
                value={constraint.sign}
                onChange={(e) => handleConstraintChange(index, e)}
              >
                <option value="<=">{"<="}</option>
                <option value=">=">{">="}</option>
                <option value="=">=</option>
              </select>
              <input
                type="number"
                name="value"
                placeholder="valor"
                value={constraint.value}
                onChange={(e) => handleConstraintChange(index, e)}
                required
              />
            </div>
          ))}
          <button type="button" onClick={addConstraint}> Adicionar restrição </button>

          <button type="button" onClick={removeLastConstraint} style={{ marginLeft: "1rem" }}> Remover última restrição </button>

  
          <h2>Método</h2>
          <label>
            <input
              type="radio"
              name="method"
              value="math"
              checked={method === "math"}
              onChange={() => setMethod("math")}
            />
            Matemático
          </label>
          <label style={{ marginLeft: "1rem" }}>
            <input
              type="radio"
              name="method"
              value="graph"
              checked={method === "graph"}
              onChange={() => setMethod("graph")}
            />
            Gráfico
          </label>
  
          <div style={{ marginTop: "1rem" }}>
            <button type="submit">Resolver</button>
          </div>
        </form>
        <Results result={result} />
        {graphData && <Graph {...graphData} />}
      </div>
    );

};