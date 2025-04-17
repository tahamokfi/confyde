'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { format, add, parse } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Interface for form data
interface FormData {
  firstSubjectDosed: string; // Date string
  totalEnrollment: number;
  numberOfSites: number;
  activationDuration: number; // in months
  screeningRate: number; // patients per site per month
  screenFailureRate: number; // percentage as decimal (0.38 for 38%)
}

// Interface for table row
interface EnrollmentRow {
  month: number;
  date: string; // formatted as 'MMM-yyyy'
  siteActivation: number;
  activationCumulative: number;
  screeningMonthly: number;
  screeningCumulative: number;
  enrollment: number;
  enrollmentCumulative: number;
}

export default function EnrollmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get('id');
  const projectId = searchParams.get('project');
  
  // State
  const [formData, setFormData] = useState<FormData>({
    firstSubjectDosed: format(new Date(), 'yyyy-MM-dd'), // Default to today's date
    totalEnrollment: 100, // Default enrollment number
    numberOfSites: 350,
    activationDuration: 8,
    screeningRate: 0.44,
    screenFailureRate: 0.38
  });
  const [enrollmentTable, setEnrollmentTable] = useState<EnrollmentRow[]>([]);
  const [enrollmentRate, setEnrollmentRate] = useState<number>(0);
  const [activationRate, setActivationRate] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [calculatingTable, setCalculatingTable] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isTableExpanded, setIsTableExpanded] = useState<boolean>(false);

  // Fetch scenario data
  useEffect(() => {
    const fetchScenarioData = async () => {
      if (!scenarioId) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('scenarios')
          .select('*')
          .eq('id', scenarioId)
          .single();
        
        if (error) throw error;
        
        // Update form data with values from database
        if (data) {
          setFormData(prevData => ({
            ...prevData,
            // Only update if data exists, otherwise keep defaults
            firstSubjectDosed: data.start_date || prevData.firstSubjectDosed,
            totalEnrollment: data.sample_size || prevData.totalEnrollment
          }));
        }
      } catch (error: any) {
        setError(error.message);
        console.error('Error fetching scenario data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchScenarioData();
  }, [scenarioId]);

  // Auto-generate enrollment table when component loads
  useEffect(() => {
    // Only generate table once loading is complete and we have necessary data
    if (!loading && formData.firstSubjectDosed && formData.totalEnrollment > 0) {
      // Use a slight delay to ensure all state updates are processed
      const timer = setTimeout(() => {
        try {
          generateEnrollmentTable();
        } catch (error) {
          console.error('Error auto-generating enrollment table:', error);
          // Don't set error state to avoid showing error messages on initial load
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [loading, formData.firstSubjectDosed, formData.totalEnrollment]);

  // Calculate derived values whenever form data changes
  useEffect(() => {
    // Calculate enrollment rate = screening rate * (1 - screen failure rate)
    const calculatedEnrollmentRate = formData.screeningRate * (1 - formData.screenFailureRate);
    setEnrollmentRate(calculatedEnrollmentRate);
    
    // Calculate activation rate = number of sites / activation duration (rounded up)
    const calculatedActivationRate = Math.ceil(formData.numberOfSites / formData.activationDuration);
    setActivationRate(calculatedActivationRate);
    
  }, [formData]);

  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    // Convert percentage inputs to decimal for internal calculations
    if (name === 'screenFailureRate' && type === 'number') {
      const decimalValue = parseFloat(value) / 100;
      setFormData(prev => ({ ...prev, [name]: decimalValue }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  // Generate enrollment table
  const generateEnrollmentTable = () => {
    if (!formData.firstSubjectDosed || formData.totalEnrollment <= 0) {
      setError('Please enter first subject dosed date and total enrollment');
      return;
    }
    
    setCalculatingTable(true);
    setError(null);
    
    try {
      // Calculate total patients to be screened based on failure rate
      const totalScreened = formData.totalEnrollment / (1 - formData.screenFailureRate);
      
      // Parse the start date
      const startDate = new Date(formData.firstSubjectDosed);
      
      // Initialize table
      const table: EnrollmentRow[] = [];
      let month = 1;
      let activationCumulative = 0;
      let screeningCumulative = 0;
      let enrollmentCumulative = 0;
      let targetReachedMonth = 0;
      
      // Continue adding rows until enrollment target is reached
      while (enrollmentCumulative < formData.totalEnrollment) {
        // Calculate date for this month
        const currentDate = add(startDate, { months: month - 1 });
        const formattedDate = format(currentDate, 'MMM-yyyy');
        
        // Calculate site activation for this month based on the rules
        let siteActivation;
        if (month === 1) {
          siteActivation = 0;
        } else if (month === 2) {
          siteActivation = Math.ceil(activationRate / 4);
        } else if (month === 3) {
          siteActivation = Math.ceil(activationRate / 3);
        } else if (month === 4) {
          siteActivation = Math.ceil(activationRate / 2);
        } else {
          siteActivation = Math.ceil(activationRate);
        }
        
        // Cap site activation at the total number of sites
        if (activationCumulative + siteActivation > formData.numberOfSites) {
          activationCumulative = formData.numberOfSites;
        }else{
          activationCumulative += siteActivation;
        }
        
        // Calculate screening for this month
        const screeningMonthly = formData.screeningRate * activationCumulative;
        
        // Check if we're about to exceed total screening needed
        if (screeningCumulative  > totalScreened) {
          // Cap the monthly screening to what's needed
          const remainingScreening = totalScreened - screeningCumulative;
          screeningCumulative = totalScreened;
          // Adjust enrollment based on capped screening
          const monthlyEnrollment = remainingScreening * (1 - formData.screenFailureRate);
          enrollmentCumulative += monthlyEnrollment;
          
          // Add row to table
          table.push({
            month,
            date: formattedDate,
            siteActivation,
            activationCumulative: Math.round(activationCumulative),
            screeningMonthly: Math.round(remainingScreening),
            screeningCumulative: Math.round(screeningCumulative),
            enrollment: Math.round(monthlyEnrollment),
            enrollmentCumulative: Math.round(enrollmentCumulative)
          });
          
          // Target must be reached when total screening is complete
          targetReachedMonth = month;
          break;
        } else {
          // Normal calculation if not exceeding total screening
          screeningCumulative += screeningMonthly;
          
          // Calculate enrollment for this month
          const monthlyEnrollment = screeningMonthly * (1 - formData.screenFailureRate);
          enrollmentCumulative += monthlyEnrollment;
          
          // Check if we've reached the target
          if (enrollmentCumulative >= formData.totalEnrollment && targetReachedMonth === 0) {
            targetReachedMonth = month;
            // Cap final enrollment at target
            if (enrollmentCumulative > formData.totalEnrollment) {
              enrollmentCumulative = formData.totalEnrollment;
            }
          }
          
          // Add row to table
          table.push({
            month,
            date: formattedDate,
            siteActivation: Math.round(siteActivation),
            activationCumulative: Math.round(activationCumulative),
            screeningMonthly: Math.round(screeningMonthly),
            screeningCumulative: Math.round(screeningCumulative),
            enrollment: Math.round(monthlyEnrollment),
            enrollmentCumulative: Math.round(enrollmentCumulative)
          });
        }
        
        // Increment month for next iteration
        month++;
        
        // Safety valve to prevent infinite loops (e.g., if enrollment rate is too low)
        if (month > 240) { // 20 years as a reasonable upper limit
          setError('Enrollment projection exceeds 20 years. Please check your inputs.');
          break;
        }
      }
      
      
      setEnrollmentTable(table);
    } catch (error: any) {
      setError(`Error generating table: ${error.message}`);
      console.error('Error generating enrollment table:', error);
    } finally {
      setCalculatingTable(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    generateEnrollmentTable();
  };

  // Format a number to fixed decimal places with proper rounding
  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toFixed(decimals);
  };

  // Show percentage
  const formatPercent = (decimal: number): string => {
    return `${(decimal * 100).toFixed(0)}%`;
  };

  // Function to toggle table expansion state
  const toggleTableExpansion = () => {
    setIsTableExpanded(!isTableExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-4 px-4 sm:px-6 lg:px-4 py-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Enrollment Projections</h1>
      
      {/* Two-column layout for input form and chart */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Left column - Input form */}
        <div className="w-full lg:w-5/12">
          <div className="bg-white shadow rounded-lg overflow-hidden h-full">
            
            
            <div className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Fields loaded from protocol section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center border-l-4 border-blue-500 pl-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Imported Values
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-md">
                    {/* First Subject Dosed */}
                    <div className="relative md:col-span-2">
                      <label htmlFor="firstSubjectDosed" className="block text-xs font-medium text-gray-700 mb-1">
                        First Subject Dosed Date
                      </label>
                      <input
                        type="date"
                        id="firstSubjectDosed"
                        name="firstSubjectDosed"
                        value={formData.firstSubjectDosed}
                        onChange={handleInputChange}
                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500 italic">From protocol</p>
                    </div>
                    
                    {/* Total Enrollment */}
                    <div className="relative md:col-span-2">
                      <label htmlFor="totalEnrollment" className="block text-xs font-medium text-gray-700 mb-1">
                        Enrollment Target
                      </label>
                      <input
                        type="number"
                        id="totalEnrollment"
                        name="totalEnrollment"
                        value={formData.totalEnrollment || ''}
                        onChange={handleInputChange}
                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        min="1"
                        step="1"
                      />
                      <p className="mt-1 text-xs text-gray-500 italic">From sample size</p>
                    </div>
                  </div>
                </div>
                
                {/* User Input Fields */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center border-l-4 border-green-500 pl-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Required Inputs
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Number of Sites */}
                    <div className="p-2 border border-green-100 rounded-md bg-green-50">
                      <label htmlFor="numberOfSites" className="block text-xs font-medium text-gray-700 mb-1">
                        Number of Sites
                      </label>
                      <input
                        type="number"
                        id="numberOfSites"
                        name="numberOfSites"
                        value={formData.numberOfSites || ''}
                        onChange={handleInputChange}
                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                        min="1"
                        step="1"
                      />
                    </div>
                    
                    {/* Activation Duration */}
                    <div className="p-2 border border-green-100 rounded-md bg-green-50">
                      <label htmlFor="activationDuration" className="block text-xs font-medium text-gray-700 mb-1">
                        Activation (months)
                      </label>
                      <input
                        type="number"
                        id="activationDuration"
                        name="activationDuration"
                        value={formData.activationDuration || ''}
                        onChange={handleInputChange}
                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                        min="1"
                        step="1"
                      />
                    </div>
                    
                    {/* Screening Rate */}
                    <div className="p-2 border border-green-100 rounded-md bg-green-50">
                      <label htmlFor="screeningRate" className="block text-xs font-medium text-gray-700 mb-1">
                        Screening Rate (p/s/m)
                      </label>
                      <input
                        type="number"
                        id="screeningRate"
                        name="screeningRate"
                        value={formData.screeningRate || ''}
                        onChange={handleInputChange}
                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                        min="0.01"
                        step="0.01"
                      />
                    </div>
                    
                    {/* Screening failure rate */}
                    <div className="p-2 border border-green-100 rounded-md bg-green-50">
                      <label htmlFor="screenFailureRate" className="block text-xs font-medium text-gray-700 mb-1">
                        Screen Failure Rate (%)
                      </label>
                      <input
                        type="number"
                        id="screenFailureRate"
                        name="screenFailureRate"
                        value={(formData.screenFailureRate * 100) || ''}
                        onChange={handleInputChange}
                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                        min="0"
                        max="100"
                        step="1"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Calculated Values */}
                <div className="border-t border-gray-200 pt-3">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center border-l-4 border-purple-500 pl-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Calculated Values
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-purple-50 p-2 rounded-md border border-purple-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs font-medium text-gray-500">Enrollment Rate</p>
                          <p className="text-lg font-bold text-purple-700">{formatNumber(enrollmentRate)}</p>
                        </div>
                        <div className="bg-purple-100 rounded-full p-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-2 rounded-md border border-purple-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs font-medium text-gray-500">Activation Rate</p>
                          <p className="text-lg font-bold text-purple-700">{formatNumber(activationRate, 0)}</p>
                        </div>
                        <div className="bg-purple-100 rounded-full p-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* New calculated values */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-indigo-50 p-2 rounded-md border border-indigo-100">
                      <div className="flex items-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs font-medium text-gray-500">Enrollment Duration</p>
                      </div>
                      <p className="text-lg font-bold text-indigo-700">
                        {enrollmentTable.length > 0 
                          ? `${enrollmentTable.findIndex(row => row.enrollmentCumulative >= formData.totalEnrollment) + 1} months` 
                          : '-'}
                      </p>
                    </div>
                    
                    <div className="bg-indigo-50 p-2 rounded-md border border-indigo-100">
                      <div className="flex items-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs font-medium text-gray-500">Last Subject Dosed</p>
                      </div>
                      <p className="text-lg font-bold text-indigo-700">
                        {enrollmentTable.length > 0 && formData.firstSubjectDosed
                          ? format(
                              add(new Date(formData.firstSubjectDosed), { 
                                months: enrollmentTable.findIndex(row => row.enrollmentCumulative >= formData.totalEnrollment)
                              }),
                              'MMM d, yyyy'
                            )
                          : '-'}
                      </p>
                    </div>
                    
                    <div className="bg-indigo-50 p-2 rounded-md border border-indigo-100">
                      <div className="flex items-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-xs font-medium text-gray-500">Total Screened</p>
                      </div>
                      <p className="text-lg font-bold text-indigo-700">
                        {formatNumber(formData.totalEnrollment / (1 - formData.screenFailureRate), 0)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                    disabled={calculatingTable}
                  >
                    {calculatingTable ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Calculating...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Right column - Chart (only shown when data is available) */}
        <div className="w-full lg:w-7/12">
          {enrollmentTable.length > 0 ? (
            <div className="bg-white shadow rounded-lg overflow-hidden h-full">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Enrollment Visualization</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Visual projection showing enrollment progress over time
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-b from-white to-blue-50 flex-grow">
                <div className="h-[400px]">
                  <Line 
                    data={{
                      labels: enrollmentTable.map(row => row.date),
                      datasets: [
                        {
                          label: 'Target Enrollment',
                          data: enrollmentTable.map(() => formData.totalEnrollment),
                          borderColor: 'rgba(239, 68, 68, 0.7)', // red-500 with transparency
                          backgroundColor: 'rgba(239, 68, 68, 0.05)',
                          borderWidth: 2,
                          borderDash: [6, 6],
                          fill: false,
                          pointRadius: 0,
                          pointHoverRadius: 0,
                          tension: 0
                        },
                        {
                          label: 'Cumulative Screening',
                          data: enrollmentTable.map(row => row.screeningCumulative),
                          borderColor: 'rgb(59, 130, 246)', // blue-500
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderWidth: 3,
                          tension: 0.3,
                          fill: true,
                          pointRadius: 0,
                          pointHoverRadius: 6,
                          pointBackgroundColor: 'white',
                          pointBorderWidth: 2,
                          pointBorderColor: 'rgb(59, 130, 246)'
                        },
                        {
                          label: 'Cumulative Enrollment',
                          data: enrollmentTable.map(row => row.enrollmentCumulative),
                          borderColor: 'rgb(16, 185, 129)', // green-500
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          borderWidth: 3,
                          tension: 0.3,
                          fill: true,
                          pointRadius: 0,
                          pointHoverRadius: 6,
                          pointBackgroundColor: 'white',
                          pointBorderWidth: 2,
                          pointBorderColor: 'rgb(16, 185, 129)'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: 'index',
                        intersect: false,
                      },
                      plugins: {
                        legend: {
                          position: 'top',
                          align: 'end',
                          labels: {
                            usePointStyle: true,
                            boxWidth: 8,
                            padding: 15
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          titleColor: '#111827', // gray-900
                          bodyColor: '#374151', // gray-700
                          borderColor: '#E5E7EB', // gray-200
                          borderWidth: 1,
                          padding: 12,
                          boxPadding: 6,
                          usePointStyle: true,
                          callbacks: {
                            title: function(context) {
                              // Format the tooltip title to show month and year
                              return context[0].label;
                            },
                            label: function(context) {
                              // Custom labels for different datasets
                              let label = context.dataset.label || '';
                              let value = context.parsed.y.toFixed(1);
                              
                              if (label === 'Target Enrollment') {
                                return `${label}: ${value} patients`;
                              } else if (label === 'Cumulative Screening') {
                                return `${label}: ${value} patients (${Math.round(context.parsed.y / formData.totalEnrollment * 100)}% of target)`;
                              } else if (label === 'Cumulative Enrollment') {
                                return `${label}: ${value} patients (${Math.round(context.parsed.y / formData.totalEnrollment * 100)}% of target)`;
                              }
                              return `${label}: ${value}`;
                            },
                            labelTextColor: function(context) {
                              // Color the text based on the dataset
                              if (context.dataset.label === 'Target Enrollment') {
                                return 'rgb(239, 68, 68)'; // red-500
                              } else if (context.dataset.label === 'Cumulative Screening') {
                                return 'rgb(59, 130, 246)'; // blue-500
                              } else if (context.dataset.label === 'Cumulative Enrollment') {
                                return 'rgb(16, 185, 129)'; // green-500
                              }
                              return '#374151'; // Default gray-700
                            }
                          }
                        },
                      },
                      animations: {
                        tension: {
                          duration: 1000,
                          easing: 'linear',
                          from: 0.5,
                          to: 0.3,
                          loop: false
                        }
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: 'Month-Year',
                            font: {
                              weight: 'bold'
                            }
                          },
                          grid: {
                            display: false
                          },
                          ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                          }
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'Cumulative Patient Count',
                            font: {
                              weight: 'bold'
                            }
                          },
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                          },
                          ticks: {
                            callback: function(value) {
                              return value;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              
              {/* Chart Legend and Key Information */}
              <div className="px-4 py-3 bg-gray-50 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-1 bg-red-500 mr-1 border-dashed border-t-2 border-red-500"></div>
                  <span className="text-gray-500 mr-2">
                    Target: {formData.totalEnrollment}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                  <span className="text-gray-500 mr-2">
                    Enrollment: {formatNumber(enrollmentTable[enrollmentTable.length - 1].enrollmentCumulative)}
                  </span>
                  
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-1 ml-2"></div>
                  <span className="text-gray-500">
                    Screening: {formatNumber(enrollmentTable[enrollmentTable.length - 1].screeningCumulative)}
                  </span>
                </div>
                
                <div className="text-gray-500">
                  <span className="font-medium">Time to Target:</span> {enrollmentTable.findIndex(row => row.enrollmentCumulative >= formData.totalEnrollment) + 1} months
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 flex items-center justify-center h-full">
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No Projections Yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Fill in the parameters and generate projections to see the enrollment chart here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Full-width enrollment table (below the two-column layout) */}
      {enrollmentTable.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Enrollment Projections Table</h2>
              <p className="mt-1 text-sm text-gray-500">
                Projected {enrollmentTable.length - 5} months to reach {formData.totalEnrollment} enrolled subjects
                {enrollmentTable.length > 15 && !isTableExpanded && " (showing first 10 and last 5 months)"}
              </p>
            </div>
            <button
              onClick={toggleTableExpansion}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isTableExpanded ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Collapse
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Expand
                </>
              )}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 shadow-sm">Month</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site Activation</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activation Cumul.</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Screening Monthly</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Screening Cumul.</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment Cumul.</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollmentTable
                  .filter((row, index, array) => {
                    // If expanded, show all rows
                    if (isTableExpanded) return true;
                    
                    // If not expanded and array is small, show all rows
                    if (array.length <= 15) return true;
                    
                    // Otherwise, show first 10 and last 5 rows
                    return index < 10 || index >= array.length - 5;
                  })
                  .map((row, index, filteredArray) => {
                    // Add a visual separator if we're showing a non-continuous set
                    const showSeparator = !isTableExpanded && enrollmentTable.length > 15 && index === 9 && filteredArray.length > 10;
                    
                    return (
                      <React.Fragment key={row.month}>
                        {showSeparator && (
                          <tr className="bg-gray-50">
                            <td colSpan={8} className="px-3 py-1 text-center text-xs text-gray-500 italic">
                              ... {enrollmentTable.length - 15} months hidden ...
                            </td>
                          </tr>
                        )}
                        <tr className={`${row.enrollmentCumulative >= formData.totalEnrollment ? 'bg-green-50' : ''} 
                                        ${row.month > enrollmentTable.length - 6 ? 'bg-blue-50' : ''} 
                                        hover:bg-gray-50 transition-colors duration-150`}>
                          <td className="px-3 py-1.5 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-inherit z-10 shadow-sm">
                            {row.month}
                          </td>
                          <td className="px-3 py-1.5 whitespace-nowrap text-sm text-gray-900">{row.date}</td>
                          <td className="px-3 py-1.5 whitespace-nowrap text-sm text-gray-900">{formatNumber(row.siteActivation, 0)}</td>
                          <td className="px-3 py-1.5 whitespace-nowrap text-sm text-gray-900">{formatNumber(row.activationCumulative, 0)}</td>
                          <td className="px-3 py-1.5 whitespace-nowrap text-sm text-gray-900">{formatNumber(row.screeningMonthly, 0)}</td>
                          <td className="px-3 py-1.5 whitespace-nowrap text-sm text-gray-900">{formatNumber(row.screeningCumulative, 0)}</td>
                          <td className="px-3 py-1.5 whitespace-nowrap text-sm text-gray-900">{formatNumber(row.enrollment, 0)}</td>
                          <td className="px-3 py-1.5 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatNumber(row.enrollmentCumulative, 0)}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 