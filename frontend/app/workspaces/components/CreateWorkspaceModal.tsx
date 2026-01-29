'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { api } from '../../lib/api';
import { BackgroundSelector } from './BackgroundSelector';
import { CurrencySelector } from './CurrencySelector';
import { ServiceIntegrationSuggestions } from './ServiceIntegrationSuggestions';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PREDEFINED_ICONS = ['🏢', '💼', '🚀', '⭐', '💰', '📊', '🎯', '🏆', '💡', '🔧'];

const AVAILABLE_BACKGROUNDS = [
  'ferdinand-stohr-W1FIkdPAB7E-unsplash.jpg',
  'johny-goerend-McSOHojERSI-unsplash.jpg',
  'lightscape-LtnPejWDSAY-unsplash.jpg',
  'michael-fousert-0962p7mcux4-unsplash.jpg',
  'michael-fousert-lE5-z4nTCTQ-unsplash.jpg',
  'mikita-karasiou--67uQbVmZ-A-unsplash.jpg',
  'pascal-debrunner-LKOuYT5_dyw-unsplash.jpg',
  'valdemaras-d-khbjgGAerPU-unsplash.jpg',
  'vidar-nordli-mathisen-641pLhGEEyg-unsplash.jpg',
  'vidar-nordli-mathisen-Oeatf3IQp7w-unsplash.jpg',
];

export function CreateWorkspaceModal({ isOpen, onClose, onSuccess }: CreateWorkspaceModalProps) {
  const { switchWorkspace, refreshWorkspaces } = useWorkspace();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🏢');
  const [selectedBackground, setSelectedBackground] = useState<string | null>(
    AVAILABLE_BACKGROUNDS[0],
  );
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [createdWorkspaceId, setCreatedWorkspaceId] = useState<string | null>(null);

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      toast.error('Workspace name is required');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleCreateWorkspace = async () => {
    if (!name.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/workspaces', {
        name: name.trim(),
        description: description.trim() || undefined,
        icon: selectedIcon,
        backgroundImage: selectedBackground,
        currency: selectedCurrency,
      });

      setCreatedWorkspaceId(response.data.id);
      toast.success('Workspace created successfully');
      return response.data.id;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create workspace');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleFinishFromStep2 = async () => {
    try {
      const workspaceId = await handleCreateWorkspace();
      if (workspaceId) {
        // Set the new workspace as current before closing
        await switchWorkspace(workspaceId);
        await refreshWorkspaces();
        resetForm();
        onSuccess();
        onClose();
      }
    } catch (error) {
      // Error already handled in handleCreateWorkspace
    }
  };

  const handleProceedToStep3 = async () => {
    try {
      const workspaceId = await handleCreateWorkspace();
      if (workspaceId) {
        // Set the new workspace as current before proceeding to integrations
        await switchWorkspace(workspaceId);
        await refreshWorkspaces();
        setStep(3);
      }
    } catch (error) {
      // Error already handled in handleCreateWorkspace
    }
  };

  const handleSkipIntegrations = async () => {
    // Workspace is already switched in handleProceedToStep3
    resetForm();
    onSuccess();
    onClose();
  };

  const resetForm = () => {
    setStep(1);
    setName('');
    setDescription('');
    setSelectedIcon('🏢');
    setSelectedBackground(AVAILABLE_BACKGROUNDS[0]);
    setSelectedCurrency(null);
    setCreatedWorkspaceId(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header with Step Indicator */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Create New Workspace
            </h2>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    s <= step ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
              <span>Basic Info</span>
              <span>Customization</span>
              <span>Integrations</span>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Workspace Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="My Workspace"
                  maxLength={255}
                  autoFocus
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="What is this workspace for?"
                  maxLength={500}
                  rows={3}
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <div className="flex gap-2 flex-wrap">
                  {PREDEFINED_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      className={`w-12 h-12 text-2xl rounded-lg border-2 transition-all ${
                        selectedIcon === icon
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                          : 'border-gray-300 dark:border-gray-600 hover:border-indigo-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Currency and Background */}
          {step === 2 && (
            <div className="space-y-6">
              <CurrencySelector
                selectedCurrency={selectedCurrency}
                onSelect={setSelectedCurrency}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Background Image
                </label>
                <BackgroundSelector
                  selectedBackground={selectedBackground}
                  onSelect={setSelectedBackground}
                  backgrounds={AVAILABLE_BACKGROUNDS}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-between pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleFinishFromStep2}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {loading ? 'Creating...' : 'Skip Integrations'}
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToStep3}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {loading ? 'Creating...' : 'Next'}
                    {!loading && <ChevronRight size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Service Integrations */}
          {step === 3 && createdWorkspaceId && (
            <ServiceIntegrationSuggestions
              workspaceId={createdWorkspaceId}
              onSkip={handleSkipIntegrations}
            />
          )}
        </div>
      </div>
    </div>
  );
}
