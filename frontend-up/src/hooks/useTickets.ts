// ============================================
// TICKETS HOOK - Ticket State Management
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Ticket, TicketFilters, SortConfig } from '@/types';
import {
    getAllTickets,
    getTicketById,
    createTicket,
    updateTicket,
    deleteTicket,
    updateTicketStatus,
} from '@/lib/ticket-service';
import { filterTickets, sortTickets } from '@/lib/utils';

interface UseTicketsOptions {
    initialFilters?: TicketFilters;
    initialSort?: SortConfig;
    autoLoad?: boolean;
}

interface UseTicketsReturn {
    tickets: Ticket[];
    filteredTickets: Ticket[];
    isLoading: boolean;
    error: string | null;
    filters: TicketFilters;
    sortConfig: SortConfig;
    selectedTicket: Ticket | null;
    
    // Actions
    loadTickets: () => Promise<void>;
    setFilters: (filters: TicketFilters) => void;
    updateFilter: (key: keyof TicketFilters, value: string) => void;
    clearFilters: () => void;
    setSortConfig: (config: SortConfig) => void;
    toggleSort: (column: keyof Ticket) => void;
    selectTicket: (ticket: Ticket | null) => void;
    getTicket: (id: number) => Promise<Ticket | null>;
    addTicket: (ticket: Omit<Ticket, 'id'>) => Promise<Ticket | null>;
    editTicket: (id: number, updates: Partial<Ticket>) => Promise<boolean>;
    removeTicket: (id: number) => Promise<boolean>;
    changeStatus: (id: number, status: Ticket['status']) => Promise<boolean>;
}

const defaultFilters: TicketFilters = {
    id: '',
    title: '',
    status: '',
    assignedTo: '',
    completionBy: '',
    priority: '',
    module: '',
    dateFrom: '',
    dateTo: '',
};

const defaultSort: SortConfig = {
    column: 'id',
    direction: 'asc',
};

export function useTickets(options: UseTicketsOptions = {}): UseTicketsReturn {
    const {
        initialFilters = defaultFilters,
        initialSort = defaultSort,
        autoLoad = true,
    } = options;
    
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFiltersState] = useState<TicketFilters>(initialFilters);
    const [sortConfig, setSortConfigState] = useState<SortConfig>(initialSort);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    
    // Load tickets
    const loadTickets = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getAllTickets();
            if (response.success && response.data) {
                setTickets(response.data);
            } else {
                setError(response.error || 'Failed to load tickets');
            }
        } catch (err) {
            setError('An error occurred while loading tickets');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    // Auto load on mount
    useEffect(() => {
        if (autoLoad) {
            loadTickets();
        }
    }, [autoLoad, loadTickets]);
    
    // Filtered and sorted tickets
    const filteredTickets = useMemo(() => {
        let result = filterTickets(tickets, filters);
        result = sortTickets(result, sortConfig);
        return result;
    }, [tickets, filters, sortConfig]);
    
    // Set filters
    const setFilters = useCallback((newFilters: TicketFilters) => {
        setFiltersState(newFilters);
    }, []);
    
    // Update single filter
    const updateFilter = useCallback((key: keyof TicketFilters, value: string) => {
        setFiltersState(prev => ({ ...prev, [key]: value }));
    }, []);
    
    // Clear all filters
    const clearFilters = useCallback(() => {
        setFiltersState(defaultFilters);
    }, []);
    
    // Set sort config
    const setSortConfig = useCallback((config: SortConfig) => {
        setSortConfigState(config);
    }, []);
    
    // Toggle sort direction or change column
    const toggleSort = useCallback((column: keyof Ticket) => {
        setSortConfigState(prev => ({
            column,
            direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    }, []);
    
    // Select a ticket
    const selectTicket = useCallback((ticket: Ticket | null) => {
        setSelectedTicket(ticket);
    }, []);
    
    // Get single ticket
    const getTicket = useCallback(async (id: number): Promise<Ticket | null> => {
        const response = await getTicketById(id);
        if (response.success && response.data) {
            return response.data;
        }
        return null;
    }, []);
    
    // Add new ticket
    const addTicket = useCallback(async (ticketData: Omit<Ticket, 'id'>): Promise<Ticket | null> => {
        const response = await createTicket(ticketData);
        if (response.success && response.data) {
            setTickets(prev => [...prev, response.data!]);
            return response.data;
        }
        return null;
    }, []);
    
    // Edit ticket
    const editTicket = useCallback(async (id: number, updates: Partial<Ticket>): Promise<boolean> => {
        const response = await updateTicket(id, updates);
        if (response.success && response.data) {
            setTickets(prev => prev.map(t => t.id === id ? response.data! : t));
            if (selectedTicket?.id === id) {
                setSelectedTicket(response.data);
            }
            return true;
        }
        return false;
    }, [selectedTicket]);
    
    // Remove ticket
    const removeTicket = useCallback(async (id: number): Promise<boolean> => {
        const response = await deleteTicket(id);
        if (response.success) {
            setTickets(prev => prev.filter(t => t.id !== id));
            if (selectedTicket?.id === id) {
                setSelectedTicket(null);
            }
            return true;
        }
        return false;
    }, [selectedTicket]);
    
    // Change ticket status
    const changeStatus = useCallback(async (id: number, status: Ticket['status']): Promise<boolean> => {
        const response = await updateTicketStatus(id, status);
        if (response.success && response.data) {
            setTickets(prev => prev.map(t => t.id === id ? response.data! : t));
            return true;
        }
        return false;
    }, []);
    
    return {
        tickets,
        filteredTickets,
        isLoading,
        error,
        filters,
        sortConfig,
        selectedTicket,
        loadTickets,
        setFilters,
        updateFilter,
        clearFilters,
        setSortConfig,
        toggleSort,
        selectTicket,
        getTicket,
        addTicket,
        editTicket,
        removeTicket,
        changeStatus,
    };
}
