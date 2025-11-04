# Changelog

## Recent Updates

### Budget System Improvements

#### UI/UX Enhancements
- **Cash Register Style Input**: Value inputs now work like a cash register
  - Type digits to add cents (e.g., type "1234" → displays "R$ 12,34")
  - First 2 digits go into cents
  - Backspace removes last digit
  - Always displays in Brazilian currency format (R$ X,XX)
  - Input fields are read-only text inputs with keyboard handling
  - Saves only on blur (no lag while typing)

- **Mode Selection**: Changed from button group to dropdown select
  - Cleaner, more compact UI
  - Less overwhelming interface
  - Inline display with delete button

- **Delete Functionality**:
  - Delete button (✕) always visible (not hover-only)
  - Positioned next to mode dropdown for easy access
  - Smart deletion for recurring/installment budgets:
    - Converts all past months to "unique" mode
    - Creates missing past months retroactively as "unique" budgets
    - Deletes current month and all future months
    - Example: Delete recurring budget in May → Jan-Apr become "unique", May+ deleted

- **Placeholder Improvement**: Empty fields show light gray placeholder "R$ 0,00" to distinguish from actual values

- **Currency Formatting**: All totals display in proper Brazilian format using `toLocaleString('pt-BR')`

#### Behavioral Changes
- **Main Categories Read-Only**:
  - Main categories cannot have budget values
  - Only subcategories can be budgeted
  - Main categories display sum of all subcategories

- **Installment Display**:
  - Shows per-month value in input
  - Stores total value in database
  - E.g., R$100/month for 12 months stores R$1200

### Transaction System Updates

#### Simplified Modes
- **Removed Recurring Mode**:
  - Transactions now support only 2 modes: Único and Parcelado
  - Reasoning: Transactions are historical events, not plans
  - Recurring patterns belong in budgets, not transaction logs

### Technical Improvements

#### Database
- **Schema Version 2**: Added proper indexes for `mode` field and compound `[year+month]` index
- **Bulk Operations**: Delete operations now use `bulkDelete` for better performance

#### State Management
- **Separate Display State**: Budget inputs maintain separate focused/unfocused state to prevent value erasure
- **Optimized Refresh**: Budget page only triggers `copyRecurrentBudgets` on actual month changes, not on state refreshes

#### Code Quality
- **Type Safety**: Proper TypeScript types for all budget operations
- **Error Handling**: Graceful handling of missing or malformed budget data
- **Console Logging**: Helpful debug messages for delete operations

---

## Documentation Updates

### Updated Files
1. **`docs/technical-context.md`**:
   - Updated transaction modes (2 instead of 3)
   - Added cash register input documentation
   - Added delete functionality documentation
   - Updated budget mode UI description
   - Clarified subcategory-only budgeting
   - Updated implementation examples

2. **`docs/product-context.md`**:
   - Updated transaction modes description
   - Added cash register input to ease-of-use features
   - Added delete button behavior
   - Clarified subcategory-only budgeting approach

3. **`docs/CHANGELOG.md`** (this file):
   - Created to track major changes and updates

---

## Migration Notes

### For Existing Users
- **No Breaking Changes**: All existing budgets continue to work
- **Legacy Support**: Old `isRecurrent` field is automatically migrated to `mode: 'recurring'`
- **Main Category Budgets**: Any existing main category budgets remain but cannot be edited; create subcategory budgets instead

### Database Schema
```typescript
// Before (v1)
budgets: '++id, year, month, type, sourceId, groupId, subgroupId'

// After (v2)
budgets: '++id, year, month, type, mode, sourceId, groupId, subgroupId, [year+month]'
```

---

## Known Issues & Limitations

None currently reported. The system is stable and all features are working as expected.

---

## Next Steps / Future Enhancements

Potential improvements to consider:
- [ ] Add undo functionality for delete operations
- [ ] Batch edit for multiple budgets at once
- [ ] Copy budget from previous month
- [ ] Budget templates (e.g., "Summer vacation month")
- [ ] Visual indicators for budget mode (icons/colors)
- [ ] Keyboard shortcuts for faster navigation
