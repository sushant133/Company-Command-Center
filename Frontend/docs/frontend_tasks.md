# Fix Smart Alerts in Superadmin Overview - TODO

## Problem
- Smart Alerts in Overview section uses hardcoded `smartAlertData` array instead of live API data.
- The `smartAlertsQuery` fetches real alerts but they are ignored in the UI.

## Steps
1. [x] Create TODO.md (this file)
2. [x] Update `smartAlerts` mapping in `SuperadminWorkspace.jsx` to derive UI fields (type, company name, action, view) from real API alert objects
3. [x] Replace hardcoded `smartAlertData` in `renderOverview()` with the mapped `smartAlerts`
4. [x] Add loading state for Smart Alerts using `smartAlertsQuery.isLoading`
5. [x] Add empty state message when no alerts exist
6. [x] Update active alert count badge to use real data length
7. [x] Verify no syntax errors and basic correctness

