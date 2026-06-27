# PrimeSign Testing Checklist

Manual smoke tests before marking any feature as complete.

## Category Sync Tests

- [ ] Add category in admin
- [ ] See it in navbar dropdown
- [ ] See it in Arsenal tabs
- [ ] Add service under that category
- [ ] See that service under correct Arsenal tab
- [ ] See that service in correct navbar dropdown

## Image Tests

- [ ] Add service gallery image
- [ ] Save/publish
- [ ] Hard refresh public site
- [ ] Open service detail modal
- [ ] See the new image

- [ ] Crop service gallery image
- [ ] Save/publish
- [ ] Verify cropped version appears

- [ ] Add service hero image
- [ ] Save/publish
- [ ] Verify Arsenal card thumbnail updates

- [ ] Add portfolio image
- [ ] Set featured
- [ ] Verify Work Gallery shows it prominently

- [ ] Replace About image
- [ ] Save/publish
- [ ] Verify About grid updates

- [ ] Add Advantage benefit image
- [ ] Save/publish
- [ ] Verify Advantage section updates

- [ ] Add/update Advantage grid images (4 boxes)
- [ ] Save/publish
- [ ] Verify Advantage grid updates

## Publish Tests

- [ ] Make changes in admin
- [ ] Click Save
- [ ] Confirm "saved locally" status
- [ ] Click Publish
- [ ] Confirm success message
- [ ] Open PRIVATE browser (no localStorage)
- [ ] Verify changes visible on public site

## Modal Tests

- [ ] Click "Add Service" button
- [ ] Modal opens with Service Name field
- [ ] Modal shows Category dropdown
- [ ] Fill form and submit
- [ ] Modal closes
- [ ] New service appears in list

- [ ] Click "Add Category" button
- [ ] Modal opens with ID and Label fields
- [ ] Fill form and submit
- [ ] Modal closes
- [ ] New category appears in list

## Mobile Tests

- [ ] Open site on mobile viewport
- [ ] Open navbar hamburger menu
- [ ] Click category dropdown
- [ ] Click service item
- [ ] Nav closes
- [ ] Page scrolls to correct service

## Error Cases

- [ ] Try to add empty service name - shows error
- [ ] Try to add category with invalid ID - shows warning
- [ ] Upload oversized image - rejects with message
- [ ] Network failure on publish - shows error message

## Cache Tests

- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Clear localStorage
- [ ] Reload page
- [ ] All content loads from server config
