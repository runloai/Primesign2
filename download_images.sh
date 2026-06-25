#!/bin/bash

# Create directories
mkdir -p public/images/services/sign-boards
mkdir -p public/images/services/promotional
mkdir -p public/images/services/digital-prints
mkdir -p public/images/services/commercial

BASE="https://primesign.in"

echo "Downloading Sign Board images..."

# Non-light sign boards
for i in 1 2 3 4; do
    curl -s "$BASE/images/nonlightsign/$i.png" -o "public/images/services/sign-boards/nonlight-$i.png"
done

# Acrylic sign boards
for i in 1 2 3 4 5 6; do
    curl -s "$BASE/images/Acyrlic%20Sign%20Board/$i.png" -o "public/images/services/sign-boards/acrylic-$i.png"
done

# PVC & SS
for i in 1 2 3 4 5 6; do
    curl -s "$BASE/images/pvc%26ss/$i.png" -o "public/images/services/sign-boards/pvc-ss-$i.png"
done

# Hoardings
for i in 1 2 3 4 5 6; do
    curl -s "$BASE/images/Hordings/$i.png" -o "public/images/services/sign-boards/hoardings-$i.png"
done

# Glow sign board
curl -s "$BASE/images/Glow%20Sign%20Board/1.jpg" -o "public/images/services/sign-boards/glow-1.jpg"

# Vehicle Branding
for i in 1 2 3 4 5; do
    curl -s "$BASE/images/Vehicle%20Branding/$i.png" -o "public/images/services/sign-boards/vehicle-$i.png" 2>/dev/null || true
done

# Wall Graphics
for i in 1 2 3 4 5; do
    curl -s "$BASE/images/Wall%20Graphics/$i.png" -o "public/images/services/sign-boards/wall-$i.png" 2>/dev/null || true
done

# Promotional tents
for i in 1 2 3 4; do
    curl -s "$BASE/images/promotionaltent/$i.png" -o "public/images/services/promotional/tent-$i.png" 2>/dev/null || true
done

# Roll Up Standees
for i in 1 2 3 4 5; do
    curl -s "$BASE/images/Roll%20Up%20Standees/$i.png" -o "public/images/services/promotional/rollup-$i.png" 2>/dev/null || true
done

# House Sign Boards (for showroom displays)
for i in 1 2 3 4 5; do
    curl -s "$BASE/images/House%20Sign%20Boards/$i.png" -o "public/images/services/sign-boards/house-$i.png" 2>/dev/null || true
done

echo "Download complete!"
ls -la public/images/services/
