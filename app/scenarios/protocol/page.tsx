'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtocolForm from '@/components/forms/ProtocolForm';
import ScenarioForm from '@/components/forms/ScenarioForm';
import { supabase } from '@/lib/supabaseClient';
import { ChevronUpIcon, ChevronDownIcon, MagnifyingGlassIcon, DocumentTextIcon, ArrowPathIcon, UserGroupIcon, UserIcon, BeakerIcon, ArrowLongRightIcon } from '@heroicons/react/24/outline';

export default function ProtocolPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get('id');
  const projectId = searchParams.get('project');
  
  const [scenario, setScenario] = useState<any>(null);
  const [companyId, setCompanyId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for clinical trials import
  const [nctId, setNctId] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [trialData, setTrialData] = useState<any>(null);
  
  // States for imported data (without saving to database)
  const [importedData, setImportedData] = useState<any>(null);
  
  // Form state
  const [inclusionCriteria, setInclusionCriteria] = useState('');
  const [sampleSize, setSampleSize] = useState('0');
  const [investigationalArm, setInvestigationalArm] = useState('');
  const [controlArm, setControlArm] = useState('');
  const [primaryEndPoint, setPrimaryEndPoint] = useState('');
  const [secondaryEndPoint, setSecondaryEndPoint] = useState('');
  const [exploratoryEndPoint, setExploratoryEndPoint] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  
  // State for UI sections
  const [expandedSections, setExpandedSections] = useState({
    importSection: true,
    protocolForm: true
  });

  // Toggle a section's expanded state
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      // Get company ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('user_id', session.user.id)
        .single();

      if (userError) {
        setError('Error fetching user data');
        setLoading(false);
        return;
      }

      setCompanyId(userData.company_id);

      if (scenarioId) {
        // Fetch scenario data
        const { data, error } = await supabase
          .from('scenarios')
          .select('*')
          .eq('id', scenarioId)
          .single();

        if (error) {
          setError('Error fetching scenario data');
        } else {
          setScenario(data);
          setInclusionCriteria(data.inclusion_criteria || '');
          setSampleSize(data.sample_size?.toString() || '0');
          setInvestigationalArm(data.investigational_arm || '');
          setControlArm(data.control_arm || '');
          setPrimaryEndPoint(data.primary_end_point || '');
          setSecondaryEndPoint(data.secondary_end_point || '');
          setExploratoryEndPoint(data.exploratory_end_point || '');
          setStatus(data.status || '');
          setStartDate(data.start_date || '');
          setEndDate(data.end_date || '');
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [scenarioId, projectId, router]);

  // Update form fields when imported data changes
  useEffect(() => {
    if (importedData) {
      if (importedData.inclusionCriteria !== undefined) {
        setInclusionCriteria(importedData.inclusionCriteria);
      }
      
      if (importedData.sampleSize !== undefined && importedData.sampleSize !== null) {
        setSampleSize(importedData.sampleSize.toString());
      }
      
      if (importedData.investigationalArm !== undefined) {
        setInvestigationalArm(importedData.investigationalArm);
      }
      
      if (importedData.controlArm !== undefined) {
        setControlArm(importedData.controlArm);
      }
      
      if (importedData.primaryEndPoint !== undefined) {
        setPrimaryEndPoint(importedData.primaryEndPoint);
      }
      
      if (importedData.secondaryEndPoint !== undefined) {
        setSecondaryEndPoint(importedData.secondaryEndPoint);
      }
      
      if (importedData.status !== undefined) {
        setStatus(importedData.status);
      }
      
      if (importedData.startDate !== undefined) {
        setStartDate(importedData.startDate);
      }
      
      if (importedData.endDate !== undefined) {
        setEndDate(importedData.endDate);
      }
    }
  }, [importedData]);

  const handleScenarioCreated = (newScenario: any) => {
    setScenario(newScenario);
    router.push(`/scenarios/protocol?id=${newScenario.id}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    setFormSuccess(false);

    try {
      // Format dates properly for PostgreSQL
      // If date is empty, set to null. Otherwise, ensure it's in YYYY-MM-DD format
      const formattedStartDate = !startDate ? null : startDate.trim() === '' ? null : startDate;
      const formattedEndDate = !endDate ? null : endDate.trim() === '' ? null : endDate;

      const { error } = await supabase
        .from('scenarios')
        .update({
          inclusion_criteria: inclusionCriteria,
          sample_size: parseInt(sampleSize) || 0,
          investigational_arm: investigationalArm,
          control_arm: controlArm,
          primary_end_point: primaryEndPoint,
          secondary_end_point: secondaryEndPoint,
          exploratory_end_point: exploratoryEndPoint,
          status: status,
          start_date: formattedStartDate,
          end_date: formattedEndDate
        })
        .eq('id', scenario.id);

      if (error) {
        throw error;
      }

      setFormSuccess(true);
      
    // Refresh scenario data
      const { data } = await supabase
          .from('scenarios')
          .select('*')
        .eq('id', scenario.id)
          .single();

      if (data) {
          setScenario(data);
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while updating the scenario');
    } finally {
      setFormLoading(false);
    }
  };
  
  const fetchClinicalTrialData = async () => {
    if (!nctId.trim()) {
      setImportError('Please enter a valid NCT ID');
      return;
    }
    
    setImportLoading(true);
    setImportError(null);
    setImportSuccess(false);
    setImportedData(null);
    
    try {
      const formattedNctId = nctId.trim().toUpperCase();
      const response = await fetch(`https://clinicaltrials.gov/api/v2/studies/${formattedNctId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data for NCT ID: ${formattedNctId}`);
      }
      
      const data = await response.json();
      setTrialData(data);
      
      // Extract and format the data
      const extractedData = extractTrialData(data);
      
      // Store the extracted data in state (without saving to database)
      setImportedData(extractedData);
      
      // Log the extracted data for debugging
      console.log('Extracted data:', extractedData);
      
      setImportSuccess(true);
    } catch (err: any) {
      console.error('Error importing clinical trial data:', err);
      setImportError(err.message || 'Error importing clinical trial data');
    } finally {
      setImportLoading(false);
    }
  };
  
  const extractTrialData = (data: any) => {
    // Default empty values
    const result = {
      inclusionCriteria: '',
      exclusionCriteria: '',
      sampleSize: null as number | null,
      investigationalArm: '',
      controlArm: '',
      primaryEndPoint: '',
      secondaryEndPoint: '',
      status: '',
      startDate: '',
      endDate: ''
    };
    
    try {
      // Extract inclusion and exclusion criteria
      if (data.protocolSection?.eligibilityModule?.eligibilityCriteria) {
        const criteriaText = data.protocolSection.eligibilityModule.eligibilityCriteria;
        const parts = criteriaText.split(/Exclusion Criteria:|exclusion criteria:/i);
        
        if (parts.length > 0) {
          const inclusionPart = parts[0].replace(/Inclusion Criteria:|inclusion criteria:/i, '').trim();
          result.inclusionCriteria = inclusionPart;
          
          if (parts.length > 1) {
            result.exclusionCriteria = parts[1].trim();
          }
        }
      }
      
      // Extract sample size - careful parsing to avoid NaN values
      if (data.protocolSection?.designModule?.enrollmentInfo?.count) {
        const count = data.protocolSection.designModule.enrollmentInfo.count;
        const parsedCount = typeof count === 'number' ? count : parseInt(count, 10);
        
        // Only assign if it's a valid number
        if (!isNaN(parsedCount)) {
          result.sampleSize = parsedCount;
        }
      }
      
      // Extract status
      if (data.protocolSection?.statusModule?.overallStatus) {
        result.status = data.protocolSection.statusModule.overallStatus;
      }
      
      // Extract start date - ensure PostgreSQL-compatible format
      if (data.protocolSection?.statusModule?.startDateStruct?.date) {
        // Try to format the date as YYYY-MM-DD
        try {
          const dateStr = data.protocolSection.statusModule.startDateStruct.date;
          // If it's already in YYYY-MM-DD format, use it as is
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            result.startDate = dateStr;
          } else {
            // Try to parse the date and format it
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              result.startDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
            }
          }
        } catch (err) {
          console.error('Error parsing start date:', err);
        }
      }
      
      // Extract end date - ensure PostgreSQL-compatible format
      if (data.protocolSection?.statusModule?.completionDateStruct?.date) {
        try {
          const dateStr = data.protocolSection.statusModule.completionDateStruct.date;
          // If it's already in YYYY-MM-DD format, use it as is
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            result.endDate = dateStr;
          } else {
            // Try to parse the date and format it
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              result.endDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
            }
          }
        } catch (err) {
          console.error('Error parsing end date:', err);
        }
      }
      
      // Extract arms
      if (data.protocolSection?.armsInterventionsModule?.armGroups && 
          data.protocolSection.armsInterventionsModule.armGroups.length > 0) {
        
        // First arm as investigational
        const firstArm = data.protocolSection.armsInterventionsModule.armGroups[0];
        result.investigationalArm = `${firstArm.label || ''}: ${firstArm.description || ''}`.trim();
        
        // Rest of arms as control
        if (data.protocolSection.armsInterventionsModule.armGroups.length > 1) {
          const controlArms = data.protocolSection.armsInterventionsModule.armGroups
            .slice(1)
            .map((arm: any) => `${arm.label || ''}: ${arm.description || ''}`.trim())
            .join('\n\n');
          
          result.controlArm = controlArms;
        }
      }
      
      // Extract primary outcomes
      if (data.protocolSection?.outcomesModule?.primaryOutcomes && 
          data.protocolSection.outcomesModule.primaryOutcomes.length > 0) {
        
        const primaryOutcomes = data.protocolSection.outcomesModule.primaryOutcomes
          .map((outcome: any) => outcome.measure || '')
          .filter((measure: string) => measure.trim() !== '')
          .join('\n\n');
        
        result.primaryEndPoint = primaryOutcomes;
      }
      
      // Extract secondary outcomes
      if (data.protocolSection?.outcomesModule?.secondaryOutcomes && 
          data.protocolSection.outcomesModule.secondaryOutcomes.length > 0) {
        
        const secondaryOutcomes = data.protocolSection.outcomesModule.secondaryOutcomes
          .map((outcome: any) => outcome.measure || '')
          .filter((measure: string) => measure.trim() !== '')
          .join('\n\n');
        
        result.secondaryEndPoint = secondaryOutcomes;
      }
    } catch (err) {
      console.error('Error extracting trial data:', err);
    }
    
    return result;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If we have a scenario, show protocol form. Otherwise, show create scenario form.
  return (
    <div className="max-w-7xl mx-auto">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {scenario ? (
        <>
          
          {/* Import from ClinicalTrials.gov */}
          <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
            <div 
              className="bg-blue-600 p-4 flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('importSection')}
            >
              <div className="flex items-center text-white">
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Import from ClinicalTrials.gov</h3>
              </div>
              {expandedSections.importSection ? 
                <ChevronUpIcon className="h-5 w-5 text-white" /> : 
                <ChevronDownIcon className="h-5 w-5 text-white" />
              }
            </div>
            
            {expandedSections.importSection && (
              <div className="p-5">
                <p className="text-sm text-gray-600 mb-4">
                  Enter an NCT ID to import data from ClinicalTrials.gov. Data will be displayed in the form below without saving to the database until you explicitly save it.
                </p>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={nctId}
                    onChange={(e) => setNctId(e.target.value)}
                    placeholder="e.g. NCT00294736"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={fetchClinicalTrialData}
                    disabled={importLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                  >
                    {importLoading ? 'Importing...' : 'Import Trial Data'}
                  </button>
                </div>
                
                {importError && (
                  <div className="mt-3 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
                    {importError}
                  </div>
                )}
                
                {importSuccess && (
                  <div className="mt-3 p-3 text-sm text-green-600 bg-green-50 border border-green-100 rounded-md">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Data imported successfully! Review the data in the form below and save if desired.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Protocol Elements Form */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div 
              className="bg-blue-600 p-4 flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('protocolForm')}
            >
              <div className="flex items-center text-white">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Protocol Elements Form</h3>
              </div>
              {expandedSections.protocolForm ? 
                <ChevronUpIcon className="h-5 w-5 text-white" /> : 
                <ChevronDownIcon className="h-5 w-5 text-white" />
              }
            </div>
            
            {expandedSections.protocolForm && (
              <div className="p-6">
                {formSuccess && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
                    Protocol elements saved successfully!
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Left column */}
                    <div>
                      <div className="mb-6">
                        <div className="flex items-center mb-2">
                          <UserIcon className="h-5 w-5 text-orange-500 mr-2" />
                          <label htmlFor="inclusionCriteria" className="block text-sm font-medium text-gray-700">
                            Inclusion Criteria
                          </label>
                        </div>
                        <textarea
                          id="inclusionCriteria"
                          value={inclusionCriteria}
                          onChange={(e) => setInclusionCriteria(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          rows={10}
                        />
                      </div>
                    </div>
                    
                    {/* Right column */}
                    <div>
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <UserGroupIcon className="h-5 w-5 text-blue-500 mr-2" />
                          <label htmlFor="sampleSize" className="block text-sm font-medium text-gray-700">
                            Sample Size
                          </label>
                        </div>
                        <div className="flex">
                          <input
                            id="sampleSize"
                            type="number"
                            min="0"
                            value={sampleSize}
                            onChange={(e) => setSampleSize(e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            Participants
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <div className="flex items-center mb-2">
                          <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                        </div>
                        
                        <select
                          id="status"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-3"
                        >
                          <option value="">Select Status</option>
                          <option value="Not yet recruiting">Not yet recruiting</option>
                          <option value="Recruiting">Recruiting</option>
                          <option value="Enrolling by invitation">Enrolling by invitation</option>
                          <option value="Active, not recruiting">Active, not recruiting</option>
                          <option value="Suspended">Suspended</option>
                          <option value="Terminated">Terminated</option>
                          <option value="Completed">Completed</option>
                          <option value="Withdrawn">Withdrawn</option>
                          <option value="Unknown status">Unknown status</option>
                        </select>
                        
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                            <input
                              type="date"
                              value={startDate || ''}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">End Date</label>
                            <input
                              type="date"
                              value={endDate || ''}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center mb-2">
                          <BeakerIcon className="h-5 w-5 text-indigo-500 mr-2" />
                          <label htmlFor="controlArm" className="block text-sm font-medium text-gray-700">
                            Control Arm
                          </label>
                        </div>
                        <textarea
                          id="controlArm"
                          value={controlArm}
                          onChange={(e) => setControlArm(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          rows={5}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <BeakerIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <label htmlFor="investigationalArm" className="block text-sm font-medium text-gray-700">
                        Investigational Arm
                      </label>
                    </div>
                    <textarea
                      id="investigationalArm"
                      value={investigationalArm}
                      onChange={(e) => setInvestigationalArm(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="flex items-center mb-2">
                        <ArrowLongRightIcon className="h-5 w-5 text-purple-600 mr-2" />
                        <label htmlFor="primaryEndPoint" className="block text-sm font-medium text-gray-700">
                          Primary endpoint
                        </label>
                      </div>
                      <textarea
                        id="primaryEndPoint"
                        value={primaryEndPoint}
                        onChange={(e) => setPrimaryEndPoint(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-2">
                        <ArrowLongRightIcon className="h-5 w-5 text-indigo-600 mr-2" />
                        <label htmlFor="secondaryEndPoint" className="block text-sm font-medium text-gray-700">
                          Secondary endpoint
                        </label>
                      </div>
                      <textarea
                        id="secondaryEndPoint"
                        value={secondaryEndPoint}
                        onChange={(e) => setSecondaryEndPoint(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <ArrowLongRightIcon className="h-5 w-5 text-teal-600 mr-2" />
                      <label htmlFor="exploratoryEndPoint" className="block text-sm font-medium text-gray-700">
                        Exploratory endpoint
                      </label>
                    </div>
                    <textarea
                      id="exploratoryEndPoint"
                      value={exploratoryEndPoint}
                      onChange={(e) => setExploratoryEndPoint(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none flex items-center"
                      disabled={formLoading}
                    >
                      {formLoading ? (
                        <>
                          <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Protocol Elements'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </>
      ) : projectId ? (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Create New Scenario</h2>
          </div>
          
          <ScenarioForm 
            projectId={projectId}
            companyId={companyId}
            onSuccess={handleScenarioCreated}
            onCancel={() => router.push('/dashboard')}
          />
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-6">Please select a project first to create a scenario.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition duration-150 ease-in-out"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
} 