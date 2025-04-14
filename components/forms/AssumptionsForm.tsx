import React, { ChangeEvent } from 'react';
import { FormData } from '@/app/scenarios/sample-size/page'; // Assuming interfaces are in App.tsx or a types file

interface AssumptionsFormProps {
  formData: Pick<
    FormData,
    | 'measure'
    | 'value1'
    | 'value2'
    | 'dropoutRate1'
    | 'dropoutRate2'
    | 'accrualTime'
    | 'accrualIntensity'
  >;
  validationErrors: Record<string, string>;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const AssumptionsForm: React.FC<AssumptionsFormProps> = ({
  formData,
  validationErrors,
  handleInputChange,
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Assumptions</h2>

      {/* Parameter */}
      <div>
        <label htmlFor="measure" className="block text-sm font-medium text-gray-700">Parameter</label>
        <select id="measure" name="measure" value={formData.measure} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          <option value={1}>Median Survival</option>
          <option value={2}>Hazard Rate</option>
        </select>
      </div>

      {/* Treatment Arm Value */}
      <div>
        <label htmlFor="value1" className="block text-sm font-medium text-gray-700">Treatment Arm Value ({formData.measure === 1 ? 'Median Survival' : 'Hazard Rate'})</label>
        <input type="number" id="value1" name="value1" value={formData.value1} onChange={handleInputChange} step="any" min="0.0001" placeholder="e.g., 10.5" className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${validationErrors.value1 ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
        {validationErrors.value1 && <p className="mt-1 text-xs text-red-600">{validationErrors.value1}</p>}
      </div>

      {/* Control Arm Value */}
      <div>
        <label htmlFor="value2" className="block text-sm font-medium text-gray-700">Control Arm Value ({formData.measure === 1 ? 'Median Survival' : 'Hazard Rate'})</label>
        <input type="number" id="value2" name="value2" value={formData.value2} onChange={handleInputChange} step="any" min="0.0001" placeholder="e.g., 8.0" className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${validationErrors.value2 ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
        {validationErrors.value2 && <p className="mt-1 text-xs text-red-600">{validationErrors.value2}</p>}
      </div>

      {/* Dropout Rates */}
      <div className="space-y-2">
        <label htmlFor="dropoutRate1" className="block text-sm font-medium text-gray-700">Annual Dropout % (Treatment): {Number(formData.dropoutRate1).toFixed(1)}%</label>
        <input type="range" id="dropoutRate1" name="dropoutRate1" min="0" max="50" step="0.1" value={formData.dropoutRate1} onChange={handleInputChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        <label htmlFor="dropoutRate2" className="block text-sm font-medium text-gray-700 pt-2">Annual Dropout % (Control): {Number(formData.dropoutRate2).toFixed(1)}%</label>
        <input type="range" id="dropoutRate2" name="dropoutRate2" min="0" max="50" step="0.1" value={formData.dropoutRate2} onChange={handleInputChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
      </div>

      {/* Accrual Time */}
      <div>
        <label htmlFor="accrualTime" className="block text-sm font-medium text-gray-700">Accrual Period End Times (Months)</label>
        <input type="text" id="accrualTime" name="accrualTime" value={formData.accrualTime} onChange={handleInputChange} placeholder="e.g., 0, 12, 24" className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${validationErrors.accrualTime ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
        {validationErrors.accrualTime && <p className="mt-1 text-xs text-red-600">{validationErrors.accrualTime}</p>}
      </div>

      {/* Accrual Intensity */}
      <div>
        <label htmlFor="accrualIntensity" className="block text-sm font-medium text-gray-700">Accrual Rate per Period (Subj/Month)</label>
        <input type="text" id="accrualIntensity" name="accrualIntensity" value={formData.accrualIntensity} onChange={handleInputChange} placeholder="e.g., 20, 30" className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${validationErrors.accrualIntensity ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
        {validationErrors.accrualIntensity && <p className="mt-1 text-xs text-red-600">{validationErrors.accrualIntensity}</p>}
      </div>
    </div>
  );
};

export default AssumptionsForm;