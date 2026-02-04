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

const API_BASE = 'http://127.0.0.1:8000';

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

    const [users, setUsers] = useState(['Admin']);
    const [currentUserId, setCurrentUserId] = useState('Admin');
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Load from Backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, historyRes] = await Promise.all([
                    fetch(`${API_BASE}/users/`),
                    fetch(`${API_BASE}/history/`)
                ]);

                if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    if (usersData.length > 0) {
                        setUsers(usersData.map(u => u.name));
                        const savedUser = localStorage.getItem('metalwork_current_user');
                        if (savedUser && usersData.find(u => u.name === savedUser)) {
                            setCurrentUserId(savedUser);
                        } else {
                            setCurrentUserId(usersData[0].name);
                        }
                    }
                }

                if (historyRes.ok) {
                    const historyData = await historyRes.json();
                    setHistory(historyData.map(h => ({
                        ...JSON.parse(h.state_json),
                        id: h.id,
                        timestamp: h.timestamp
                    })));
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Persist settings locally
    useEffect(() => {
        localStorage.setItem('metalwork_settings', JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        localStorage.setItem('metalwork_current_user', currentUserId);
    }, [currentUserId]);

    const addUser = async (name) => {
        try {
            const res = await fetch(`${API_BASE}/users/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            if (res.ok) {
                const newUser = await res.json();
                setUsers(prev => [...prev, newUser.name]);
                return true;
            }
        } catch (error) {
            console.error("Error adding user:", error);
        }
        return false;
    };

    const deleteUser = async (name) => {
        try {
            const usersRes = await fetch(`${API_BASE}/users/`);
            const usersData = await usersRes.json();
            const user = usersData.find(u => u.name === name);
            if (user) {
                const res = await fetch(`${API_BASE}/users/${user.id}`, { method: 'DELETE' });
                if (res.ok) {
                    setUsers(prev => prev.filter(u => u !== name));
                    if (currentUserId === name) setCurrentUserId(users[0] || 'Admin');
                }
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const addToHistory = async (estimateData) => {
        const id = `EST-${Date.now()}`;
        const timestamp = new Date().toLocaleString();
        const newEntry = {
            id,
            timestamp,
            projectInfo: { ...projectInfo },
            materials: [...materials],
            options: { ...options },
            estimate: estimateData
        };

        try {
            const res = await fetch(`${API_BASE}/history/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    timestamp,
                    project_name: projectInfo.projectName || 'Untitled',
                    client_name: projectInfo.clientName || 'N/A',
                    prepared_by: currentUserId,
                    total_price: estimateData.variants.fair.totalSellingPrice,
                    state_json: JSON.stringify(newEntry)
                })
            });
            if (res.ok) {
                setHistory(prev => [newEntry, ...prev]);
            }
        } catch (error) {
            console.error("Error saving history:", error);
        }
        return id;
    };

    const deleteHistoryEntry = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setHistory(prev => prev.filter(h => h.id !== id));
            }
        } catch (error) {
            console.error("Error deleting history:", error);
        }
    }

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
        addUser,
        deleteUser,
        currentUserId,
        setCurrentUserId,
        estimate,
        history,
        isLoading,
        setHistory,
        addToHistory,
        deleteHistoryEntry
    };

    return (
        <EstimatorContext.Provider value={value}>
            {children}
        </EstimatorContext.Provider>
    );
};
