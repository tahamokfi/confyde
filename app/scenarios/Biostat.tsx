import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import './App.css';
import axios, { AxiosError } from 'axios';

const secret = process.env.REACT_APP_ACCESS_SECRET;

// Define interfaces for the form data
interface FormData {
  sided: number;
  alpha: number;
  beta: number;
  kMax: number;
  informationRates: number[];
  design: string;
  measure: number;
  value1: number;
  value2: number;
  dropoutRate1: number;
  dropoutRate2: number;
  accrualTime: number[];
  accrualIntensity: number[];
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    sided: 1,
    alpha: 0.025,
    beta: 0.1,
    kMax: 3,
    informationRates: [0.5, 0.7, 1.0],
    design: "asOF",
    measure: 1,
    value1: 10.5,
    value2: 8.0,
    dropoutRate1: 10.0,
    dropoutRate2: 10.0,
    accrualTime: [0, 18, 30],
    accrualIntensity: [15, 40]
  });

  const [results, setResults] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: Number(value) || value
    });
  };

  const handleArrayInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const arrayValues = value
      .split(',')
      .map(item => parseFloat(item.trim()))
      .filter(num => !isNaN(num));
    setFormData({
      ...formData,
      [name]: arrayValues
    });
  };

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value)
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement> | { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<{ summary: string | object }>(
        'https://drug-discovery-platform-7e07460be23d.herokuapp.com/calculate',
        formData,
        {
          headers: {
            'x-access-secret': secret, // replace with actual secret or use env
          },
        }
      );

      const summary = response.data.summary;
      if (typeof summary === 'string') {
        setResults(summary);
      } else {
        setResults(JSON.stringify(summary, null, 2));
      }

    } catch (err) {
      const error = err as AxiosError<any>;
      const detail = error.response?.data;

      if (typeof detail === 'string') {
        setError(detail);
      } else if (typeof detail === 'object') {
        setError(JSON.stringify(detail, null, 2));
      } else {
        setError("An error occurred while calculating sample size.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSubmit({ preventDefault: () => {} });
  }, []);

  return (
    <div className="container">
      <h1>Sample Size for Group Sequential Design with one Survival Endpoint</h1>

      <div className="row">
        {/* Left Column: Design Features */}
        <div className="column">
          <div className="card">
            <h2>Design features</h2>
            <div className="form-group">
              <label>Alternative hypothesis</label>
              <select name="sided" value={formData.sided} onChange={handleInputChange}>
                <option value={1}>One-sided</option>
                <option value={2}>Two-sided</option>
              </select>
            </div>

            <div className="form-group">
              <label>Type I error (alpha)</label>
              <select name="alpha" value={formData.alpha} onChange={handleInputChange}>
                <option value={0.025}>2.5%</option>
                <option value={0.05}>5%</option>
                <option value={0.1}>10%</option>
              </select>
            </div>

            <div className="form-group">
              <label>Type II error (1 - power)</label>
              <select name="beta" value={formData.beta} onChange={handleInputChange}>
                <option value={0.05}>5%</option>
                <option value={0.1}>10%</option>
                <option value={0.15}>15%</option>
                <option value={0.2}>20%</option>
              </select>
            </div>

            <div className="form-group">
              <label>Number of stages</label>
              <select name="kMax" value={formData.kMax} onChange={handleInputChange}>
                <option value={2}>Two</option>
                <option value={3}>Three</option>
                <option value={4}>Four</option>
              </select>
            </div>

            <div className="form-group">
              <label>Information fraction</label>
              <input 
                type="text" 
                name="informationRates" 
                value={formData.informationRates.join(',')} 
                onChange={handleArrayInputChange}
              />
            </div>

            <div className="form-group">
              <label>Type of design</label>
              <select name="design" value={formData.design} onChange={handleInputChange}>
                <option value="asOF">O'Brien & Fleming type alpha spending</option>
                <option value="OF">O'Brien & Fleming</option>
                <option value="P">Pocock</option>
                <option value="HP">Haybittle & Peto</option>
                <option value="WToptimum">Optimum design within Wang & Tsiatis class</option>
                <option value="asP">Pocock type alpha spending</option>
                <option value="asKD">Kim & DeMets alpha spending</option>
                <option value="asHSD">Hwang, Shi & DeCani alpha spending</option>
                <option value="asUser">User defined alpha spending</option>
                <option value="noEarlyEfficacy">No early efficacy stop</option>
              </select>
            </div>
          </div>
        </div>

        {/* Middle Column: Assumptions */}
        <div className="column">
          <div className="card">
            <h2>Assumptions</h2>

            <div className="form-group">
              <label>Parameter</label>
              <select name="measure" value={formData.measure} onChange={handleInputChange}>
                <option value={1}>Median survival</option>
                <option value={2}>Hazard rate (lambda)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Treatment arm</label>
              <input 
                type="number" 
                name="value1" 
                value={formData.value1} 
                onChange={handleInputChange}
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Control arm</label>
              <input 
                type="number" 
                name="value2" 
                value={formData.value2} 
                onChange={handleInputChange}
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Annual dropout percent of treatment: {formData.dropoutRate1}%</label>
              <input 
                type="range" 
                name="dropoutRate1" 
                min="0" 
                max="100" 
                value={formData.dropoutRate1} 
                onChange={handleSliderChange}
              />
              <div className="slider-labels">
                <span>0</span>
                <span>100</span>
              </div>
            </div>

            <div className="form-group">
              <label>Annual dropout percent of control: {formData.dropoutRate2}%</label>
              <input 
                type="range" 
                name="dropoutRate2" 
                min="0" 
                max="100" 
                value={formData.dropoutRate2} 
                onChange={handleSliderChange}
              />
              <div className="slider-labels">
                <span>0</span>
                <span>100</span>
              </div>
            </div>

            <div className="form-group">
              <label>Enrollment month ranges</label>
              <input 
                type="text" 
                name="accrualTime" 
                value={formData.accrualTime.join(',')} 
                onChange={handleArrayInputChange}
              />
            </div>

            <div className="form-group">
              <label>Monthly enrollment</label>
              <input 
                type="text" 
                name="accrualIntensity" 
                value={formData.accrualIntensity.join(',')} 
                onChange={handleArrayInputChange}
              />
            </div>
          </div>
        </div>

        {/* Wide Column: Output */}
        <div className="column-wide">
          <div className="card">
            <h2>Sample Size Summary of Results</h2>
            <button onClick={handleSubmit} className="calculate-btn">Calculate</button>
            {loading && <p>Calculating...</p>}
            {error && <pre className="error">{error}</pre>}
            {results && <pre className="results">{results}</pre>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
