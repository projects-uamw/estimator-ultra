import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { DEFAULT_SETTINGS, calculateEstimate } from '../utils/calculations';

const EstimatorContext = createContext();

export const useEstimator = () => {
    const context = useContext(EstimatorContext);
    if (!context) {
        throw new Error('useEstimator must be used within an EstimatorProvider');
    }
    return context;
};

export const EstimatorProvider = ({ children }) => {
    // Persistence
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('metalwork_settings');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    });

    const [projectInfo, setProjectInfo] = useState({
        projectName: '',
        clientName: '',
        address: '',
        estimateNumber: `EST-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        date: new Date().toISOString().split('T')[0],
        preparedBy: '',
        scopeSummary: '',
        notes: '',
    });

    const [materials, setMaterials] = useState([]);
    const [isQuickMode, setIsQuickMode] = useState(false);
    const [quickMaterialTotal, setQuickMaterialTotal] = useState(0);

    const [options, setOptions] = useState({
        fabComplexity: 2,
        instComplexity: 2,
        hasSpecialFinish: false,
        hasRental: false,
        finishType: '',
        rentalType: '',
        finishOverride: null,
        rentalOverride: null,
        equipmentRental: 0,
        scope: 'full',
        commissionRateOverride: null,
    });

    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('metalwork_users');
        return saved ? JSON.parse(saved) : ['Admin', 'Sales 1'];
    });

    const [currentUserId, setCurrentUserId] = useState(() => {
        return localStorage.getItem('metalwork_current_user') || 'Admin';
    });

    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('metalwork_history');
        return saved ? JSON.parse(saved) : [];
    });

    // Persist settings
    useEffect(() => {
        localStorage.setItem('metalwork_settings', JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        localStorage.setItem('metalwork_users', JSON.stringify(users));
        localStorage.setItem('metalwork_current_user', currentUserId);
    }, [users, currentUserId]);

    useEffect(() => {
        localStorage.setItem('metalwork_history', JSON.stringify(history));
    }, [history]);

    const addToHistory = (estimateData) => {
        const newEntry = {
            id: `EST-${Date.now()}`,
            timestamp: new Date().toLocaleString(),
            projectInfo: { ...projectInfo },
            materials: [...materials],
            options: { ...options },
            estimate: estimateData
        };
        setHistory(prev => [newEntry, ...prev]);
        return newEntry.id;
    };

    // Derived calculation
    const estimate = useMemo(() => {
        const effectiveMaterials = isQuickMode
            ? [{ quantity: 1, unitCost: quickMaterialTotal, description: 'Quick Mode Total' }]
            : materials;

        return calculateEstimate(effectiveMaterials, settings, options);
    }, [materials, quickMaterialTotal, isQuickMode, settings, options]);

    const value = {
        settings,
        setSettings,
        projectInfo,
        setProjectInfo,
        materials,
        setMaterials,
        isQuickMode,
        setIsQuickMode,
        quickMaterialTotal,
        setQuickMaterialTotal,
        options,
        setOptions,
        users,
        setUsers,
        currentUserId,
        setCurrentUserId,
        estimate,
        history,
        setHistory,
        addToHistory
    };

    return (
        <EstimatorContext.Provider value={value}>
            {children}
        </EstimatorContext.Provider>
    );
};
