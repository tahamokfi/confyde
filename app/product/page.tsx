'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductPage() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(false);
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-[#0c323d]">Confyde AI</Link>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#0c323d] hover:text-blue-800"
              >
                Home
              </Link>
              <Link 
                href="/product"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#0c323d] border-b-2 border-blue-500"
              >
                Product
              </Link>
              <Link 
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#0c323d] hover:text-blue-800"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0c323d] hover:bg-[#1c4653]"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0c323d] to-[#1c4653] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              Confyde AI Product Suite
            </h1>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-300">
              Our AI-native platform captures all elements of the investment decision process, 
              enabling improved collaboration and scenario planning.
            </p>
          </div>
        </div>
      </div>
      
      {/* Key Features Section (based on first screenshot) */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              KEY FEATURES
            </h2>
            <div className="w-24 h-1 bg-gray-300 mx-auto mt-4"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-lg p-8 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="mr-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700">
                  Seamless Study Design with Intuitive Data Inputs
                </h3>
              </div>
              
              <ul className="space-y-3 text-gray-600 ml-6 list-disc">
                <li>Start designs from templates and previous studies with pre-populated elements derived from recent benchmarks</li>
                <li>Generate target-product profiles that automatically extract key inputs from the study design, but also allow manual input</li>
                <li>Automate study budgets with built-in assumptions</li>
              </ul>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-lg p-8 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="mr-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700">
                  Scenario Planning
                </h3>
              </div>
              
              <ul className="space-y-3 text-gray-600 ml-6 list-disc">
                <li>Envision alternative scenarios by duplicating, templating, and revising study elements in any permutation</li>
                <li>Assess probability of technical and regulatory success using highly customized benchmarks and flexible user interface</li>
                <li>Create revenue forecasts by providing key assumptions about reimbursement, discounts, and other metrics</li>
                <li>Predict enrollment using customizable assumptions about screening and screen failure rates, geographic footprint, and other variables</li>
              </ul>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-lg p-8 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="mr-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700">
                  AI-assisted Workflows & Documentation
                </h3>
              </div>
              
              <ul className="space-y-3 text-gray-600 ml-6 list-disc">
                <li>Share, route, approve, and audit modifications and approvals while creating a single source of truth for study design</li>
                <li>Extract key elements for portfolio prioritization and otherwise track timelines, budgets, and other cross-study comparisons</li>
                <li>Author and edit documents with push-button ease, extracting inputs from across the platform, establish standardized language that can be used across templates, documents, studies, and programs</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              Confyde's AI-native platform captures all elements of the investment decision process, 
              enabling improved collaboration and scenario planning, while reducing risk of errors, 
              internal inconsistency, and timeline uncertainty
            </p>
          </div>
        </div>
      </div>
      
      {/* Available Tools Section (based on second screenshot) */}
      <div className="pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">        
          <div>
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Why Confyde is Different</h3>
              <p className="text-gray-600">
                Confyde AI provides a comprehensive solution for the most critical and risky phases of 
                clinical trial development - the planning and design stage that occurs before investment 
                decisions are made. Our tools integrate seamlessly with your existing workflow while 
                providing specialized capabilities that other platforms don't address:
              </p>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-md p-4">
                  <h4 className="text-lg font-medium text-gray-700">Pre-Investment Decision</h4>
                  <ul className="mt-2 space-y-1 text-gray-600 ml-6 list-disc">
                    <li>Integrated study design templates</li>
                    <li>Automated protocol development</li>
                    <li>Risk assessment tools</li>
                    <li>Budget forecasting</li>
                    <li>Enrollment projections</li>
                  </ul>
                </div>
                
                <div className="border border-gray-200 rounded-md p-4">
                  <h4 className="text-lg font-medium text-gray-700">Post-Investment Support</h4>
                  <ul className="mt-2 space-y-1 text-gray-600 ml-6 list-disc">
                    <li>Document generation and approval</li>
                    <li>Trial monitoring dashboards</li>
                    <li>Collaborative workflows</li>
                    <li>Real-time performance tracking</li>
                    <li>Resource optimization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-[#0c323d]">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to transform your clinical trials?</span>
            <span className="block text-blue-300">Get started with Confyde AI today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-[#0c323d] bg-white hover:bg-gray-100"
              >
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 bg-opacity-80 hover:bg-opacity-90"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <div className="text-white text-2xl font-bold">Confyde AI</div>
              <p className="text-gray-400 text-base">
                Making clinical trials more efficient, accurate, and successful through innovative AI technology.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-gray-300">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-300">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Solutions</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-gray-300">
                        Study Design
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-gray-300">
                        Enrollment Projection
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-gray-300">
                        Budget Forecasting
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-gray-300">
                        Document Generation
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Support</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-gray-300">
                        Documentation
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-gray-300">
                        API Status
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-gray-300">
                        Contact Us
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Company</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-gray-300">
                        About
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-gray-300">
                        Careers
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-gray-300">
                        Partners
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Legal</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-gray-300">
                        Privacy
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-gray-300">
                        Terms
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 xl:text-center">
              &copy; {new Date().getFullYear()} Confyde AI, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 