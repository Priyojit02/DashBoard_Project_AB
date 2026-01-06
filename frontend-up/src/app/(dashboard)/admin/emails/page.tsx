// ============================================
// EMAIL MANAGEMENT PAGE - Admin Only
// ============================================

'use client';

import { useState } from 'react';
import { useBackendEmails } from '@/hooks/useBackend';
import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export default function EmailManagementPage() {
  const {
    stats,
    recentEmails,
    unprocessedEmails,
    isLoading,
    error,
    triggerFetch,
    reprocessEmail,
    refresh,
  } = useBackendEmails();

  const [isFetching, setIsFetching] = useState(false);
  const [fetchDays, setFetchDays] = useState(1);
  const [fetchMax, setFetchMax] = useState(100);
  const [fetchResult, setFetchResult] = useState<any>(null);

  const handleTriggerFetch = async () => {
    setIsFetching(true);
    setFetchResult(null);
    try {
      const result = await triggerFetch(fetchDays, fetchMax);
      setFetchResult(result);
    } finally {
      setIsFetching(false);
    }
  };

  const handleReprocess = async (emailId: number) => {
    await reprocessEmail(emailId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Processing</h1>
          <p className="text-gray-500 mt-1">
            Fetch and process SAP-related emails to create tickets automatically
          </p>
        </div>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Emails</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">{stats.processed}</div>
              <div className="text-sm text-gray-500">Processed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{stats.sap_related}</div>
              <div className="text-sm text-gray-500">SAP Related</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-[#D04A02]">{stats.tickets_created}</div>
              <div className="text-sm text-gray-500">Tickets Created</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
              <div className="text-sm text-gray-500">Errors</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manual Fetch Section */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Email Fetch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Days Back
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={fetchDays}
                onChange={(e) => setFetchDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D04A02] focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Emails
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={fetchMax}
                onChange={(e) => setFetchMax(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D04A02] focus:border-transparent"
              />
            </div>
            <button
              onClick={handleTriggerFetch}
              disabled={isFetching}
              className="px-6 py-2 bg-[#D04A02] text-white rounded-lg hover:bg-[#b84102] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isFetching && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isFetching ? 'Fetching...' : 'Fetch & Process Emails'}
            </button>
          </div>

          {fetchResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Fetch Results:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Fetched:</span>{' '}
                  <span className="font-medium">{fetchResult.fetched || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Analyzed:</span>{' '}
                  <span className="font-medium">{fetchResult.analyzed || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">SAP Related:</span>{' '}
                  <span className="font-medium">{fetchResult.sap_related || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Tickets Created:</span>{' '}
                  <span className="font-medium text-green-600">{fetchResult.tickets_created || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Skipped:</span>{' '}
                  <span className="font-medium">{fetchResult.skipped || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Errors:</span>{' '}
                  <span className="font-medium text-red-600">{fetchResult.errors || 0}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Emails */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Processed Emails</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEmails.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent emails</p>
            ) : (
              <div className="space-y-3">
                {recentEmails.map((email: any) => (
                  <div key={email.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{email.subject}</p>
                        <p className="text-sm text-gray-500">{email.from_address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {email.is_sap_related ? (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                            {email.detected_category || 'SAP'}
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">
                            Not SAP
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                      <span>{formatDate(email.received_at)}</span>
                      {email.ticket_created_id && (
                        <span className="text-[#D04A02]">Ticket #{email.ticket_created_id}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unprocessed Emails */}
        <Card>
          <CardHeader>
            <CardTitle>Unprocessed Emails ({unprocessedEmails.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {unprocessedEmails.length === 0 ? (
              <p className="text-gray-500 text-center py-4">All emails processed!</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {unprocessedEmails.map((email: any) => (
                  <div key={email.id} className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{email.subject}</p>
                        <p className="text-sm text-gray-500">{email.from_address}</p>
                      </div>
                      <button
                        onClick={() => handleReprocess(email.id)}
                        className="ml-2 px-3 py-1 text-sm bg-[#D04A02] text-white rounded hover:bg-[#b84102] transition-colors"
                      >
                        Process
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Received: {formatDate(email.received_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Email Processing Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">1. Fetch Emails</h3>
              <p className="text-sm text-gray-500 mt-1">
                Emails are fetched from the IMAP server daily
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">2. LLM Analysis</h3>
              <p className="text-sm text-gray-500 mt-1">
                AI analyzes if email is SAP-related (MM, SD, FICO, etc.)
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">3. Classification</h3>
              <p className="text-sm text-gray-500 mt-1">
                Detects SAP module and priority level
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#D04A02]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#D04A02]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">4. Create Ticket</h3>
              <p className="text-sm text-gray-500 mt-1">
                Automatically creates support ticket in DB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
