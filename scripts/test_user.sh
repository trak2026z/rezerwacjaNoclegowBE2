#!/bin/zsh
set -e

API="http://localhost:3000"

echo "=== 1. Register new user ==="
curl -s -X POST $API/authentication/register \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","username":"john","password":"Haslo123!"}' | jq .
echo

echo "=== 2. Try registering duplicate user (should fail) ==="
curl -s -X POST $API/authentication/register \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","username":"john","password":"Haslo123!"}' | jq .
echo

echo "=== 3. Login user ==="
LOGIN_RESPONSE=$(curl -s -X POST $API/authentication/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"Haslo123!"}')
echo $LOGIN_RESPONSE | jq .
TOKEN=$(echo $LOGIN_RESPONSE | jq -r .token)
echo "User token: $TOKEN"
echo

echo "=== 4. Check email availability ==="
curl -s -X GET $API/authentication/checkEmail/john@example.com | jq .
curl -s -X GET $API/authentication/checkEmail/other@example.com | jq .
echo

echo "=== 5. Check username availability ==="
curl -s -X GET $API/authentication/checkUsername/john | jq .
curl -s -X GET $API/authentication/checkUsername/otheruser | jq .
echo

echo "=== 6. Get profile (requires token) ==="
curl -s -X GET $API/authentication/profile \
  -H "Authorization: Bearer $TOKEN" | jq .
echo

echo "=== 7. Get public profile (by username) ==="
curl -s -X GET $API/authentication/publicProfile/john | jq .
echo
