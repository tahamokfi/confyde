import React from 'react';

/**
 * Generic input change handler for form fields
 * @param setFormData Function to update form state
 * @param formData Current form data state
 */
export const handleInputChange = <T extends Record<string, any>>(
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  formData: T
) => {
  const { name, value } = e.target;
  setFormData({ ...formData, [name]: Number.isNaN(Number(value)) ? value : Number(value) });
};

/**
 * Handle array input changes for comma-separated values
 * @param setFormData Function to update form state
 * @param formData Current form data state
 */
export const handleArrayInputChange = <T extends Record<string, any>>(
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  formData: T
) => {
  const { name, value } = e.target;
  const arrayValues = value.split(',').map(item => parseFloat(item.trim())).filter(num => !isNaN(num));
  setFormData({ ...formData, [name]: arrayValues });
};

/**
 * Handle slider input changes
 * @param setFormData Function to update form state
 * @param formData Current form data state
 */
export const handleSliderChange = <T extends Record<string, any>>(
  e: React.ChangeEvent<HTMLInputElement>,
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  formData: T
) => {
  const { name, value } = e.target;
  setFormData({ ...formData, [name]: parseFloat(value) });
};

/**
 * Handle simple string input changes
 * @param setValue Function to update state value
 */
export const handleStringChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  setValue: React.Dispatch<React.SetStateAction<string>>
) => {
  setValue(e.target.value);
};

/**
 * Handle simple numeric input changes
 * @param setValue Function to update state value
 */
export const handleNumberChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setValue: React.Dispatch<React.SetStateAction<string>>
) => {
  setValue(e.target.value);
}; 